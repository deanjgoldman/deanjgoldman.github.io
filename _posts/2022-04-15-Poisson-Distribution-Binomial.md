---
layout: post
title: Deriving The Poisson Distribution From The Binomial
author: Dean Goldman
subtext: I talk about about what Poisson distributions are, and how it's probability mass function is derived.
---

## Introduction

The Poisson distribution expresses the probability of a given number of independent events occuring in a fixed interval. This model is generalizable for many processes; some common examples include: The number of cars to expect to cross an intersection during a green light, or the number of buffalo we should expect per acre of land in a wilderness area. Interestingly, the interval in which we measure events can be composed not only in time, but in space, or in any dimension that permits of discrete indepedent events. This post will describe the fundamentals of a Poisson distribution, and how it can be derived from a simpler distribution- the Binomial.

## Poisson Distribution

The Poisson distribution is commonly described by its probability mass function. All probability mass functions (PMFs) give the probability that a random variable will yield a given value $$k$$ according to some distribution, in our case the Poisson distribution. For the Poisson, the PMF also requires a second parameter $$\lambda$$, which denotes the expected value of the number of events per interval. This is often defined as $$\lambda=rt$$, where $$t$$ is the interval size and $$r$$ is the expected (the average) number of events within the interval $$t$$.

$$
f(k; \lambda) = \frac{\lambda^{k}e^{-\lambda}}{k!}
\tag{1}
$$


To explain the PMF of the Poisson, we can begin with a simpler distribution, the Binomial, and it's simplest case, the Bernoulli. We can derive the Poisson by extending the Binomial to the limit. The PMF for the Binomial distribution denotes the probability of getting $$k$$ successes in $$n$$ independent trials, where the probability of success is known to be $$p$$. So we have the probability of success for each trial, and the binomial will tell us the probability of $$k$$ successes, given $$n$$ trials. Each indepdent trial is called a Bernoulli trial, and it follows a Bernoulli distribution. The PMF for the Bernoulli is:

$$
f(k) = p^{k}(1-p)^{1-k}, k \in \{0, 1\}
\tag{2}
$$

Conveniently, when $$k=1$$, we're left with the probability of success $$p$$, and when $$k=0$$, we're left with the probability of failure, or not success, $$1-p$$.

The Binomial is just the extension of the Bernoulli to $$n$$ trials, and $$k$$ successes within those $$n$$ trials. To derive the Binomial from the Bernoulli, we can recall a fundamental aspect of probability theory, the chain rule, which for the intersection of two events is also called the product rule, and states that:

$$
P(A \cap B) = P(A) * P(B \vert A)
\tag{3}
$$ 

When two events are independent, as in the case assumed by the Binomial distribution, $$ P(B \vert A) = P(B) $$, so we can rewrite our equation as:

$$
\newcommand{\indep}{\perp \!\!\! \perp}
P(A \cap B) = P(A) * P(B), \thinspace \thinspace A \indep B
\tag{4}
$$ 

So $$A$$ and $$B$$ are two events, we've now extended the Bernoulli into a Binomial distribution where $$n=2$$. To extend this even further, we just chain together events with the chain rule, like so:

$$
\begin{aligned}
&\text{Let } E_{0} = P(A \cap B)\\
&\text{Let } E_{1} = P(C)\\
&P(E_{0} \cap E_{1}) = P(E_{0}) * P(E_{1}) = P(A \cap B) * P(C) = P(A) * P(B) * P(C)
\end{aligned}
\tag{5}
$$   

Given that we understand the extension of the Bernoulli into multiple trials, the PMF of the Binomial can be well explained:

$$
f(k,n,p) = \binom{n}{k}p^{k}(1-p)^{n-k}
\tag{6}
$$

We can begin by imagining a space of n dimensions, each dimension can hold a value of 1 or 0, a success, or a failure. We don't know which dimensions have a 1 or 0, but we know each dimension will be a 1 with probability $$p$$. Within this n-dimensional space, we're interested in finding the probability of $$k$$ successes. Let's start by setting $$n=10, k=2$$. We can see now, that for these values of $$n$$ and $$k$$, any two of the ten dimensions can hold a success, and that would satisfy our conditions for the PMF $$f(2, 10, p)$$. The number of ways $$k$$ events can fit into $$n$$ trials is a term known as the binomial coefficient $$\binom{n}{k}$$. This coefficient term will be a scaler to our chained intersection of Bernoulli trials, $$p^{k}(1-p)^{n-k}$$. The intersection of Bernoulli trials ends up using exponential terms because we're multiplying the same probability by itself $$k$$ times: $$p_{1} * p_{2} * ... p_{k} = p^{k}$$. Likewise, we're interested in the intersection of $$k$$ successes and by definition, $$n-k$$ failures. So this gives us the $$(1-p)^{n-k}$$ term. By itself, $$p^{k}(1-p)^{n-k}$$ is a single probability, usually very small for large values of $$n$$. But this probabilistic event can occur in any one of $$\binom{n}{k}$$ combinations- exactly how two successes can fit into ten trials in a number of different ways. So scaling the probability by the binomial coefficient will give us the PMF of the Binomial distribution.

