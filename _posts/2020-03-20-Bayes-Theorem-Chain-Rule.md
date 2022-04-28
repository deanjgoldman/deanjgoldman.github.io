---
layout: post
title: Extending Bayes' Theorem To Multiple Conditions
author: Dean Goldman
subtext: I go over the fundamentals of Bayes' theorem, and explain how to incorporate joint distributions as conditioning events.
---

This post goes over some of the fundamental properties of Bayes' theorem and extends Bayes' theorem to multiple conditions using the definition of conditional probability and the chain rule.

Bayes' theorem gives an equation for finding the probability of some hypothetical event happening given that another event has already occurred. A simple example would be to use Bayes' theorem to compute: What is the probability that the park will be crowded _given_ that it is a nice day? In Bayesian language, the equation produces a posterior probability of an event given a few things: 

1. A prior probability: A distribution of probabilty about an outcome prior to some evidence, denoted as $$P(H)$$. $$P(H)$$ is the probability that the park will be crowded when I go there today _prior_ to any evidence that may inform my probability distribution (weather, day of week, time of day, etc.).  

2. Model evidence: The probability of the event we're interested to condition our hypothesis on. For our example, we're conditioning the probability of the park being crowded on whether or not it's a nice day. Part of our equation requires us to know the probability it will be a nice day. This is denoted as $$P(E)$$. 

3. A likelihood function: This is just the question we want to know, in reverse. What is the probability that it was a nice day _given_ that the park was crowded when I went there? Mathematically, it is a function describing the probability of the conditioning event occuring, for a fixed probability of H occuring: $$P(E \vert H)$$. 
  
The probability of the hypothesis given evidence is what we are looking to find. This is denoted as $$P(H \vert E)$$ . What is the probability that the park will be crowded _given_ that it is a nice day? That probability is determined by Bayes' theorem:  

$$
P(H \vert E) = \frac{P(E \vert H) * P(H)}{P(E)}
\tag{1}
$$

## Applying Bayes Theorem
 We can see how Bayes' theorem works by introducing a dataset from which we can prdocue the prior probability, likelihood function, and model evidence. A dataset corresponding to our park example can be visualized by the following summary table:

$$
\begin{array}{|c|c|c|}
\hline
  \text{} & \text{Nice Day} & \text{Not Nice Day} & \text{Sum}\\ 
\hline  
   \text{Crowded} & 8 & 3 & 11\\ 
\hline
   \text{Not Crowded} & 2 & 4 & 6\\ 
\hline
   \text{Sum} & 10 & 7 & 17\\ 
\hline
\end{array}
\tag{2}
$$

This table breaks down the number of observations that occurred for all possible combinations of the variables we're interested in, and the sum total of observations in the margins. According to the table, it was crowded on a nice day eight times, while not crowded on a nice day only once.

Here is a representation of our table in a raw form, the way you might track your park visits day by day.

$$
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
   \text{17} & 1 & 1\\             
\hline
\end{array}
\tag{3}
$$

Given Fig. 2, that we see can be built from the raw data (Fig 3.), we'll be able to build up the parameters to calculate our desired posterior probability.  

### Prior Probability: $$P(H)$$
This is the prior probability that the park will be crowded. At first glance, deciding on this probability seems like it should always be $$50\%$$. This is a "yes" or a "no" question, and before knowing anything about the situation, we should consider all outcomes equally likely. But we are actually calculating the probability as it exists within our observations. This can seem like it defies the definition of "_prior to any evidence_", but really whats being done is that we are evaluating the observed phenomena of $$H$$ (the park being crowded), independent of other evidence (nice day or not).  

In our observations, number of times we see the park was crowded is 11 out of 16 visits to the park. So the prior probability (the probability the park will be crowded) is $$\frac{11}{16}$$. Intuitively, we can tell this probability is useful as a starting point, without knowing anything about prior conditions, the park is more often crowded than not. Our final hypothesis will be very different if we observe park was crowded 0, or 1 out of 16 visits, versus 15 out of 16 visits, regardless of prior conditions.   

### Likelihood Function: $$P(E \vert H)$$
For this example, to answer the question: _What is the probability that it was a nice day given that the park was crowded when I went there?_ Given our table, we can see that the number of Nice Day's that coincided with the park being Crowded is 8. To derive a probability, we use this number as the numerator over the total number of days the park was Crowded, $$\frac{8}{11}$$. This is the observed probability of a Nice Day _given_ the condition that the park was Crowded.


