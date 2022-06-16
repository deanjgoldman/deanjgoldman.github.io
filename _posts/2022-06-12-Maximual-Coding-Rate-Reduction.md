---
layout: post_notebook
title: Experimenting with Maximal Coding Rate Reduction 
author: Dean Goldman
subtext: I code up some simulations to compare how the MCR2 objective function works for multiclass contrastive representations against other methods like computing FLD and L2.
---

## Introduction

I do a lot of work developing deep learning models for multiclass classification. An important part of this process is to engineer an objective function that optimizes for representations that are similar for samples within-class, and dissimilar for samples between-class. The idea is that if we're interested in performing multiclass classification for some unseen sample, our model should project that sample onto a coordinate in a hidden space such that that coordinate is closest to other samples' coordinates of the same class. There are plenty of different ways to train a model toward this objective, in this post I investigate an approach that was new to me: the Principle of Maximal Coding Rate Reduction, or MCR$$^2$$ (Ma, et al.). I describe a bit about what this loss function theoretically achieves, and I compare it to some baseline loss functions that can be used for contrastive learning- like taking the within/between class L2-norm, and Fisher's Linear Discriminant. The goal here is not necessarily to make a case for any one approach, but to explore the behavior of different loss functions, understand some of the theory behind them, and iterate over a few experiments.

## Maximal Coding Rate Reduction
The fundamental idea behind MCR$$^2$$ is that there is a theoretical minimum number of bits required to encode a set of vectors $$W$$, with a given amount of distortion $$\epsilon$$, into a region $$\mathbb{R}^{n}$$. The authors of the MCR$$^2$$ use a sphere-packing explanation to illustrate their point.

<div style="text-align: center;">
<img src="/assets/images/ma-pam107-fig1.png" width=600>
<figcaption class="footer">Fig 1. from the author's paper <span style="font-style: italic">Segmentation of Multivariate Mixed Data via Lossy Data Coding and Compression</span></figcaption>
</div>
<br/>

A subtle detail to note is that $$Vol(\hat{W})$$ is the volume of the covariance matrix of $$W$$. The useful aspect of using the covariance matrix is that it can be decomposed to produce the principal components of $$W$$. This forms a compressed representation of our data, while still preserving the direction variance. This works nicely with the expectation that samples from different clusters will be uncorrelated and generally map onto different regions in the covariance space, and with our objective for compression- that we're looking for the minimum number of bits to encode $$W$$.  
<br/>
Filling the space $$\text{Vol}(\hat{W})$$ with $$\epsilon$$-spheres with volume $$\text{vol}(z)$$ can be expressed algebraically as:

