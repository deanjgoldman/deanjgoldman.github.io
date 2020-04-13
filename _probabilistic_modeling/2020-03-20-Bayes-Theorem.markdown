---
layout: post
title: Bayesian Inference Part I - Bayes Theorem
---

Bayes Theorem derives the posterior probability of an event as a consequence of:

1. A prior probability: A distribution of probabilty about an outcome prior to some evidence, denoted as $$P(H)$$. $$P(H)$$ is the probability that park will be crowded when I go there today. It is the probability _prior_ to any model evidence that may inform my probability distribution (weather, day of week, time of year, etc.).  
  
2. A likelihood function: A function describing the probability of an event E occuring, for a fixed probability of H occuring: $$P(E \vert H)$$. What is the probability that it was a nice day _given_ that the park was crowded when I went there?

3. Model evidence: The probability of seeing evidence E: $$P(E)$$. What is the probability that it will be a nice day?  
  
4. Posterior Probability: The probability of the hypothsis ($$H$$) given evidence $$E$$ is what we are looking to find. What is the probability that the park will be crowded _given_ that it is a nice day? This is done by using Bayes' Theorem:  

$$P(H \vert E) = \frac{P(E \vert H) * P(H)}{P(E)}$$

5. Data: In order to set Bayes' Theorem into motion, we need data that will give us the prior probability, likelihood function, and model evidence. That data is very easily visualized by the following table:

$$
\text{Fig 1. Counts} \\
\begin{array}{|c|c|c|}
\hline
  \text{} & \text{Nice Day} & \text{Not Nice Day} & \text{Sum}\\ 
\hline  
   \text{Crowded} & 8 & 3 & 11\\ 
\hline
   \text{Not Crowded} & 1 & 4 & 5\\ 
\hline
   \text{Sum} & 9 & 7 & 16\\ 
\hline
\end{array}

$$

This table tracks visits to the park, and the observation that it was a Nice Day or a Not Nice Day, along with the coincidence that the park was Crowded or Not Crowded during that observation. 
Here is a representation of our table in a raw form, the way you might track your park visits day by day.

$$
\text{Fig 2. Raw Data} \\
\begin{array}{|c|c|c|}
\hline
  \text{Day} & \text{Nice Day} & \text{Crowded}\\ 
\hline  
   \text{1} & 0 & 0\\ 
\hline  
   \text{2} & 1 & 1\\ 
\hline  
   \text{3} & 0 & 1\\ 
\hline  
   ... & ... & ...\\
\hline  
   \text{16} & 1 & 1\\             
\hline
\end{array}
$$

Notice that this table only tracks visits to the park (16 visits in total). It does not include _any_ other information (i.e; the total time span across all observations, or the days between visits to the park.) To get the aggregated table (Fig. 1), we just need to run a product-wise aggregation, as in, how many total times did we see the following observations occur together:  

- Nice Day & Crowded = 1, 1  
- Nice Day & Not Crowded = 1, 0  
- Not Nice Day & Crowded = 0, 1  
- Not Nice Day & Not Crowded = 0, 0  

Given Fig. 1, that we see can be built from the raw data (Fig 2.), we'll be able to build up the parameters to calculate our desired posterior probability.  

## Prior Probability: $$P(H)$$
Lets start with the prior probability that the park will be crowded when I go there. At first glance, deciding on this probability seems like it should always be $$50\%$$. This is a "yes" or a "no" question, and before knowing anything about the situation, we should consider all outcomes equally likely. But we are actually calculating the probability as it exists within our observations. This can seem like it defies the definition of "_prior to any evidence_", but really whats being done is that we are evaluating the observed phenomena of $$H$$ (the park being crowded), _independent_ of other evidence (the weather, time of day, etc.)  

In our observations, number of times we see the park was crowded is 11 out of 16 visits to the park. So the prior probability (the probability the park will be crowded) is $$\frac{11}{16}$$. Intuitively, we can tell this probability is useful as a starting point, without knowing anything about prior conditions, the park is more often crowded than not. Our final hypothesis will be very different if we observe park was crowded 0, or 1 out of 16 visits, versus 15 out of 16 visits, regardless of prior conditions.   

## Likelihood Function: $$P(E \vert H)$$
For this example, to answer the question: _What is the probability that it was a nice day given that the park was crowded when I went there?_ Given our table, we can see that the number of Nice Day's that coincided with the park being Crowded is 8. To derive a probability, we use this number as the numerator over the total number of days the park was Crowded, $$\frac{8}{11}$$. This answers our question of probability of a Nice Day _given_ the condition that the park was Crowded when I went there.


## Model Evidence: $${P(E)}$$
What is the probability that it will be a nice day? Given the above data, we can see that Sum of the Nice Day's is 9. This is how many Nice Day's we have evidence of. The probability of it being a nice day is this number of observed Nice Day's over the number of observed days, which is $$\frac{9}{16}$$.


## Posterior Probability: $$P(H \vert E)$$
To achieve the posterior probability, we will plug in the values from our prior, likelihood, and model evidence into Bayes Theorem.

$$P(H \vert E) = \frac{P(E \vert H) * P(H)}{P(E)}$$

$$P(H \vert E) = \frac{ \frac{8}{11} * \frac{11}{16} }{\frac{9}{16}} = .8\bar{8}$$

The probability that the park will be crowded given that it is a nice day is $$.8\bar{8}$$.

One thing to note is that our posterior probability ($$.8\bar{8}$$), is the value we get if we take the number of occurances of Nice Day & Crowded (8), over the total number of Nice Days (9), we get this same fraction.

$$
\require{enclose} 
\begin{array}{|c|c|c|}
\hline
  \text{} & \text{Nice Day} & \text{Not Nice Day} & \text{Sum}\\ 
\hline  
   \text{Crowded} & \enclose{actuarial}[mathbackground="#6ad898"]{8} & 3 & 11\\ 
\hline
   \text{Not Crowded} & 1 & 4 & 5\\ 
\hline
   \text{Sum} & \enclose{actuarial}[mathbackground="#6ad898"]{9} & 7 & 16\\ 
\hline
\end{array}
\\  
\\
\frac{\enclose{actuarial}[mathbackground="#6ad898"]{8}}{\enclose{actuarial}[mathbackground="#6ad898"]{9}} = .8\bar{8}
$$
## Introducing Complexity


### More on Prior Probability

As well-stated from Wikipedia:  

_This example has a property in common with many priors, namely, that the posterior from one problem becomes the prior for another problem..._