### Model Evidence: $${P(E)}$$
What is the probability that it will be a nice day? Given the above data, we can see that Sum of the Nice Day's is 10. This is how many Nice Day's we have evidence of. The probability of it being a nice day is this number of observed Nice Day events over the number of observed days, which is $$\frac{10}{17}$$.


### Posterior Probability: $$P(H \vert E)$$
To compute the posterior probability, plug in the values from our prior, likelihood, and model evidence into Bayes' theorem.

$$
P(H \vert E) = \frac{P(E \vert H) * P(H)}{P(E)}
$$

$$
P(H \vert E) = \frac{ \frac{8}{11} * \frac{11}{17} }{\frac{10}{17}} = 0.8
\tag{4}
$$

According to our observations, the probability that the park will be crowded given that it is a nice day is $$.8$$.

An intuitive way to look at it is that we are just taking the ratio between: the probability of the intersecton of the evidence and the hypotheis, and the probability of the evidence. Note that our posterior probability $$0.8$$, is the value we get if we take the probability of Nice Day & Crowded, over the probability of Nice Day. $$\frac{\frac{8}{17}}{\frac{10}{17}} = \frac{8}{10} = 0.8$$.

## Bayes' Theorem with Multiple Conditions
{: style='text-decoration: none'}
Bayes' theorem also extends to conditioning on joint distributions, i.e. the intersection of multiple events. We can keep the same intuition as with a single conditioning event, only that we chain together the process of conditioning on additional events by using the definition of conditional probability and the chain rule. If you want to read [that section](#conditional-probability-and-the-chain-rule) and return to this one, you can, but I'll just keep going with our park example and adding a second conditioning event to show what it does to Bayes' theorem.

Here is our question stated with a second conditioning event: What would be the probability the park will be crowded given that it is a nice day, and the pool is open? Since we're dealing with two conditioning events, we write their intersection as $$E = A \cap B$$, and Bayes' theorem for multiple conditions can be written as:

$$
P(H \vert E) = P(H \vert A \cap B) = \frac{P(A \vert H \cap B) * P(H \vert B)}{P(A \vert B)}
\tag{5}
$$

At first glance, it may seem unclear why conditioning on a second event would pan out like this. But we're essentially just conditioning all terms in our first Bayes' equation on a second condition (event $$B$$). I also said that this equation _can_ be written that way, because it can also be written other ways, as we'll see. To keep things intuitive, we could rewrite our event variables as descriptions, and illustrate the mechanics with data.

$$
P(\text{Crowded} \vert \text{Pool Open} \cap \text{Nice Day}) = \frac{P(\text{Pool Open} \vert \text{Crowded} \cap \text{Nice Day}) * P(\text{Crowded} \vert \text{Nice Day})}{P(\text{Pool Open} \vert \text{Nice Day})}
$$

We're still computing Bayes' theorem, but just conditioning all of our terms on the additional event. Breaking our data out into a table, we have: 

$$
\require{enclose} 
\begin{array}{|c|c|c|}
\hline
  \text{Crowded} & \text{Nice Day} & \text{Not Nice Day} & \text{Sum}\\ 
\hline  
   \text{Pool Open} & 8 & 0 & 8\\ 
\hline
   \text{Pool Not Open} & 0 & 3 & 3\\ 
\hline
   \text{Sum} & 8 & 3 & 11\\ 
\hline
\end{array}
\tag{6}
$$

$$
\require{enclose} 
\begin{array}{|c|c|c|}
\hline
  \text{Not Crowded} & \text{Nice Day} & \text{Not Nice Day} & \text{Sum}\\ 
\hline  
   \text{Pool Open} & 1 & 0 & 1\\ 
\hline
   \text{Pool Not Open} & 1 & 4 & 5\\ 
\hline
   \text{Sum} & 2 & 4 & 6\\ 
\hline
\end{array}
\tag{7}
$$

Plugging in our values, we get:

$$
\begin{aligned}
&P(\text{Pool Open} \vert \text{Crowded} \cap \text{Nice Day}) = \frac{8}{8}\\
&P(\text{Crowded} \vert \text{Nice Day}) = \frac{8}{10}\\
&P(\text{Pool Open} \vert \text{Nice Day}) = \frac{9}{10}\\
\end{aligned}
$$

$$
P(\text{Crowded} \vert \text{Pool Open} \cap \text{Nice Day}) = \frac{ \frac{8}{8} * \frac{8}{10} }{\frac{9}{10}} = 0.8\bar{8} 
$$

