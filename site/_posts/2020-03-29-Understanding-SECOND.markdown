---
layout: post
title: Understanding SECOND
---

# SECOND (Sparsely Embedded Convolutional Detection)  

by Andrew Dodd and Dean Goldman  

This paper is targeted towards people interested in studying and applying deep learning architectures who may not have much experience reading whitepapers published on arxiv, like SECOND. This blog post walks through the SECOND paper, and attempts to reiterate each of its components in an accesible fashion.

## Overview:

SECOND is a deep learning architecture for object detection from point cloud data. The point cloud data comes from LiDAR (Light Detection And Ranging), a method of measuring light that has been pulsed outwards from a laser at a central point, reflected off the world, and bounced back into a detector at the initial central point. The SECOND model is trained on the KITTI Vision Benchmark Suite, a common open source LiDAR dataset. Each point cloud space describes a 3D space generally depicting a road with cars, cyclists, and pedestrians. It has an associated set of labels:
- The bounding boxes of objects in the space.
  - The x, y, z coordinates of the object's center.
  - The length (l), width (w), and depth (d) of the bounding box.
  - The yaw (z-axis rotation) of the bounding box.
- The classification of each object in the space
  - One-hot encoded variable for car, cyclist, pedestrian (or more, depending on dataset used)
- Each object's orientation in space.
  - One-hot encoded variable describing the orientation of the box: Is the front of the box facing away or towards the central point?
 
 SECOND uses a network of point sampling methods, voxelization, sparse 3D and 2D convolution layers, and dense layers to predict the above labels. The network looks like this:

 (insert graphic of network)

 in terms of its Input, Output, and Algorithm.

## Preprocessing

Input: Points  

$$\begin{pmatrix}
x_{1} & y_{1} & z_{1} & r_{1}\\
\end{pmatrix}$$

Output: Voxels  
Each voxel is of dimension $$( Point Features * Max Occupancy )$$  
In this case each point has four dimensions: an x, y, z, and reflectivity (r). Letting the maximum occupancy per voxel = 5, we'd have the following matrix representation of a voxel.  

$$\begin{pmatrix}
x_{1} & y_{1} & z_{1} & r_{1}\\
x_{2} & y_{2} & z_{2} & r_{2}\\
x_{3} & y_{3} & z_{3} & r_{3}\\
x_{4} & y_{4} & z_{4} & r_{4}\\
x_{5} & y_{5} & z_{5} & r_{5}\\
\end{pmatrix}$$ 

Since generally, point cloud data aren't that closely clustered compared to the number of voxels being used, the voxels will generally have just one or two points in them.  

$$\begin{pmatrix}
x_{1} & y_{1} & z_{1} & r_{1}\\
0.0 & 0.0 & 0.0 & 0.0\\
0.0 & 0.0 & 0.0 & 0.0\\
0.0 & 0.0 & 0.0 & 0.0\\
0.0 & 0.0 & 0.0 & 0.0\\
\end{pmatrix}$$ 

Algorithm: Uses spconv to generate voxels from given points, parameters are
- Voxel size: Size of individual voxel
- Grid bounds: Boundary limit for points to include in voxel space
- Max voxels: Maximum number of voxels allowed in algorithm
- Max occupancy: Limit of points to include in a single voxel


## Voxel Feature Extractor
Input:
- Features: Voxels
- Occupancy: Number of points per voxel.

Output:
- Voxel Feature Extractions: Mean of all _non-zero_ points within voxel (number of voxels, point features). All items in batch are concatenated. X1 (18000 x 4) + X2 (18000 x 4) = VFE (36000 x 4)
  

$$\begin{pmatrix}
\overline{x_{voxel[0]}^{batch[0]}} \
& \overline{y_{voxel[0]}^{batch[0]}} \
& \overline{z_{voxel[0]}^{batch[0]}} \
& \overline{r_{voxel[0]}^{batch[0]}}\\
\overline{x_{voxel[1]}^{batch[0]}} \
& \overline{y_{voxel[1]}^{batch[0]}} \
& \overline{z_{voxel[1]}^{batch[0]}} \
& \overline{r_{voxel[1]}^{batch[0]}}
\end{pmatrix}$$  
$$...$$  
$$\begin{pmatrix}
\overline{x_{voxel[v-1]}^{batch[n]}} \
& \overline{y_{voxel[v-1]}^{batch[n]}} \
& \overline{z_{voxel[v-1]}^{batch[n]}} \
& \overline{r_{voxel[v-1]}^{batch[n]}}\\
\overline{x_{voxel[v]}^{batch[n]}} \
& \overline{y_{voxel[v]}^{batch[n]}} \
& \overline{z_{voxel[v]}^{batch[n]}} \
& \overline{r_{voxel[v]}^{batch[n]}}
\end{pmatrix}$$  


