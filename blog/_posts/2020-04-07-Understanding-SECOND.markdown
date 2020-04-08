---
layout: post
title: Understanding SECOND
---

# SECOND (Sparsely Embedded CONvolutional Detection)  
<span style="font-size:12px;">by Andrew Dodd and Dean Goldman</span>


This blog post is the beginning of a project by the authors, involving several LiDAR detection algorithms, with a focus on [PV-RCNN](https://github.com/jhultman/PV-RCNN), which utilizes SECOND. 

This paper is targeted towards people interested in studying and applying deep learning architectures who may not have much experience reading whitepapers published on arxiv, like SECOND. This blog post walks through the SECOND paper, and attempts to reiterate each of its components in an accessible fashion. 


## Overview:

SECOND is a deep learning architecture for object detection from point cloud data. The point cloud data comes from LiDAR (Light Detection And Ranging), a method of measuring light that has been pulsed outwards from a laser at a central point, reflected off the world, and bounced back into a detector at the initial central point. The SECOND model is trained on the KITTI Vision Benchmark Suite, a common open source LiDAR dataset. Each point cloud space describes a 3D space generally depicting a road with cars, cyclists, and pedestrians. It has an associated set of labels:  
- The bounding boxes of objects in the space.
  - The x, y, z coordinates of the object's center.  
  - The length (l), width (w), and depth (d) of the bounding box.  
  - The yaw (z-axis rotation) of the bounding box.  
- The classification of each object in the space  
  - One-hot encoded variable for car, cyclist, pedestrian (or more, depending on dataset used)  
- Each object's orientation in space.  
  - One-hot encoded variable describing the orientation of the box: Is the front of the box facing away or towards the LiDAR's central point?
   
 SECOND's proposed technique takes a point cloud and goes through the following steps (each described briefly below, more detail to follow):  
  1. **Point cloud Grouping**: group points into voxels (voxels can be thought of as spatial 3D grid data)
  2. **Voxel Feature Extraction**: process the points in each voxel to create overall voxel features
  3. **Sparse Convolutional Middle Extractor**: sequence of convolutional blocks (sparse convolutions are well optimized convolutions for spread out data, like car point clouds!)
  4. **Region Proposal Network (RPN)**: more convolutional blocks to get the desired output shape
  5. **Proposal Layer**: dense layers to predict the above labels
  6. **Loss**: Calculate classification, bounding box, direction losses  

Note: 
The dimensions of the inputs and outputs of this network are based off of the implementation in the [PV-RCNN](https://github.com/jhultman/PV-RCNN) codebase by [jhultman](https://github.com/jhultman).

 The network is illustrated in the SECOND paper like so:

 ![SECOND Network](/assets/images/Understanding_SECOND/SECOND_network.png)

 This blog post describes each of the network layers' Input, Output, and a description of the layers' algorithm.

## 1. Point Cloud Grouping

### Input: 
- Points

### Algorithm:
Given a set size of an individual voxel, iterate through the 3d space, with each step being a new voxel, and group the points within each voxel space into a tensor of points per voxel.
- Voxel size: Size of individual voxel
- Grid bounds: Boundary limit for points to include in voxel space
- Max voxels: Maximum number of voxels allowed in algorithm
- Max occupancy: Limit of points to include in a single voxel

#### Points
- Voxels
- Matrix of points per voxel
- Coordinate and number-of-voxels map
  
Each point has an x,y,z coordinate and a reflecitivy value r.

$$\begin{pmatrix}
x_{1} & y_{1} & z_{1} & r_{1}\\
...\\
x_{p} & y_{p} & z_{p} & r_{p}\\
\end{pmatrix}$$
  
p is the total number of points in the point cloud.


#### Voxels  
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

This step also requires a data structure to hold the spatial coordinates and corresponding number of points per voxel. This map will be length $$n$$, a set maximum number of voxels.

$$
\begin{array}{|c|c|c|}
\hline
  \text{Index} & \text{Coordinates} & \text{Num Points in Voxel} \\ 
\hline  
   0 & (x_{0}, y_{0}, z_{0}) & 1 \\ 
\hline
   1 & (x_{1}, y_{1}, z_{1}) & 0 \\ 
\hline
   2 & (x_{2}, y_{2}, z_{2}) & 1 \\ 
\hline
   3 & (x_{3}, y_{3}, z_{3}) & 2 \\ 
\hline
   ... & ... & ... \\ 
\hline
   n & (x_{n}, y_{n}, z_{n}) & 1 \\ 
\hline
\end{array}
$$



## 2. Voxelwise Feature Extractor (VFE)
### Input:
- Voxels with points

### Output:
- Point-wise + voxel-wise feature extractions

### Algorithm:  

A Fully Connected Layer (FCN) consisting of a Linear layer, Batch Normalization and ReLU layer extract point-wise features. It then uses voxel-wise max pooling to obtain an aggregated set of features per voxel. This is concatenated to the point-wise features. The final output of the FCN is a sparse 4D tensor:  

$$\begin{pmatrix}
C_{0} & D_{0} & H_{0} & W_{0}\\
& ...\\
C_{v} & D_{v} & H_{v} & W_{v}
\end{pmatrix}$$   

where $$C_{v}$$ is the vector of point-wise + locally aggregated feature extraction.

A Linear layer takes as input a tensor (in this case the points per voxel) and applies a linear transformation ($$y=xA^{T}+b$$). This is equivalent to a matrix 
multiplication where the dimensions are:  
  
$$[V, P, V_{in}] * [V_{in}, U] = [V, P, U]$$
  
$$V$$: Total number of voxels  
$$P$$: Total number of points  
$$V_{in}$$: A vector of x,y,z coordinates and r per point, along with each coordinate relative offset w.r.t. the centroid of points in the voxel space, v. (This is just computing the mean of all point coordinates per voxel.)
  
$$ [x_{i}, y_{i}, z_{i}, r_{i}, x_{i}-v_{i}, y_{i}-v_{i}, z_{i}-v_{i}] $$ 

## 3. Sparse Convolutional Middle Extractor
### Input:
- Voxel Feature Extractions


### Output:  
- Features from Middle Extractor: $$(n, H, W, (C * D))$$

### Algorithm:  
This layer is a network of convolutional blocks for 3D tensors. The initial block is of dimension $$(11, 400, 352)$$ and represents the total number of potential voxels within the voxel space of the LiDAR detection ($$11 * 400 * 352 = 1,548,800$$). Out of the ~ 1.55 million voxels, there are relatively very few non-empty voxels. This is what characterizes the network as "sparse".

As the voxels and their features enter the convolution block, they are reshaped by the convolutional filter roughly following this pattern.


![SECOND Middle](/assets/images/Understanding_SECOND/SECOND_middle.png)

The pink box in the diagram is an enlarged representation of a single voxel, we'll assume its non-empty. For that pink box, it contains $$C$$, that voxel's feature extraction from the VFE layer. The middle extractor collapses the Z-dimension down to eventually form a birds-eye-view of the space, resulting in a shape $$(n, H, W, (C * D))$$
where n is the batch size, and $$C * D$$ is size of the new voxel features within the downsampled z-dimension.


## 4. Regional Proposal Network (RPN)
### Input:  
- Features from Convolution Middle Layer

### Output:  
- Region Proposal Features (same shape as Convolutional Middle layer Output)

### Algorithm:
- The RPN sends the BEV feature maps from the Middle Layer into a sequence of three 2D convolutional blocks. Each block starts with a stride-2 downsampling layer, a number of stride-1 layers in between and a [transpose convolutional layer](https://github.com/vdumoulin/conv_arithmetic) at the end, that upsamples the tensor shape to its original dimensions. After each block, the resulting feature map is concatenated to a final feature map, and then sent into the next block.


## 5. Proposal Layer
### Input:  
- Region Proposal Features
- Anchors

### Output:  
- Category Classification
- Box Regression
- Direction Classification

### Algorithm:
...

## 6. Loss
### Input:
- Category Classification
- Box Regression
- Direction Classification

### Output:
A combined loss for the three prediction categories.

### Algorithm:  
#### Category Classification Loss:  

$$ FL(p_{t}) = -\alpha(1-p_{t})^{\gamma}log(1-p_{t}) $$  
  
#### Box Regression Loss:
  
$$ L_{\theta} = SmoothL1(sin(\theta_{p} - \theta_{t})) $$  

The SmoothL1 loss function (a.k.a Huber Loss) is defined as:  
  
$$ L_{\sigma}(a) = \begin{cases}
  \frac{1}{2}a^{2} & \text{if} for |a| <= \sigma\\
  \sigma(|a|-\frac{1}{2}\sigma) & \text{otherwise}
\end{cases}
$$
  
Where $$a$$ is the residual, in this case: $$a = sin(\theta_{p} - \theta_{t})$$ 

#### Direction Classification Loss:  
Softmax function:  

$$ S(y_{i}) = \frac{e^{y_{i}}}{\sum_{j=0}^n e^{y_{j}}} $$
  
The Softmax function takes in a vector of length $$n$$ of numbers or "logits" and outputs a vector of length $$n$$ that sums to 1. In this case, $$n=2$$, to classify if the detected object is front-facing or back-facing.

## Conclusion
To recap, this network is a neural network used to read a set of LiDAR points to predict object locations (generally car, pedestrian, bike). This network's general process to achieve this is grouping the points to voxels, performing VFE (making features for each voxel), passing this through some 3D convolutions (sparse feature extractor), then going through another set of convolutions (RPN) to generate classifications and bounding box proposals. From there, it can calculate loss, backpropagate and update its parameters.

Things this blog post does not deeply dive into:
- Implementational details
- Why each specific layer was used
- Performance metrics

We may update this post to include more details, but for now, we hope this is a good primer before reading the paper :)

Thanks for reading our very first blog post! Feel free to contact the authors with comments, questions, concerns, etc. We are eager to hear from our readers.

## References:
Yan, Y.; Mao, Y; Li, B. SECOND: Sparsely Embedded Convolutional Detection. Sensors, vol. 18, no. 10, June 2018, p. 3337.

Vasudevan, A.; Anderson, A.; Gregg, D. Parallel multi channel convolution using general matrix
multiplication. In Proceedings of the 2017 IEEE 28th International Conference on Application-specific
Systems, Architectures and Processors (ASAP), Seattle, WA, USA, 10–12 July 2017; pp. 19–24.

Zhou, Y.; Tuzel, O. VoxelNet: End-to-End Learning for Point Cloud Based 3D Object Detection. arXiv 2017,
arXiv:1711.06396.


