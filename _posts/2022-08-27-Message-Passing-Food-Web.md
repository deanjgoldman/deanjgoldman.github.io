---
layout: post_notebook
title: Understanding Energy Flow in a Graph Through Message Passing
author: Dean Goldman
subtext: I cover the basics of graph networks, and discuss how energy can be propagated through a network by using an adjacency matrix for message passing.
---

# Understanding Energy Flow in a Graph Through Message Passing

## 1. Computing state changes through time

An adjacency matrix is a square, binary matrix that represents connections in a finite graph. Each element of the matrix represents the connection between a pair of nodes in the graph denoted as either a 1 or a 0.

In undirected graphs, nodes are connected by edges that do not have a particular direction. In this case, adjacency matrices are symmetric, since the flow across the edge between i,j is identical to the flow across the edge between j,i. In directed graphs, the direction will determine whether an element in the adjacency matrix is a 1 or a 0. In adjacency matrices for directed graphs, one dimension of A will correspond to the energy flowing __out__ of a node, and another will correspond to the energy flowing __in__ to a node. 

On top of this  

## 2. Using the degree matrix?