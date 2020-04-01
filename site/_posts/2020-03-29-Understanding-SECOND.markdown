---
layout: post
title: Understanding SECOND
---

# SECOND (Sparsely Embedded Convolutional Detection)  

by Andrew Dodd and Dean Goldman  

SECOND is a method for object detection using point cloud data.

SECOND uses the following layers in its model:

## Preprocessing

Input: Points  
The point cloud data comes from LiDAR (Light Detection And Ranging), a method of measuring light that has been reflected off the world from a pulsed laser. A very common LiDAR dataset is the KITTI Vision Benchmark Suite. 

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
Starts with initial grid size (largest convolultional block): (batch_size, 41 , 1600, 1408) BEV depth D, height H, width W of BEV  

Sends to spconv.__init__.SparseConvTensor (x)
 into SpMiddleFHD(SparseCNNBase) calls make_blocks ->
 spconv.modules.SparseSequential(
   spconv.SubMConv3d,
   nn.BatchNorm1d,
   nn.ReLU()
 )


$$\begin{bmatrix}
41 & 1600 & 1408\\
21 & 800  & 704\\
11 & 400  & 352\\
5  & 200  & 176\\
\end{bmatrix}$$   


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
