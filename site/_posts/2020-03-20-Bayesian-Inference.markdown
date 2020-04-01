# Bayesian Inference

Bayesian Inference derives the posterior probability of an event as a consequence of:

1. A prior probability: A distribution of probabilty about an outcome priort to some evidence, denoted as $$P(H)$$. $$P(H)$$ is the probability that park will be crowded when I go there today. It is the probability _prior_ to knowing anything about evidence that may inform my probability distribution (weather, day of week, time of year, current events, etc.).  
  
2. A likelihood function: A function describing the probability of an event E occuring, for a fixed probability of H occuring: $$P(E \vert H)$$. What is the probability that it was a nice day _given_ that the park was crowded when I went there?

3. Model evidence: The probability of seeing evidence E: $$P(E)$$. What is the probability that it will be a nice day?  
  
This will yield the posterior probability:

$$P(H \vert E) = \frac{P(E \vert H) * P(H)}{P(E)}$$
  
Which gives us the probability of the hypothsis ($$H$$) given evidence $$E$$. What is the probability that the park will be crowded _given_ that it is a nice day?

## Run the numbers: 
1. The prior probability that the park will be crowded when I go there. Let's call this $$0.5$$ or a $$50\%$$ chance the park will be crowded when I go there today.