Now we can move onto the Poisson. Recall that the idea behind the Poisson is to determine the probability of $$k$$ events within an interval $$t$$ where the average number of events are $$r$$. This is different from the Binomial in the sense that $$t$$ is a random continuous subset of $$n$$. So we're interested in letting $$n$$ take on an arbitrarily large value, or rather letting $$n$$ become the entire event space domain, and $$t$$ being a subset of that space. A well-known early example of modeling with a Poisson distribution is that of Russian-Polish statiscian Ladislaus von Bortkewitsch's 1894 analysis of deaths in Prussian cavalry units to answer the question of "What is the probability that a given number of cavalry men will be killed by their horse kicking them in a given year?" [2]. For this type of problem, it would be infeasible to model with a Binomial distribution. If we were to try, how would we determine $$n$$ trials? Is every moment a cavalry goes near their horse an independent trial? How would we accurately estimate that? Imagine instead, we only have a table of casualties and cause of death, which is what Bortkewitsch had. From this data, it would be simple to count the number of casualties due to being kicked by a horse every year. In fact, we'd even have the average number of horse-kick casualities per year in hand. But we're looking to achieve a PMF, or a function that will tell us the probability of $$k$$ events occuring in an interval. So the way that this is done is by expanding $$n$$ into an arbitrarily large domain, and sampling a random continuous interval $$t$$ from that domain to compute the probability of $$k$$ events in $$t$$, given that we have a known average, $$\lambda$$. 

To derive this mathematically, we have to find the limit of the Binomial distribution as n approaches infinity:

$$
\lim_{n\to \infty} \binom{n}{k}p^{k}(1-p)^{n-k}
\tag{7}
$$

Referencing the known average $$\lambda$$, we can determine the probability of the event in the space of $$n$$ trials by the equation. 

$$
p = \frac{\lambda}{n} = \frac{rt}{n}
\tag{8}
$$

Referencing the definition of the Binomial coefficient [3], we have:

$$
\binom{n}{k} = \frac{n!}{k!(n-k)!}
\tag{9}
$$

which lets us rewrite the limit as:

$$
\begin{aligned}
&\lim_{n\to \infty} \frac{n!}{k!(n-k)!} (\frac{\lambda}{n})^{k}(1-\frac{\lambda}{n})^{n-k}\\ 
&\lim_{n\to \infty} \frac{n!}{k!(n-k)!} \frac{\lambda^{k}}{n^{k}}(1-\frac{\lambda}{n})^{n-k}\\
&\lim_{n\to \infty} \frac{n!}{k!(n-k)!} \frac{\lambda^{k}}{n^{k}}(1-\frac{\lambda}{n})^{n}(1-\frac{\lambda}{n})^{-k} 
\end{aligned}
\tag{10}
$$ 

For the last term, as n approaches infinity, $$ (1 - \frac{\lambda}{n})^{-k} $$ approaches $$ 1^{-k} = 1 $$.

For the second to last term, $$ \lim_{n\to \infty} (1-\frac{\lambda}{n})^{n} $$ is an expression of the exponential function $$ e^{x} = \lim_{n\to \infty} (1+\frac{x}{n})^{n}  $$, where in our case, $$ x = -\lambda $$.

For the first two terms, we can cancel out $$(n-k)!$$ from $$n!$$ to produce:

$$
\frac{n * (n-1) * ... * (n-k)}{k!} * \frac{\lambda^{k}}{n^{k}}
$$

It can be seen that the number of terms in the left numerator $$ n * (n-1) * \ldots * (n-k) $$ is equal to the number of terms in the right denominator $$n^k$$, so those can be lined up to produce a set of k fractions whose limit as n approaches infinity are all equal to 1.  

$$
\lim_{n\to \infty} \frac{n * (n-1) * \ldots * (n-k)}{n_{1} * n_{2} * \ldots * n_{k}} = \frac{1}{1} * \frac{1}{1} * \ldots * \frac{1}{1} = 1
$$

Therefore, we're left with:

$$
\lim_{n\to \infty} \frac{n!}{k!(n-k)!} (\frac{\lambda}{n})^{k} (1-\frac{\lambda}{n})^{n-k} = \frac{\lambda^{k}e^{-\lambda}}{k!}
$$

Which is the PMF of the Poisson distribution:

$$
f(k; \lambda) = \frac{\lambda^{k}e^{-\lambda}}{k!}
$$

The intuition behind this derivation is that if you kept sampling different $$t$$ intervals from an arbitrarily large $$n$$ event space domain, the proportion of $$t$$ intervals containing $$k$$ events would converge to the value determined by the PMF. 


## References

{: .footer}
[1] "The Connection Between the Poisson and Binomial Distributions". The Department of Mathematics and Computer Science. Emory, Oxford College  [http://mathcenter.oxford.emory.edu/site/math117/connectingPoissonAndBinomial/](http://mathcenter.oxford.emory.edu/site/math117/connectingPoissonAndBinomial/){: .footer-link}  

{: .footer}
[2] Border, K. "Lecture 12: The Law of Small Numbers". From Introduction to Probability and Statistics, Caltech Department of Mathematics, 2017 [http://www.math.caltech.edu/~2016-17/2term/ma003/Notes/Lecture12.pdf](http://www.math.caltech.edu/~2016-17/2term/ma003/Notes/Lecture12.pdf){: .footer-link} 

{: .footer}
[3]  Weisstein, Eric W. "Binomial Coefficient." From MathWorld--A Wolfram Web Resource. [https://mathworld.wolfram.com/BinomialCoefficient.html](https://mathworld.wolfram.com/BinomialCoefficient.html){: .footer-link}  