Algorithm:  
Computes mean of non-zero points within voxel.

Code:

    def forward(self, feature, occupancy):
        """
        :feature FloatTensor of shape (N, K, C)
        :return FloatTensor of shape (N, C)
        """
        denominator = occupancy.type_as(feature).view(-1, 1)
        feature = (feature.sum(1) / denominator).contiguous()
        return feature

Note:  

VoxelNet and SECOND add a second step to this: A VFE layer takes all points in the same voxel as input and uses a FCN consisting of a linear layer, BatchNorm, and ReLu layer to extact point-wise features, and the uses elementwise max pooling to obtain "locally aggregated" fatures for each voxel, and concatenates that to the point-wise features. The current PV-RCNN code doesnt seem to do that at this time.

The FCN results in a sparse 4D tensor:  

$$\begin{pmatrix}
C_{0} & D_{0} & H_{0} & W_{0}\\
& ...\\
C_{v} & D_{v} & H_{v} & W_{v}
\end{pmatrix}$$   

where $$C_{v}$$ is the vector of point-wise + locally aggregated feature extraction.


## Convolutional Middle Layer 
Input:
- Voxel Feature Extractions: The Means of non-zero points per voxel!
- Coordinates: Where the Voxel is! (batch index, i, j, k as voxel space indices) 

Output:  
- Features from Convolution Middle Layer: (batch_size, 128, 200, 176)

Algorithm:  
This layer is a network of convolutional blocks for 3D tensors. The initial block is of dimension $$(41, 1600, 1408)$$ and represents the total number of potential voxels within the voxel space of the LiDAR detection ($$41 * 1600 * 1408 = 92,364,800$$). Out of the ~ 92 million voxels, there are relatively very few non-empty voxels. This is what characterizes the network as "sparse".

As the voxels and their features enter the convolution block, they are reshaped by the convolutional filter roughly following this pattern.