$$\text{vol}(z) * \text{# of spheres} \approx \text{Vol}(\hat{W})$$

So the expected number of bits to label a sphere coinciding with any vector $$w_{i}$$ in $$W$$ can be expressed as a function $$R(W)$$: (This is equation 11 in paper [2])

$$
\begin{aligned}
R(W) &= \text{log}_{2} (\text{# of spheres})\\
&= \text{log}_{2}(\text{Vol}(\hat{W}) / \text{vol}(z)) = \frac{1}{2} \text{log}_{2} \text{det}(I + \frac{n}{m\epsilon^{2}}WW^{T})
\end{aligned}
$$

Extending this to the number of samples ($$m$$), and number of dimensions ($$n$$) produces equation 13 in the author's paper, which defines the number of bits needed to encode all $$m$$ vectors in $$W \subset \mathbb{R}^{n}$$, subject to squared error $$\epsilon^{2}$$ [2]:

$$L(W) = (m+n)R(W) = \frac{(m+n)}{2} \text{log}_{2} \text{det}(I + \frac{n}{m\epsilon^{2}}WW^{T})$$



I'll make an attempt to explain this formula as best as I can, but I could be wrong, and certainly am leaving some of the full explanation out. The determinant expresses the volume of an n-dimensional parallelepiped (in this case the covariance matrix) in units of $$\epsilon$$-spheres. The $$\text{log}_{2}$$ element comes from the fact that we're making a binary encoding of those spheres. E.g. coding four $$\epsilon$$-spheres would require only two bits (00, 01, 10, 11), so $$\text{log}_{2}4 = 2$$ bits. And the $$\frac{1}{2}$$ is a consequence the differential entropy of a normal distribution, which is a component in the proof of the rate distortion theorem [3].  
<br/>
We now have a function $$L(W)$$ that will tell us the total number of bits needed to encode a set of vectors. What the MCR$$^2$$ paper goes on to propose is that a good representation $$Z$$ of $$X$$ should be one in which partitioning $$Z$$ by class membership should result in a set of partitions $$\Pi$$, whose sum coding rate is smaller than that of $$Z$$. This is to say all within-class partitions should have a smaller coding rate, relative to between-class partitions. What this theoretical minimum would require is that the partitions would be highly correlated within-class, but maximally incoherent between-class. If it were otherwise, the between-class coding rate would drop, meaning that the feature space would be treating two classes similarly and would thus be less effective at drawing a classification boundary. To enforce this goal, the MCR$$^2$$ objective function is to find a maximum (equation 8 in [1]):


$$
\max_{\theta, \Pi} \Delta R(Z(\theta), \Pi, \epsilon) = R(Z(\theta), \epsilon) - R^{c}(Z(\theta), \epsilon, \vert \text{ } \Pi), \text{    s.t.    } \vert\vert\text{ } Z_{j}(\theta) \text{ }\vert\vert_{F}^{2} = m_{j},\text{ } \Pi \in \Omega
$$

This has some similarity to Fisher's Linear Discriminant, which is simply the ratio of between-class variance and within-class variance:

$$
J(W) = \frac{S_{W}}{S_{B}} = \frac{\sum_{k=1}^{K}\sum_{n \in C_{k}}(y_{n}-\mu_{k})(y_{n}-\mu_{k})^T}{\sum_{k=1}^{K}N_{k}(\mu_{k}-\mu)(\mu_{k}-\mu)^T}
$$

It seems like a natural next step to compare the two. For this particular excercise, I decided to simulate some data points in clusters of multivariate normal distributions, with a range of different parameter values. This way, I could perturb the clusters one way or another, and inspect the effect on either loss function.  

Between vs. within



 




## L2-Norm

## Fisher's Linear Discriminant

## Simulating Latent Space Representations

A good contrastive loss function should be able to produce values that correlate to the compressive-contrastive qualities of the latent space representations. Hypothetically, this should hold true even if the latent space is just generated from a random process. I thought this would be a good area to experiment in, so I wrote some code to generates $$n$$ samples from $$k$$ clusters in a $$d$$-dimensional space.


## Observations


## Discussion

<br/>
Thanks for reading &#129305;!  
<br/>

## Acknowledgements
Gratitude for the people at [KEEN](https://www.kelpecosystems.org/) who have started and maintained their project, and [Austin Rochford](https://austinrochford.com/) for sharing an implementation of a ZIP Likelihood model.

## References

{: .footer}
[1] Ma et al. "Learning Diverse and Discriminative Representations via the Principle of Maximal Coding Rate Reduction", Department of EECS, UC Berkely, June 15, 2020. [https://arxiv.org/pdf/2006.08558.pdf](https://arxiv.org/pdf/2006.08558.pdf){: .footer-link}

[2] Ma et al. "Segmentation of Multivariate Mixed Data via Lossy Data Coding and Compression", IEEE Transactions on Pattern Analysis and Machine Intelligence, Vol. 29, No. 9, September, 2007. [https://people.eecs.berkeley.edu/~yima/psfile/Ma-PAMI07.pdf](https://people.eecs.berkeley.edu/~yima/psfile/Ma-PAMI07.pdf){: .footer-link}

{: .footer}
[3] T. Cover and J. Thomas, “Elements of Information Theory, Second Edition", p. 272, 336. Wiley-Interscience. 2006. [http://staff.ustc.edu.cn/~cgong821/Wiley.Interscience.Elements.of.Information.Theory.Jul.2006.eBook-DDU.pdf](http://staff.ustc.edu.cn/~cgong821/Wiley.Interscience.Elements.of.Information.Theory.Jul.2006.eBook-DDU.pdf){: .footer-link} 

{: .footer}
[4] Liu J. et all. "A Goodness-of-fit Test for Zero-Inflated Poisson Mixed Effects Models in Tree Abundance Studies" National Library of Medicine. November 22, 2019. [https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7061334/#S4](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7061334/#S4){: .footer-link}

{: .footer}
[5] Byrnes J. et all. "Figure 1. Diagram of quadrat orientation on transect tape." KEEN Handbook v0.9.5. Kelp Ecosystem Ecology Network. September 23, 2018. [https://www.kelpecosystems.org/projects/protocols-materials/](https://www.kelpecosystems.org/projects/protocols-materials/){: .footer-link}

{: .footer}
[6] Ancelet, Sophie. (2008). Exploring the bayesian hierarchical approach for the statistical modeling of spatial structures: application in population ecology. 