We can see that the likelihood function $$P(\text{Pool Open} \vert \text{Crowded} \cap \text{Nice Day})$$ is maximally supportive of the hypothesis (every time its a crowded nice day, the pool is open). That leaves the model evidence term to increase the probability of the hypothesis as the model evidence decreases in the denominator. This is like saying if an event is highly likely to coincide with the hypothesis, we should perhaps assign a high probability that the hypothesis is true, if it is given that the event is true. The rarer the conditioning event is, the more convinced we should be that our hypothesis is true, since we know that the rare event is highly coincident with the hypothesis, and that it occurred. We should recall too that for multiple conditions, the hypothesis itself should be conditioned on the first conditioning event. Conveniently, this conditioned hypothesis is just result of the previous Bayesian equation: $$P(\text{Crowded} \vert \text{Nice Day})$$. This idea is a consequence of what is known as the chain rule in probability, and you can continue to chain Bayesian equations together like this:

$$
P(H \vert A \cap B \cap C) = \frac{P(A \vert H \cap B \cap C) * P(H \vert B \cap C)}{P(A \vert B \cap C)}\\
\tag{8}
$$

$$
P(H \vert A \cap B \cap C) = \frac{P(A \vert H \cap B \cap C) * (\frac{P(B \vert H \cap C) * (\frac{P(C \vert H) * P(H)}{P(C)})}{P(B \vert C)})}{P(A \vert B \cap C)}
\tag{9}
$$

## Conditional Probability and the Chain Rule
Fundamental to dealing with the equations above, and probability in general, are the definitions of conditional probability, and the chain rule. The chain rule defines the joint distribution of two or more random variables, based on the definition of conditional probability, which is:

$$
P(A \vert B) = \frac{P(A \cap B)}{P(B)}
\tag{10}
$$

Switching this around algebraically, we can produce:

$$
P(A \cap B) = P(A \vert B) * P(B)
$$

Which is a two-case example of how the chain rule is usually written out. Extending this to multiple conditions produces this equation [1]: 

$$
P(X_{1} \cap X_{2} \cap ... \cap X_{n}) = P(\bigcap_{i=1}^{n}X_{i}) = \prod_{i=1}^{n}P(X_{i} \vert \bigcap_{j=1}^{i-1}X_{i} )
\tag{11}
$$

We can see that the intersection of conditioning events $$X_{j} \cap ... \cap X_{i-1}$$ is another instantiation of the chain rule. We make recursive calls to the chain rule all the way down until we reach the two-case example, which then gives the solution to the three-case, which then gives the solution to the four-case, and back all the way up. This is pretty much exactly what we're doing in equation 5, but for equation 5 we've just incorporated the definition of conditional probability in our equation.

$$
\begin{aligned}
&P(H \cap A \cap B) = P(H \vert A \cap B) * P(A \cap B)\\
&\hspace{60pt}      = P(H \vert A \cap B) * P(A \vert B) * P(B)
\end{aligned}
$$

$$
\begin{aligned}
&\therefore P(H \vert A \cap B) = \frac{P(H \cap A \cap B)}{P(A \cap B)}\\
&\hspace{65pt}       = \frac{P(A \cap H \cap B)}{P(A \cap B)}\\
&\hspace{65pt}       = \frac{P(A \vert H \cap B) * P(H \vert B) * P(B)}{P(A \vert B) * P(B)}\\
&\hspace{65pt}       = \frac{P(A \vert H \cap B) * P(H \vert B)}{P(A \vert B)} \hspace{8pt} \text{(equation 5)}
\end{aligned}
\tag{12}
$$

## Discussion

There are a bunch of different ways to write out Bayes' theorem. It's a very good skill to be able to switch around between them. For creating these examples and working through the algebra, I had to write out the equalities on a whiteboard for a while, and come up with miniature examples, like the crowded park scenario. I would recommend anyone pull out a pencil and paper and draw it out slowly if they are trying to understand Bayes' theorem extended to multiple conditions. Writing it out leads to some light bulbs going off, which is harder to get by just reading. I hope that figure 12 provides a step-by-step for switching between just a few ways of writing out Bayes' theorem with the chain rule. 

## References

{: .footer}
[1] Russell, Stuart J.; Norvig, Peter (2010), Artificial Intelligence: A Modern Approach (3rd ed.), Upper Saddle River, New Jersey: Prentice Hall, ISBN 0-13-604259-7, p.514