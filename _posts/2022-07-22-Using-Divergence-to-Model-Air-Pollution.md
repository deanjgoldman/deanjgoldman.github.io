---
layout: post_notebook
title: Using Divergence to Classify Pollution Sources
author: Dean Goldman
subtext: I describe the concept of the divergence of a vector field and share an application for detecting pollution sources from satellite imagery.
---

## Introduction

Two critical parts of researching air pollution are understanding the source of a particular pollutant, and understanding who and what is affected by it. Determining pollution sources is not always as straightforward as pointing out discrete areas of energy production, e.g. locations of oil refineries and coal plants, which even in these cases, the available data for academic research is not thorough. Some pollutants, produced in small increments over time over a broad area, have a significant effect on that area's air quality. In some parts of the world, common usage of wood-burning stoves contribute to a majority of that area's pollution output. In other areas, high automobile usage increases that area's smog and pollution. These pollution sources aren't as discretely recognizable as a coal plant, but may still impact air quality to a greater or lesser extent. If a general location of a pollutant's source could be determined, and a distribution estimated about the energy production methods in that vacinity, it could be possible to estimate a required amount of change- either a change in the reduction of energy produced, or a substitution of energy production methods- so as to reudce the amount of pollution to some given level, for a given vacinity or population. It could also be possible to account for the effect that that pollution has on the vacinity's inhabitants, if sufficient data were incorporated about the effects of a pollutant on health or climate, etc. Comparisons could also be made between vacinities with similar pollution profiles, in order to find 'nearest neighbor' pollution vacinities. If other characteristics were known about these vacinities, e.g. population density, energy production methods, local climate, there may be a potential for predicting outcomes in this way. If several cities had a similar pollution profile except for a large difference between a single type of particulate, say SO2, it may be of interest to know how similar these cities are with respect to population age, industry, and health.

## Divergence
Divergence is a scalar function that measures the amount of outward flux at a point in a vector space. It is well illustrated by the concept of water flowing in a bathtub, from a faucet into a drain. The water flows outward from the source, and inward into the sink. The spatial system representing the bathtub has positive divergence at the source point, and negative divergence at the sink. At points in the system where water passes through, i.e. the same amount of water that passes into the point also passes out of it, it's divergence is zero. Divergence in a system is zero everywhere except for where flux is entering or leaving the system.

Divergence is mathematically defined as the sum of the gradients in each direction of the coordinate space, in the example below, I've kept the number of dimensions to three, but this definition extends to any number of dimensions. Importantly for our application, the $$z$$-dimension doesn't refer to the third dimension of space, but to the amount of particulate pollution to be found at any $$(x, y)$$ point in space, given our dataset.

$$
\text{div} v = \frac{v_{1}}{x} + \frac{v_{2}}{y} + \frac{v_{3}}{z} 
\tag{1}
$$

Since we're interested in arriving at some estimate of the sources and sinks of the air pollution dataset, we'll compute the gradient from the data, and estimate the divergence through equation 1. Computing the gradient for a two-dimension coordinate system is equivalent to applying a convolution filter:

# TODO: CONVOLUTION

## Estimating Divergence
Given this definition, its feasible to believe that the gradient is high when one coordinate point is very different from its neighbor. That would signify a large "change", which is what derivatives are all about. It may begin to become clear that this applies to our problem in that if an area of our coordinate system generally consists of low or no PM pollution, but at one coordinate suddenly has a large amount of PM pollution, the gradient in the $$z$$-direction will be high, and we may consider that point as a source of PM pollution. Conversely, we might want to know about the sinks, or points at which the flux of pollution leaves a system. A hyperbolic sink in this scenario would be something like a massive air pollution filter the size of an oil refinery, but as far as I know, this kind of technology doesn't exist, or hasn't been engineered. So we're pretty much interested in sources, but we also have an opportunity to try and identify where pollution is stagnating. This is kind of like a sink, except that the pollution itself isn't leaving the system, its just sitting there the way that smog hangs over a city. Our dataset is pretty much limited to four variables: the x and y coordinates, the amount of pollution, and the population density. One approach for differentiating centralized energy-production borne pollution like pollution from oil refineres from decentralized pollution like car usage in cities or wood-stove usage, would be to incorporate population into the divergence computation. We could rewrite our divergence equation as follows, using $$p_{1}$$ to denote the amount of pollution, and $$p_{2}$$ to denote the population:

$$
\text{div} v = \frac{v_{1}}{x} + \frac{v_{2}}{y} + \frac{v_{3}}{p_{1}} + \frac{v_{3}}{p_{2}} 
\tag{2}
$$

This formula would favor high density, high populations in it's calculation of source. In order to arrive at an divergence equation that favors areas of low-population/high-pollution, we can instead measure population sparsity. A simple way to do this would be to just flip the sign of the population variable to produce:


$$
\text{div} v = \frac{v_{1}}{x} + \frac{v_{2}}{y} + \frac{v_{3}}{p_{1}} - \frac{v_{3}}{p_{2}} 
\tag{3}
$$

I wrote these scripts to run the two divergence estimation programs. The results are below:

<map 1: no pop variable>

<map 2: weighted pos. pop variable>

<map 3: weighted neg. pop variable>

## Observations
Points in this coordinate space that have the highest divergence include population dense regions such as Beijing, Shanghai, Vietnam, and Bangladesh, and interestingly parts of Alaska, which are not population dense, so this may be an indicator of the many oil refineries located in Alaska (FACT CHECK). It should be noted that it is of interest to seek any areas at all with a sufficiently positive divergence, since these areas too contain strong gradients with respect to the pollution data collected. These areas include central Africa and parts of the Caribbean.

These estimates may be further improved by a high resolution estimate of energy usage. TODO: incorporate night-time brightness data?