<script type="text/tikz">



  \begin{tikzpicture}
  \begin{scope}[
            yshift=-83,every node/.append style={
            yslant=0.5,xslant=-1},yslant=0.5,xslant=-1
            ]
        % opacity to prevent graphical interference
        \fill[white,fill opacity=0.9] (0,0) rectangle (5,5);
        \draw[step=4mm, black] (0,0) grid (5,5); %defining grids
        \draw[step=1mm, red!50,thin] (3,1) grid (4,2);  %Nested Grid
        \draw[black,very thick] (0,0) rectangle (5,5);%marking borders
        \fill[red] (0.05,0.05) rectangle (0.35,0.35);
        %Idem as above, for the n-th grid:
    \end{scope}
      
    \begin{scope}[
      yshift=0,every node/.append style={
          yslant=0.5,xslant=-1},yslant=0.5,xslant=-1
                   ]
        \fill[white,fill opacity=.9] (0,0) rectangle (5,5);
        \draw[black,very thick] (0,0) rectangle (5,5);
        \draw[step=5mm, black] (0,0) grid (5,5);
    \end{scope}
      
    \begin{scope}[
      yshift=90,every node/.append style={
      yslant=0.5,xslant=-1},yslant=0.5,xslant=-1
                   ]
      \fill[white,fill opacity=.9] (0,0) rectangle (5,5);
      \draw[step=10mm, black] (1,1) grid (4,4);
      \draw[black,very thick] (1,1) rectangle (4,4);
      \draw[black,dashed] (0,0) rectangle (5,5);
    \end{scope}
      
    \begin{scope}[
      yshift=170,every node/.append style={
          yslant=0.5,xslant=-1},yslant=0.5,xslant=-1
        ]
        \fill[white,fill opacity=0.6] (0,0) rectangle (5,5);
        \draw[step=10mm, black] (2,2) grid (5,5);
        \draw[step=2mm, green] (2,2) grid (3,3);
        \draw[black,very thick] (2,2) rectangle (5,5);
        \draw[black,dashed] (0,0) rectangle (5,5);
    \end{scope}
      
    \begin{scope}[
        yshift=-170,every node/.append style={
        yslant=0.5,xslant=-1},yslant=0.5,xslant=-1
                  ]
        %marking border
        \draw[black,very thick] (0,0) rectangle (5,5);

        %drawing corners (P1,P2, P3): only 3 points needed to define a plane.
        \draw [fill=lime](0,0) circle (.1) ;
        \draw [fill=lime](0,5) circle (.1);
        \draw [fill=lime](5,0) circle (.1);
        \draw [fill=lime](5,5) circle (.1);

        %drawing bathymetric hypotetic countours on the bottom grid:      
        \draw [ultra thick](0,1) parabola bend (2,2) (5,1)  ;
        \draw [dashed] (0,1.5) parabola bend (2.5,2.5) (5,1.5) ;
        \draw [dashed] (0,2) parabola bend (2.7,2.7) (5,2)  ;
        \draw [dashed] (0,2.5) parabola bend (3.5,3.5) (5,2.5)  ;
        \draw [dashed] (0,3.5)  parabola bend (2.75,4.5) (5,3.5);
        \draw [dashed] (0,4)  parabola bend (2.75,4.8) (5,4);
        \draw [dashed] (0,3)  parabola bend (2.75,3.8) (5,3);
        \draw[-latex,thick](2.8,1)node[right]{$\mathsf{Shoreline}$}
                 to[out=180,in=270] (2,1.99);
    \end{scope} %end of drawing grids

    %putting arrows and labels:
    \draw[-latex,thick] (6.2,2) node[right]{$\mathsf{Bathymetry}$}
         to[out=180,in=90] (4,2);

    \draw[-latex,thick](5.8,-.3)node[right]{$\mathsf{Comp.\ G.}$}
        to[out=180,in=90] (3.9,-1);

    \draw[-latex,thick](5.9,5)node[right]{$\mathsf{Wind\ G.}$}
        to[out=180,in=90] (3.6,5);

    \draw[-latex,thick](5.9,8.4)node[right]{$\mathsf{Friction\ G.}$}
        to[out=180,in=90] (3.2,8);

    \draw[-latex,thick,red](5.3,-4.2)node[right]{$\mathsf{G. Cell}$}
        to[out=180,in=90] (0,-2.5);

    \draw[-latex,thick,red](4.3,-1.9)node[right]{$\mathsf{Nested\ G.}$}
        to[out=180,in=90] (2,-.5);

    \draw[-latex,thick](4,-6)node[right]{$\mathsf{Batymetry}$}
        to[out=180,in=90] (2,-5); 
    %drawing points on grid's conrners.
    \fill[black,font=\footnotesize]
        (-5,-4.3) node [above] {$P_{1}$}
        (-.3,-5.6) node [below] {$P_{2}$}
        (5.5,-4) node [above] {$P_{3}$};
  \end{tikzpicture}


</script>

$$\begin{bmatrix}
41 & 1600 & 1408\\
21 & 800  & 704\\
11 & 400  & 352\\
5  & 200  & 176\\
\end{bmatrix}$$ 
$$\begin{bmatrix}
15347 & 4\\
15347  & 16\\
30190  & 32\\
19501  & 64\\
9225  & 64\\
\end{bmatrix}$$  

Sends to spconv.__init__.SparseConvTensor (x)
 into SpMiddleFHD(SparseCNNBase) calls make_blocks ->
 spconv.modules.SparseSequential(
   spconv.SubMConv3d,
   nn.BatchNorm1d,
   nn.ReLU()
 )

Resulting in 128 channels, 200 (1600/8), 176 (1408/8) per item in batch

Sent to create BEV: (N (batch items), C * D as feature vector (collapsing z-dimension), H x W as BEV map.

## Regional Proposal Network
Input:  
- Features from Convolution Middle Layer

Output:  
- Region Proposal Features (same shape as CNN layer)

## Proposal Layer
Input:  
- Region Proposal Features
- Anchors

Output:  
- Boxes
- Batch Index
- Class Index
- Scores

## Loss

$$\begin{pmatrix}a & b\\\ c & d\end{pmatrix}$$ $$\begin{pmatrix}a & b\\\ c & d\end{pmatrix}$$ 
