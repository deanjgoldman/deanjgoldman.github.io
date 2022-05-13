---
layout: post_notebook
title: Modeling Kelp Observations as a Zero-Inflated Poisson Process
author: Dean Goldman
subtext: I share a project about modeling kelp population observation and making statistical inferences about population growth or decay. I go through a few statistical tests and some data analysis.
---

## Introduction

An important part of wildlife monitoring is assessing whether or not a species population has increased or decreased over time. In this post, I share a project that demonstrates statistical modeling applied to kelp observational data from KEEN (Kelp Ecosystem Ecology Network) with the goal of determining a statistically significant change over time in the rate of kelp observations. My goal for this post is to share a useful application of analyzing wildlife data with a statistical model, and breaking down some of the methods I used with some code I put together.

## Kelp Observation Dataset

In the KEEN dataset, divers collected marine life sightings from 13 kelp forest sites in regions around the Gulf of Maine between 2014 and 2018. The KEEN dataset captures a variety of wildlife including kelp, fish, algae, and invertebrates. This research will focus solely on the number of kelp sightings per "quadrat". A quadrat refers to a one square meter sample within a 40 meter transect of marine area at a general kelp forest site. Each transect contains six quadrats spaced eight meters apart, alternating on either side of the transect line.
<br/>
 <div class="row" style="display: flex; text-align: center;">
  <div class="column" style="flex: 50%;">
    <img src="/assets/images/quadrat_protocol.png" alt="quadrat protocol" style="height: 400px;"/>
    <figcaption class="footer">Fig 1. Illustration of quadrat protocol from the KEEN handbook [5].</figcaption>
  </div>
  <div class="column" style="flex: 50%;">
    <img src="/assets/images/keen_gulf_of_maine_map.png" alt="gulf of maine" style="width: 600px; margin-top: 20px;"/>
    <figcaption class="footer" style="margin-top: 10px;">Fig 2. Map of kelp forest sites in KEEN dataset.</figcaption>
  </div>
</div> 

## Modeling Kelp Populations as a Zero-Inflated Poisson Process

To study the behavior of a population of kelp over time, it is useful to to describe the observed data by some theoretical probability distribution. From this model, whose parameters are influenced by our data, we can draw probabilistic conclusions about the population's past behavior, and ascribe expectations around its potential and future behavior. This particular analysis attempts to express the probability of a given number of kelp observations occuring in a quadrat. This kind of probability distribution is called the Poisson distribution, and more generally the Poisson expresses the probability of a given number of independent events occuring in a fixed interval. You can read more about the Poisson distribution my other blogpost: [https://deanjgoldman.github.io/2022/04/15/Poisson-Distribution-Binomial.html](https://deanjgoldman.github.io/2022/04/15/Poisson-Distribution-Binomial.html).  
<br/>
One important thing to be aware of when using a Poisson distribution is that if there is some element of sparsity in the distribution of events, i.e. there are a lot of 0 counts, a useful modification of the Poisson is the Zero Inflated Poisson (ZIP) [3][4]. In the case of most these kelp sites, there are a lot more 0 counts than expected by a Poission with even the leanest rate parameter $$\lambda=1$$. A ZIP distribution inflates the expectation of the number of zeros, so it seems like a pretty good choice.
<br/>
<div style="margin-top:  20px; text-align: center;">
<img src="/assets/images/kelp_hist.png" alt="kelp frequencies" style="width: 800px;"/>
<figcaption class="footer">Fig 3. Histogram of Kelp Obs. per Quadrat. More zeros showing up here than in a simple Poisson distribution (bottom left). It more closely resembles other examples of zero-inflated data (bottom right)</figcaption>
</div>
<br/>
 <div class="row" style="display: flex; text-align: center;">
  <div class="column" style="flex: 50%;">
    <img src="/assets/images/poisson_distribution.png" alt="poisson distribution" style="width: 500px;"/>
    <figcaption class="footer" style="margin-top: 30px;">Fig 4. Poisson Distribution (Source: Wikipedia).</figcaption>
  </div>
  <div class="column" style="flex: 50%;">
    <img src="/assets/images/zip_poisson_example.png" alt="zip example" style="width: 500px;"/>
    <figcaption class="footer">Fig 5. An example of a Zero-Inflated Poisson density plot [6].</figcaption>
  </div>
</div> 

## Exploratory Analysis

A good starting point for analysis is to compute the empirical statistics of kelp observations per site, e.g. sample mean, variance, etc.

<div class="jp-Cell jp-CodeCell jp-Notebook-cell">
<div class="jp-Cell-inputWrapper">
<div class="jp-InputArea jp-Cell-inputArea">
<div class="jp-CodeMirrorEditor jp-Editor jp-InputArea-editor" data-type="inline">
     <div class="CodeMirror cm-s-jupyter">
<div class=" highlight hl-ipython3"><pre><span></span><span class="n">df</span><span class="o">.</span><span class="n">groupby</span><span class="p">([</span><span class="s2">&quot;SITE&quot;</span><span class="p">,</span> <span class="s2">&quot;YEAR&quot;</span><span class="p">])</span><span class="o">.</span><span class="n">describe</span><span class="p">()[</span><span class="s2">&quot;COUNT&quot;</span><span class="p">]</span>
</pre></div>

</div>
</div>
</div>
</div>

<div class="jp-Cell-outputWrapper">


<div class="jp-OutputArea jp-Cell-outputArea" style="height: 400px;">

<div class="jp-OutputArea-child">

<div class="jp-RenderedHTMLCommon jp-RenderedHTML jp-OutputArea-output jp-OutputArea-executeResult" data-mime-type="text/html">
<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th></th>
      <th>count</th>
      <th>mean</th>
      <th>std</th>
      <th>min</th>
      <th>25%</th>
      <th>50%</th>
      <th>75%</th>
      <th>max</th>
    </tr>
    <tr>
      <th>SITE</th>
      <th>YEAR</th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th rowspan="5" valign="top">Baker North</th>
      <th>2014</th>
      <td>71.0</td>
      <td>11.000000</td>
      <td>12.256777</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>6.0</td>
      <td>20.00</td>
      <td>43.0</td>
    </tr>
    <tr>
      <th>2015</th>
      <td>143.0</td>
      <td>4.825175</td>
      <td>6.913260</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>2.0</td>
      <td>7.00</td>
      <td>37.0</td>
    </tr>
    <tr>
      <th>2016</th>
      <td>144.0</td>
      <td>1.048611</td>
      <td>3.558364</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.00</td>
      <td>36.0</td>
    </tr>
    <tr>
      <th>2017</th>
      <td>120.0</td>
      <td>4.791667</td>
      <td>4.924464</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>3.0</td>
      <td>7.00</td>
      <td>20.0</td>
    </tr>
    <tr>
      <th>2018</th>
      <td>106.0</td>
      <td>3.500000</td>
      <td>5.304535</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>4.75</td>
      <td>21.0</td>
    </tr>
    <tr>
      <th rowspan="5" valign="top">Baker South</th>
      <th>2014</th>
      <td>88.0</td>
      <td>11.727273</td>
      <td>13.112008</td>
      <td>0.0</td>
      <td>2.0</td>
      <td>6.5</td>
      <td>20.25</td>
      <td>50.0</td>
    </tr>
    <tr>
      <th>2015</th>
      <td>144.0</td>
      <td>3.145833</td>
      <td>5.679024</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>3.25</td>
      <td>32.0</td>
    </tr>
    <tr>
      <th>2016</th>
      <td>144.0</td>
      <td>1.388889</td>
      <td>3.008406</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>1.00</td>
      <td>15.0</td>
    </tr>
    <tr>
      <th>2017</th>
      <td>108.0</td>
      <td>5.462963</td>
      <td>9.152321</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>6.00</td>
      <td>47.0</td>
    </tr>
    <tr>
      <th>2018</th>
      <td>114.0</td>
      <td>2.605263</td>
      <td>4.644186</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>3.00</td>
      <td>38.0</td>
    </tr>
    <tr>
      <th rowspan="4" valign="top">Calf Island</th>
      <th>2014</th>
      <td>138.0</td>
      <td>2.557971</td>
      <td>4.629354</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>3.00</td>
      <td>30.0</td>
    </tr>
    <tr>
      <th>2015</th>
      <td>159.0</td>
      <td>3.446541</td>
      <td>5.545722</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>4.00</td>
      <td>32.0</td>
    </tr>
    <tr>
      <th>2016</th>
      <td>174.0</td>
      <td>1.632184</td>
      <td>3.340468</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>1.75</td>
      <td>23.0</td>
    </tr>
    <tr>
      <th>2017</th>
      <td>96.0</td>
      <td>2.395833</td>
      <td>4.100011</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>3.00</td>
      <td>25.0</td>
    </tr>
    <tr>
      <th rowspan="3" valign="top">Fort Weatherill</th>
      <th>2016</th>
      <td>90.0</td>
      <td>2.555556</td>
      <td>5.348760</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>3.00</td>
      <td>40.0</td>
    </tr>
    <tr>
      <th>2017</th>
      <td>78.0</td>
      <td>1.410256</td>
      <td>2.802763</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>1.75</td>
      <td>17.0</td>
    </tr>
    <tr>
      <th>2018</th>
      <td>60.0</td>
      <td>3.516667</td>
      <td>5.074000</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>2.0</td>
      <td>4.25</td>
      <td>25.0</td>
    </tr>
    <tr>
      <th>Hurricane Island</th>
      <th>2017</th>
      <td>90.0</td>
      <td>3.033333</td>
      <td>4.407476</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>4.75</td>
      <td>22.0</td>
    </tr>
    <tr>
      <th rowspan="4" valign="top">Little Brewster</th>
      <th>2014</th>
      <td>96.0</td>
      <td>2.791667</td>
      <td>4.367142</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>4.00</td>
      <td>21.0</td>
    </tr>
    <tr>
      <th>2015</th>
      <td>162.0</td>
      <td>1.790123</td>
      <td>3.269342</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>2.00</td>
      <td>18.0</td>
    </tr>
    <tr>
      <th>2016</th>
      <td>162.0</td>
      <td>1.462963</td>
      <td>3.990889</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>1.00</td>
      <td>28.0</td>
    </tr>
    <tr>
      <th>2017</th>
      <td>54.0</td>
      <td>1.907407</td>
      <td>2.174193</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>3.00</td>
      <td>7.0</td>
    </tr>
    <tr>
      <th rowspan="5" valign="top">NE Appledore</th>
      <th>2014</th>
      <td>150.0</td>
      <td>1.846667</td>
      <td>5.154963</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>2.00</td>
      <td>36.0</td>
    </tr>
    <tr>
      <th>2015</th>
      <td>174.0</td>
      <td>4.614943</td>
      <td>7.464444</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>2.0</td>
      <td>6.00</td>
      <td>50.0</td>
    </tr>
    <tr>
      <th>2016</th>
      <td>72.0</td>
      <td>2.027778</td>
      <td>3.476165</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>2.25</td>
      <td>16.0</td>
    </tr>
    <tr>
      <th>2017</th>
      <td>84.0</td>
      <td>3.392857</td>
      <td>5.581851</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>5.00</td>
      <td>32.0</td>
    </tr>
    <tr>
      <th>2018</th>
      <td>90.0</td>
      <td>4.522222</td>
      <td>6.358623</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>2.0</td>
      <td>7.00</td>
      <td>31.0</td>
    </tr>
    <tr>
      <th rowspan="5" valign="top">NW Appledore</th>
      <th>2014</th>
      <td>138.0</td>
      <td>1.449275</td>
      <td>2.682935</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>2.00</td>
      <td>15.0</td>
    </tr>
    <tr>
      <th>2015</th>
      <td>156.0</td>
      <td>1.583333</td>
      <td>2.406867</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>2.00</td>
      <td>14.0</td>
    </tr>
    <tr>
      <th>2016</th>
      <td>48.0</td>
      <td>2.145833</td>
      <td>2.946253</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>3.00</td>
      <td>13.0</td>
    </tr>
    <tr>
      <th>2017</th>
      <td>108.0</td>
      <td>2.351852</td>
      <td>4.736643</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>3.00</td>
      <td>35.0</td>
    </tr>
    <tr>
      <th>2018</th>
      <td>72.0</td>
      <td>1.500000</td>
      <td>2.213912</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>2.00</td>
      <td>13.0</td>
    </tr>
    <tr>
      <th rowspan="4" valign="top">Nahant</th>
      <th>2015</th>
      <td>48.0</td>
      <td>6.458333</td>
      <td>7.216878</td>
      <td>0.0</td>
      <td>2.0</td>
      <td>4.0</td>
      <td>8.00</td>
      <td>40.0</td>
    </tr>
    <tr>
      <th>2016</th>
      <td>36.0</td>
      <td>2.722222</td>
      <td>3.637983</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>4.25</td>
      <td>12.0</td>
    </tr>
    <tr>
      <th>2017</th>
      <td>102.0</td>
      <td>3.656863</td>
      <td>3.465516</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>3.0</td>
      <td>5.00</td>
      <td>15.0</td>
    </tr>
    <tr>
      <th>2018</th>
      <td>90.0</td>
      <td>2.488889</td>
      <td>4.515254</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>3.00</td>
      <td>25.0</td>
    </tr>
    <tr>
      <th rowspan="3" valign="top">Nubble Lighthouse</th>
      <th>2014</th>
      <td>42.0</td>
      <td>0.952381</td>
      <td>2.378280</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>1.00</td>
      <td>10.0</td>
    </tr>
    <tr>
      <th>2015</th>
      <td>36.0</td>
      <td>3.555556</td>
      <td>4.999683</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>2.0</td>
      <td>5.00</td>
      <td>25.0</td>
    </tr>
    <tr>
      <th>2017</th>
      <td>108.0</td>
      <td>1.018519</td>
      <td>1.394123</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>2.00</td>
      <td>7.0</td>
    </tr>
    <tr>
      <th rowspan="2" valign="top">Pemaquid</th>
      <th>2016</th>
      <td>96.0</td>
      <td>2.781250</td>
      <td>3.750658</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>2.0</td>
      <td>4.00</td>
      <td>18.0</td>
    </tr>
    <tr>
      <th>2017</th>
      <td>90.0</td>
      <td>1.844444</td>
      <td>2.941035</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>1.0</td>
      <td>3.00</td>
      <td>19.0</td>
    </tr>
    <tr>
      <th rowspan="5" valign="top">SW Appledore</th>
      <th>2014</th>
      <td>114.0</td>
      <td>1.070175</td>
      <td>3.311870</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>1.00</td>
      <td>33.0</td>
    </tr>
    <tr>
      <th>2015</th>
      <td>168.0</td>
      <td>0.750000</td>
      <td>1.607430</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>1.00</td>
      <td>10.0</td>
    </tr>
    <tr>
      <th>2016</th>
      <td>78.0</td>
      <td>0.615385</td>
      <td>1.676660</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.00</td>
      <td>9.0</td>
    </tr>
    <tr>
      <th>2017</th>
      <td>78.0</td>
      <td>1.653846</td>
      <td>3.592297</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.5</td>
      <td>2.00</td>
      <td>27.0</td>
    </tr>
    <tr>
      <th>2018</th>
      <td>70.0</td>
      <td>1.214286</td>
      <td>3.202774</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>1.00</td>
      <td>22.0</td>
    </tr>
    <tr>
      <th>Schoodic</th>
      <th>2017</th>
      <td>126.0</td>
      <td>1.841270</td>
      <td>2.877256</td>
      <td>0.0</td>
      <td>0.0</td>
      <td>0.5</td>
      <td>3.00</td>
      <td>17.0</td>
    </tr>
  </tbody>
</table>
</div>
</div>
</div>
</div>
</div>
</div>
<br/>

From the sample statistics, we can see that assumptions of a Poisson (average rate $$\lambda$$ equals varaiance) are violated. In this case, $$\lambda$$ is much closer to the standard deviation than the variance. This is explained by the fact that that most sites tend have a good number of outlier counts, meaning that in some quadrats there were a relatively high number of kelp observations made. We can still move forward with the Poisson analysis, but this is an important observation to flag, and probably deserves its own accounting for in future modeling. 


## Parameterizing the Model

The basic Zero-Inflated Poisson distribution requires two parameters: $$p$$ and $$\lambda$$.

$$
\begin{aligned}
&P(Y=0) = p + (1 - p)e^{-\lambda}\\
&P(Y=k) = (1 - p)\frac{\lambda^{k}e^{-\lambda}}{k!}
\end{aligned}
\tag{1}
$$

The ZIP distribution's $$p$$ parameter represents the probability in a Bernoulli distribution determining whether an interval contains 0 events, or has a number of events determined by a Poisson with parameter $$\lambda$$. So the frequency of 0 counts generally "inflates" in a ZIP distribution. $$\lambda$$ is the expected rate of occurance in the Poisson process. For our case, it's the expected number of kelp in a quadrat. A common way to determine this value is to find the value of lambda where the probability that the observed data results from a Poisson distribution with that $$\lambda$$ value is higher than all other values. This is called Maximum Likelihood Estimation (MLE). This is a general method for finding parameters to a model, for the case of a very simple Poisson model, finding $$\lambda$$ through MLE is equivalent to taking the sample mean [2], but the ZIP distribution slightly deviates from this.

## Determing Goodness-of-Fit Between Theoretical Model and Observed Data

Although it seems plausible that kelp observations per quadrat meets the criteria of a ZIP process, we can't assume the probabiliy density of the number of kelp per quadrat neatly fits into that distribution. It may be the case that the events (a kelp plant sighting) aren't independent, as in the existence of one or more kelp plants may increase or decrease the probability of others nearby. A critical step in this analysis is the Chi-Square goodness-of-fit test, which will compare the observed distribution- the kelp- with the expected distribution- the Zero Inflated Poisson. The Chi-Square test for goodness of fit is performed by setting up a hypothesis test:

$$
\begin{aligned}
&H_{0}: X \sim \text{ZIP}(p, \lambda)\\
&vs.\\
&H_{A}: X \not\sim \text{ZIP}(p, \lambda)\\
&\\
&\text{Reject } H_{0} \text{ if } \chi^{2} > \chi^{2}{}_{1-\alpha,k-c}
\end{aligned}
$$

$$\chi^{2}$$ is the normalized sum of the squared difference between the observed frequency of a given number of events and the expected frequencies of those given number of events. This is to say that a single value in $$O$$ is the number of times the dataset reveals $$x$$ events occuring in the interval, and $$E$$ is the expected frequency of $$x$$ events occuring in an interval, assuming the null hypothesis is true. When the data fit well into a distribution, i.e. when the difference between $$O$$ and $$E$$ is small, we can induce that $$\chi^{2}$$ will be relatively small. 

$$
\chi^{2} = \Sigma\frac{(O-E)^{2}}{E}
\tag{1}
$$

We're interested in comparing $$\chi^{2}$$ with the theoretical number called the critical value, given by $$\chi^{2}{}_{1 - \alpha,k - c}$$. The critical value is derived from the Chi-Square distribution, the distribution of the sum of the squares of $$k$$ independent standard normal variables. In our case, $$k=1$$, because we're dealing with a single random variable- the number of kelp observations per quadrat.  

<!-- <div style='content: ""; clear: both; display: table;'>
  <div style='float: left; width: 40%; padding: 5px;'>
    <img src="/assets/images/chisq-pdf.png" style="width:100%">
    <figcaption style='text-align: center;'>Chi-Square Distribution PDF</figcaption>
  </div>
  <div style='float: left; width: 40%; padding: 5px;'>
    <img src="/assets/images/chisq-cdf.png" style="width:100%">
    <figcaption style='text-align: center;'>Chi-Square Distribution CDF</figcaption>
  </div>
</div> -->
  <br/>
The critical value is also the value at which which we are $$(1-\alpha)\%$$ certain that we are correctly rejecting our null hypothesis, given that our $$\chi^{2}$$ exceeds the critical value. Another way of running this hypothesis test is to compare the $$p$$-value derived from $$\chi^{2}$$ with our significance level $$\alpha$$. The $$p$$-value is the probability of observing a test statistic at least as large as $$\chi^{2}$$ given that the null hypothesis is true. This approach is similar to the comparison of critical values, the difference being that instead of comparing $$\chi^{2}$$ values, we are computing the probability that the deviation between $$\chi^{2}$$ and $$\chi^{2}{}_{1 - \alpha,k - c}$$ was within an allowed range, given that the null hypothesis is true [2]. If $$p < \alpha$$, that probability is low enough that we cannot assume it's chance, and may reject the null hypothesis. However, if the $$p$$-value is higher than $$\alpha$$, it's likely enough that the deviation between observed and expected is within an acceptable interval of error or randomness, so we fail to reject the null hypothesis. At a high-level, this is sort of like a method for comparing two histograms. Our two histograms being the histogram of observed kelp sightings per quadrat, and a theoretical Poisson pdf. 

## Implementation

I write out some python code for running the Chi-square goodness-of-fit test for a ZIP distribution.

<body class="jp-Notebook" data-jp-theme-light="true" data-jp-theme-name="JupyterLab Light">


<div class="jp-Cell jp-CodeCell jp-Notebook-cell   ">
<div class="jp-Cell-inputWrapper">
<div class="jp-InputArea jp-Cell-inputArea">
<div class="jp-CodeMirrorEditor jp-Editor jp-InputArea-editor" data-type="inline">
     <div class="CodeMirror cm-s-jupyter">
<div class=" highlight hl-ipython3"><pre><span></span><span class="k">def</span> <span class="nf">zip_pmf</span><span class="p">(</span><span class="n">x</span><span class="p">,</span> <span class="n">pi</span><span class="p">,</span> <span class="n">lambda_</span><span class="p">):</span>
    <span class="k">if</span> <span class="n">pi</span> <span class="o">&lt;</span> <span class="mi">0</span> <span class="ow">or</span> <span class="n">pi</span> <span class="o">&gt;</span> <span class="mi">1</span> <span class="ow">or</span> <span class="n">lambda_</span> <span class="o">&lt;=</span> <span class="mi">0</span><span class="p">:</span>
        <span class="k">return</span> <span class="n">np</span><span class="o">.</span><span class="n">zeros_like</span><span class="p">(</span><span class="n">x</span><span class="p">)</span>
    <span class="k">else</span><span class="p">:</span>
        <span class="k">return</span> <span class="p">(</span><span class="n">x</span> <span class="o">==</span> <span class="mi">0</span><span class="p">)</span> <span class="o">*</span> <span class="n">pi</span> <span class="o">+</span> <span class="p">(</span><span class="mi">1</span> <span class="o">-</span> <span class="n">pi</span><span class="p">)</span> <span class="o">*</span> <span class="n">stats</span><span class="o">.</span><span class="n">poisson</span><span class="o">.</span><span class="n">pmf</span><span class="p">(</span><span class="n">x</span><span class="p">,</span> <span class="n">lambda_</span><span class="p">)</span>

<span class="k">class</span> <span class="nc">ZeroInflatedPoisson</span><span class="p">(</span><span class="n">GenericLikelihoodModel</span><span class="p">):</span>
    <span class="k">def</span> <span class="fm">__init__</span><span class="p">(</span><span class="bp">self</span><span class="p">,</span> <span class="n">endog</span><span class="p">,</span> <span class="n">exog</span><span class="o">=</span><span class="kc">None</span><span class="p">,</span> <span class="o">**</span><span class="n">kwds</span><span class="p">):</span>
        <span class="sd">&quot;&quot;&quot;Maximum Likelihood Estimation of a Zero Inflated Poisson model.</span>
        <span class="sd"></span>
        <span class="sd">   source: https://austinrochford.com/posts/2015-03-03-mle-python-statsmodels.html</span>
        <span class="sd">&quot;&quot;&quot;</span>
        <span class="k">if</span> <span class="n">exog</span> <span class="ow">is</span> <span class="kc">None</span><span class="p">:</span>
            <span class="n">exog</span> <span class="o">=</span> <span class="n">np</span><span class="o">.</span><span class="n">zeros_like</span><span class="p">(</span><span class="n">endog</span><span class="p">)</span>
            
        <span class="nb">super</span><span class="p">(</span><span class="n">ZeroInflatedPoisson</span><span class="p">,</span> <span class="bp">self</span><span class="p">)</span><span class="o">.</span><span class="fm">__init__</span><span class="p">(</span><span class="n">endog</span><span class="p">,</span> <span class="n">exog</span><span class="p">,</span> <span class="o">**</span><span class="n">kwds</span><span class="p">)</span>
    
    <span class="k">def</span> <span class="nf">nloglikeobs</span><span class="p">(</span><span class="bp">self</span><span class="p">,</span> <span class="n">params</span><span class="p">):</span>
        <span class="n">pi</span> <span class="o">=</span> <span class="n">params</span><span class="p">[</span><span class="mi">0</span><span class="p">]</span>
        <span class="n">lambda_</span> <span class="o">=</span> <span class="n">params</span><span class="p">[</span><span class="mi">1</span><span class="p">]</span>

        <span class="k">return</span> <span class="o">-</span><span class="n">np</span><span class="o">.</span><span class="n">log</span><span class="p">(</span><span class="n">zip_pmf</span><span class="p">(</span><span class="bp">self</span><span class="o">.</span><span class="n">endog</span><span class="p">,</span> <span class="n">pi</span><span class="o">=</span><span class="n">pi</span><span class="p">,</span> <span class="n">lambda_</span><span class="o">=</span><span class="n">lambda_</span><span class="p">))</span>
    
    <span class="k">def</span> <span class="nf">fit</span><span class="p">(</span><span class="bp">self</span><span class="p">,</span> <span class="n">start_params</span><span class="o">=</span><span class="kc">None</span><span class="p">,</span> <span class="n">maxiter</span><span class="o">=</span><span class="mi">10000</span><span class="p">,</span> <span class="n">maxfun</span><span class="o">=</span><span class="mi">5000</span><span class="p">,</span> <span class="o">**</span><span class="n">kwds</span><span class="p">):</span>
        <span class="k">if</span> <span class="n">start_params</span> <span class="ow">is</span> <span class="kc">None</span><span class="p">:</span>
            <span class="n">lambda_start</span> <span class="o">=</span> <span class="bp">self</span><span class="o">.</span><span class="n">endog</span><span class="o">.</span><span class="n">mean</span><span class="p">()</span>
            <span class="n">excess_zeros</span> <span class="o">=</span> <span class="p">(</span><span class="bp">self</span><span class="o">.</span><span class="n">endog</span> <span class="o">==</span> <span class="mi">0</span><span class="p">)</span><span class="o">.</span><span class="n">mean</span><span class="p">()</span> <span class="o">-</span> <span class="n">stats</span><span class="o">.</span><span class="n">poisson</span><span class="o">.</span><span class="n">pmf</span><span class="p">(</span><span class="mi">0</span><span class="p">,</span> <span class="n">lambda_start</span><span class="p">)</span>
            
            <span class="n">start_params</span> <span class="o">=</span> <span class="n">np</span><span class="o">.</span><span class="n">array</span><span class="p">([</span><span class="n">excess_zeros</span><span class="p">,</span> <span class="n">lambda_start</span><span class="p">])</span>
            
        <span class="k">return</span> <span class="nb">super</span><span class="p">(</span><span class="n">ZeroInflatedPoisson</span><span class="p">,</span> <span class="bp">self</span><span class="p">)</span><span class="o">.</span><span class="n">fit</span><span class="p">(</span><span class="n">start_params</span><span class="o">=</span><span class="n">start_params</span><span class="p">,</span>
                                                    <span class="n">maxiter</span><span class="o">=</span><span class="n">maxiter</span><span class="p">,</span> <span class="n">maxfun</span><span class="o">=</span><span class="n">maxfun</span><span class="p">,</span> <span class="o">**</span><span class="n">kwds</span><span class="p">)</span>

<span class="c1">############################################</span>
<span class="c1"># Iterate through sites, run chi-square</span>
<span class="c1"># goodness-of-fit test for ZIP distribution</span>
<span class="c1">############################################</span>

<span class="k">for</span> <span class="n">site</span> <span class="ow">in</span> <span class="n">df</span><span class="p">[</span><span class="s2">&quot;SITE&quot;</span><span class="p">]</span><span class="o">.</span><span class="n">unique</span><span class="p">():</span>
    <span class="nb">print</span><span class="p">(</span><span class="n">site</span><span class="p">)</span>
    
    <span class="c1"># fit zip model to data</span>
    <span class="n">X</span> <span class="o">=</span> <span class="n">df</span><span class="p">[</span><span class="n">df</span><span class="p">[</span><span class="s2">&quot;SITE&quot;</span><span class="p">]</span> <span class="o">==</span> <span class="n">site</span><span class="p">][</span><span class="s2">&quot;COUNT&quot;</span><span class="p">]</span>
    <span class="n">model</span> <span class="o">=</span> <span class="n">ZeroInflatedPoisson</span><span class="p">(</span><span class="n">X</span><span class="p">)</span>
    <span class="n">results</span> <span class="o">=</span> <span class="n">model</span><span class="o">.</span><span class="n">fit</span><span class="p">()</span>
    
    <span class="c1"># compute ZIP pearson residuals, haven't included a qq plot yet</span>
    <span class="c1"># https://ncss-wpengine.netdna-ssl.com/wp-content/themes/ncss/pdf/Procedures/NCSS/Zero-Inflated_Poisson_Regression.pdf</span>
    <span class="n">pi</span><span class="p">,</span> <span class="n">lambda_</span> <span class="o">=</span> <span class="n">results</span><span class="o">.</span><span class="n">params</span>
    <span class="n">e</span> <span class="o">=</span> <span class="p">(</span><span class="mi">1</span> <span class="o">-</span> <span class="n">pi</span><span class="p">)</span><span class="o">*</span><span class="n">lambda_</span>
    <span class="n">v</span> <span class="o">=</span> <span class="p">(</span><span class="mi">1</span> <span class="o">-</span> <span class="n">pi</span><span class="p">)</span><span class="o">*</span><span class="n">lambda_</span><span class="o">*</span><span class="p">(</span><span class="mi">1</span><span class="o">+</span><span class="p">(</span><span class="n">pi</span><span class="o">*</span><span class="n">lambda_</span><span class="p">))</span>
    <span class="n">r</span> <span class="o">=</span> <span class="p">(</span><span class="n">X</span> <span class="o">-</span> <span class="n">e</span><span class="p">)</span> <span class="o">/</span> <span class="n">np</span><span class="o">.</span><span class="n">sqrt</span><span class="p">(</span><span class="n">v</span><span class="p">)</span>

    <span class="c1"># compute normalized difference between observed and expected, if the observed fits the expected,</span>
    <span class="c1"># the residuals from an observed minus expected and the residuals from a population sampled from the expected distribution</span>
    <span class="c1"># should both be normal distributions that pass a normal chi-square goodness-of-fit test (I'm pretty sure...).</span>
    <span class="n">r</span> <span class="o">=</span> <span class="p">(</span><span class="n">X</span> <span class="o">-</span> <span class="n">e</span><span class="p">)</span><span class="o">**</span><span class="mi">2</span> <span class="o">/</span> <span class="n">e</span>
    
    <span class="c1"># compute some sample sum of residuals</span>
    <span class="n">n</span> <span class="o">=</span> <span class="nb">len</span><span class="p">(</span><span class="n">r</span><span class="p">)</span>
    <span class="n">n_trials</span> <span class="o">=</span> <span class="mi">1000</span>
    <span class="n">g</span> <span class="o">=</span> <span class="n">np</span><span class="o">.</span><span class="n">empty</span><span class="p">(</span><span class="n">n_trials</span><span class="p">)</span>
    <span class="n">s</span> <span class="o">=</span> <span class="mf">0.3</span>
    <span class="k">for</span> <span class="n">ix</span> <span class="ow">in</span> <span class="nb">range</span><span class="p">(</span><span class="n">n_trials</span><span class="p">):</span>
        <span class="n">sn</span> <span class="o">=</span> <span class="n">np</span><span class="o">.</span><span class="n">round</span><span class="p">(</span><span class="n">s</span><span class="o">*</span><span class="n">n</span><span class="p">)</span>
        <span class="n">g</span><span class="p">[</span><span class="n">ix</span><span class="p">]</span> <span class="o">=</span> <span class="n">np</span><span class="o">.</span><span class="n">sum</span><span class="p">(</span><span class="n">r</span><span class="o">.</span><span class="n">sample</span><span class="p">(</span><span class="nb">int</span><span class="p">(</span><span class="n">sn</span><span class="p">)))</span> 
        
    <span class="c1"># determine chi-square goodness of fit</span>
    <span class="n">bins</span> <span class="o">=</span> <span class="mi">20</span>
    <span class="n">alpha</span> <span class="o">=</span> <span class="mf">0.01</span>
    <span class="n">observed</span> <span class="o">=</span> <span class="n">np</span><span class="o">.</span><span class="n">histogram</span><span class="p">(</span><span class="n">g</span><span class="p">,</span> <span class="n">bins</span><span class="o">=</span><span class="n">bins</span><span class="p">)</span>
    <span class="c1"># credit due to W. Weckesser for providing a helpful comment on stack overflow</span>
    <span class="c1">https://stackoverflow.com/questions/42888962/chi-squared-goodness-of-fit-test-in-python-way-too-low-p-values-but-the-fittin</span>
    <span class="n">bin_edges</span> <span class="o">=</span> <span class="n">observed</span><span class="p">[</span><span class="mi">1</span><span class="p">]</span>
    <span class="n">a1</span><span class="p">,</span> <span class="n">b1</span> <span class="o">=</span> <span class="n">stats</span><span class="o">.</span><span class="n">norm</span><span class="o">.</span><span class="n">fit</span><span class="p">(</span><span class="n">g</span><span class="p">)</span>
    <span class="n">cdf</span> <span class="o">=</span> <span class="n">stats</span><span class="o">.</span><span class="n">norm</span><span class="o">.</span><span class="n">cdf</span><span class="p">(</span><span class="n">bin_edges</span><span class="p">,</span> <span class="n">a1</span><span class="p">,</span> <span class="n">b1</span><span class="p">)</span>
    <span class="n">expected</span> <span class="o">=</span> <span class="n">np</span><span class="o">.</span><span class="n">round</span><span class="p">(</span><span class="nb">len</span><span class="p">(</span><span class="n">g</span><span class="p">)</span> <span class="o">*</span> <span class="n">np</span><span class="o">.</span><span class="n">diff</span><span class="p">(</span><span class="n">cdf</span><span class="p">))</span>
    <span class="n">test</span> <span class="o">=</span> <span class="n">stats</span><span class="o">.</span><span class="n">chisquare</span><span class="p">(</span><span class="n">observed</span><span class="p">[</span><span class="mi">0</span><span class="p">],</span> <span class="n">expected</span><span class="p">,</span> <span class="n">ddof</span><span class="o">=</span><span class="mi">1</span><span class="p">)</span>
    <span class="nb">print</span><span class="p">(</span><span class="sa">f</span><span class="s2">&quot;Chi-square goodness-of-fit test result - Reject H0: </span><span class="si">{</span><span class="n">test</span><span class="o">.</span><span class="n">pvalue</span> <span class="o">&lt;</span> <span class="n">alpha</span><span class="si">}</span><span class="s2"> (</span><span class="si">{</span><span class="n">np</span><span class="o">.</span><span class="n">round</span><span class="p">(</span><span class="n">test</span><span class="o">.</span><span class="n">pvalue</span><span class="p">,</span> <span class="mi">4</span><span class="p">)</span><span class="si">}</span><span class="s2">)&quot;</span><span class="p">)</span>
    
    <span class="c1"># plot histograms</span>
    <span class="n">fig</span><span class="p">,</span> <span class="n">ax</span> <span class="o">=</span> <span class="n">plt</span><span class="o">.</span><span class="n">subplots</span><span class="p">(</span><span class="n">figsize</span><span class="o">=</span><span class="p">(</span><span class="mi">8</span><span class="p">,</span><span class="mi">4</span><span class="p">))</span>
    <span class="n">width</span> <span class="o">=</span> <span class="p">(</span><span class="n">np</span><span class="o">.</span><span class="n">max</span><span class="p">(</span><span class="n">observed</span><span class="p">[</span><span class="mi">1</span><span class="p">][:</span><span class="o">-</span><span class="mi">1</span><span class="p">])</span> <span class="o">-</span> <span class="n">np</span><span class="o">.</span><span class="n">min</span><span class="p">(</span><span class="n">observed</span><span class="p">[</span><span class="mi">1</span><span class="p">][:</span><span class="o">-</span><span class="mi">1</span><span class="p">]))</span> <span class="o">/</span> <span class="n">bins</span>
    <span class="n">ax</span><span class="o">.</span><span class="n">bar</span><span class="p">(</span><span class="n">observed</span><span class="p">[</span><span class="mi">1</span><span class="p">][:</span><span class="o">-</span><span class="mi">1</span><span class="p">],</span> <span class="n">observed</span><span class="p">[</span><span class="mi">0</span><span class="p">],</span> <span class="n">width</span><span class="o">=</span><span class="n">width</span><span class="p">,</span> <span class="n">alpha</span><span class="o">=</span><span class="mf">0.5</span><span class="p">,</span> <span class="n">label</span><span class="o">=</span><span class="s2">&quot;observed&quot;</span><span class="p">)</span>
    <span class="n">ax</span><span class="o">.</span><span class="n">bar</span><span class="p">(</span><span class="n">observed</span><span class="p">[</span><span class="mi">1</span><span class="p">][:</span><span class="o">-</span><span class="mi">1</span><span class="p">],</span> <span class="n">expected</span><span class="p">,</span> <span class="n">width</span><span class="o">=</span><span class="n">width</span><span class="p">,</span> <span class="n">alpha</span><span class="o">=</span><span class="mf">0.5</span><span class="p">,</span> <span class="n">label</span><span class="o">=</span><span class="s2">&quot;expected&quot;</span><span class="p">)</span>
    <span class="n">ax</span><span class="o">.</span><span class="n">legend</span><span class="p">()</span>
    <span class="n">fig</span><span class="o">.</span><span class="n">tight_layout</span><span class="p">()</span>
    <span class="n">plt</span><span class="o">.</span><span class="n">show</span><span class="p">()</span>
    <span class="n">plt</span><span class="o">.</span><span class="n">close</span><span class="p">()</span>
</pre></div>

     </div>
</div>
</div>
</div>

<div class="jp-Cell-outputWrapper">


<div class="jp-OutputArea jp-Cell-outputArea">

<div class="jp-OutputArea-child">

    
    <div class="jp-OutputPrompt jp-OutputArea-prompt"></div>


<div class="jp-RenderedText jp-OutputArea-output" data-mime-type="text/plain">
<pre>Baker North
Optimization terminated successfully.
         Current function value: 3.753068
         Iterations: 36
         Function evaluations: 71
Pearson residual: -0.0075
Chi-square goodness-of-fit test result - Reject H0: False (0.5403)
</pre>
</div>
</div>

<div class="jp-OutputArea-child">

    
    <div class="jp-OutputPrompt jp-OutputArea-prompt"></div>




<div class="jp-RenderedImage jp-OutputArea-output ">
<img src="data:image/png;base64,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0cOsixYt4q9//StnnHFGk9737sM5a2t3uvK7SQw4ktq8OSvXV63vgUOr1rW0T1u0aBELFixocsBpKR6ikiRpH/Cb3/yGuro6+vbtyyWXXMK8efPo06cPW7ZsYdOmTfTu3ZslS5bw+OOPM3jwYD73uc/Ro0cPLr30UrZt2wbUPzBz4MCB9OvXjy984QvbH7b51FNPcfzxx3PMMcdQV1fHxo0bufHGG5k8eTJ9+/Zl8uTJbNq0iYsuuoi6ujqOPfZYHn74YQA2b97MeeedR8+ePTn77LPZvHlzi3xfZ3AkSSq5ZcuWMXnyZJ588knat2/PV7/6VZYvX87w4cP59re/zebNm7nwwgs5+uijefzxx5k/fz5Lly7lk5/8JKeffjoPPvggQ4YM4eabb+bRRx+lU6dO/OAHP+C2227juuuuY+TIkUyePJn+/fvz6quv0rFjR773ve+xYMEC7rzzTgCuv/56hg0bxqRJk9iwYQN1dXWcfPLJ3HXXXXTs2JFly5axePFi+vXr1yLf2YAjSVLJzZw5k4ULF9K/f3+gftbk4x//ODfeeCP9+/enpqaG22+/ffv2dXV1fOpTnwLg/PPPZ/bs2dTU1LB06VIGDRoEwFtvvcXAgQNZvnw5hx122Pa+DzzwwF3W8MgjjzBt2jTGjat//MqWLVtYtWoVTzzxBF/72tcA6NOnz/aHc1bKgCNJUsllJqNGjeKWW957gvOaNWt4/fXXefvtt9myZQudOnUCoHhKwXYRQWZyyimncN99971n3XPPPdfoGh544AF69OhRwTdpPM/BkSSp5E466SSmTp3K2rVrAfj73//OSy+9xCWXXML3v/99LrjgAq699trt28+fP58XX3yRbdu2MXnyZE444QQGDBjAk08+yYoVKwDYtGkTL7zwAj169GDNmjU89dRTALz22mts3bqVAw44gNdee217n6eddhp33HEH7z7k+5lnngFg8ODB3HvvvQAsWbKExYsXt8h3dgZHkqQ9qRUu6+7Vqxc333wzp556Ktu2baN9+/aMGDGC9u3b88UvfpF33nmH448/nscee4z99tuP/v37c8UVV7BixQqGDh3K2WefzX777cevfvUrzj//fN58800Abr75Zo466igmT57MlVdeyebNm+nQoQOPPvooQ4cO5dZbb6Vv376MHTuWG264gauvvpo+ffqwbds2unfvzvTp07nssssYPXo0PXv2pGfPnhx33HEt8p0NOJIk7QNGjhzJyJEjd7lu//33Z968eQA8/vjjHHjggUyfPn2n7YYNG7Z9pqah/v37M3fu3J3ad9z2rrvu2mmbDh06cP/99zfqOzSFAUfaB8yZ+I2q9T1wzLiq9S1JzWXAkSRJ2w0ZMoQhQ4a0dhkV8yRjSZKq7N0Ta9V8TR1DA44kSVVUU1PD+vXrDTkVyEzWr19PTU1No9/jISpJkqqoa9eurF69mnXr1rV2KXu1mpoaunbt2ujtDTiSJFVR+/bt6d69e2uXsc/xEJUkSSodA44kSSodA44kSSodA44kSSodA44kSSodr6KSpFm3VK/vVniwoiRncCRJUgkZcCRJUukYcCRJUukYcCRJUukYcCRJUukYcCRJUul8YMCJiEkRsTYiljRo+1hEzIiIPxY/Dy7aIyJuj4gVEbE4IvpVs3hJkqRdacwMzq+A03douw6YmZlHAjOLZYDPAkcW/10M/KxlypQkSWq8Dww4mfkE8PcdmkcAdxev7wbOatD+66w3FzgoIg5roVolSZIapbnn4ByamWuK168AhxavDwf+0mC71UXbTiLi4ohYEBEL1q1b18wyJEmSdlbxScaZmUA2430TMrM2M2u7dOlSaRmSJEnbNTfg/O3dQ0/Fz7VF+8vAEQ2261q0SZIk7THNDTjTgFHF61HAww3a/6W4mmoAsLHBoSxJkqQ94gOfJh4R9wFDgEMiYjXwHeBWYEpEjAFeAs4tNv8P4AxgBfAGMLoKNUuSJL2vDww4mXn+bladtIttE7i80qIkSZIq8YEBR5LKbs7K9VXre+DQqnUt6X34qAZJklQ6BhxJklQ6BhxJklQ6noMjtQWzbqle30PHVq9vSWqjnMGRJEmlY8CRJEmlY8CRJEmlY8CRJEmlY8CRJEmlY8CRJEmlY8CRJEmlY8CRJEmlY8CRJEmlY8CRJEmlY8CRJEmlY8CRJEml48M2pUYYP+OFqvV9zSlHVa1vSdpXOYMjSZJKx4AjSZJKx4AjSZJKx4AjSZJKx4AjSZJKx6uoJKnaZt1Svb6Hjq1e39JezBkcSZJUOgYcSZJUOgYcSZJUOgYcSZJUOgYcSZJUOl5FJbUBc1aur1rfA4dWrWtJarMqmsGJiGsi4vmIWBIR90VETUR0j4h5EbEiIiZHxIdaqlhJkqTGaPYMTkQcDnwN6JWZmyNiCnAecAYwPjPvj4ifA2OAn7VItZK0F3KGTtrzKj0Hpx3QISLaAR2BNcAwYGqx/m7grAo/Q5IkqUmaHXAy82VgHLCK+mCzEVgIbMjMrcVmq4HDd/X+iLg4IhZExIJ169Y1twxJkqSdNDvgRMTBwAigO/C/gU7A6Y19f2ZOyMzazKzt0qVLc8uQJEnaSSWHqE4GXszMdZn5NvAgMAg4qDhkBdAVeLnCGiVJkpqkkoCzChgQER0jIoCTgKXALOCcYptRwMOVlShJktQ0lZyDM4/6k4mfBp4r+poAXAv8a0SsADoDE1ugTkmSpEar6EZ/mfkd4Ds7NK8E6irpV5IkqRI+qkGSJJWOAUeSJJWOAUeSJJWOAUeSJJWOTxOXpL3c+BkvVK3va045qmp9S9XkDI4kSSodZ3CkRhiwakIVex9Xxb4lad/kDI4kSSodA44kSSodA44kSSodA44kSSodA44kSSodA44kSSodA44kSSodA44kSSodA44kSSodA44kSSodA44kSSodA44kSSodA44kSSodA44kSSodA44kSSodA44kSSodA44kSSodA44kSSqddq1dgCSpMgNWTahi7+Oq2LdUPc7gSJKk0jHgSJKk0jHgSJKk0vEcHJXC+BkvVKXfa045qir9SpKqq6IZnIg4KCKmRsQfImJZRAyMiI9FxIyI+GPx8+CWKlaSJKkxKj1E9WPgvzLz08AxwDLgOmBmZh4JzCyWJUmS9phmB5yI+CgwGJgIkJlvZeYGYARwd7HZ3cBZlZUoSZLUNJXM4HQH1gG/jIhnIuIXEdEJODQz1xTbvAIcuqs3R8TFEbEgIhasW7eugjIkSZLeq5KA0w7oB/wsM48FNrHD4ajMTCB39ebMnJCZtZlZ26VLlwrKkCRJeq9KAs5qYHVmziuWp1IfeP4WEYcBFD/XVlaiJElS0zQ74GTmK8BfIqJH0XQSsBSYBowq2kYBD1dUoSRJUhNVeh+cK4F7IuJDwEpgNPWhaUpEjAFeAs6t8DMkSZKapKKAk5mLgNpdrDqpkn4lSZIq4aMaJElS6RhwJElS6RhwJElS6RhwJElS6RhwJElS6RhwJElS6RhwJElS6RhwJElS6VR6J2OpTRiwakKVeh5XpX4lSdXkDI4kSSodA44kSSodA44kSSodA44kSSodA44kSSodA44kSSodA44kSSodA44kSSodA44kSSodA44kSSodA44kSSodA44kSSodH7YpSXpf42e8ULW+rznlqKr1rX2bMziSJKl0DDiSJKl0DDiSJKl0PAdHkvS+BqyaUMXex1Wxb+3LnMGRJEmlY8CRJEmlY8CRJEmlY8CRJEmlU3HAiYj9I+KZiJheLHePiHkRsSIiJkfEhyovU5IkqfFaYgbnKmBZg+UfAOMz85+A/wHGtMBnSJIkNVpFASciugKfA35RLAcwDJhabHI3cFYlnyFJktRUlc7g/Aj4JrCtWO4MbMjMrcXyauDwXb0xIi6OiAURsWDdunUVliFJkvQPzQ44EXEmsDYzFzbn/Zk5ITNrM7O2S5cuzS1DkiRpJ5XcyXgQMDwizgBqgAOBHwMHRUS7YhanK/By5WVKkiQ1XrNncDJzbGZ2zcxuwHnAY5l5ATALOKfYbBTwcMVVSpIkNUE17oNzLfCvEbGC+nNyJlbhMyRJknarRR62mZmPA48Xr1cCdS3RryRJUnN4J2NJklQ6BhxJklQ6BhxJklQ6BhxJklQ6BhxJklQ6BhxJklQ6LXKZuPSBZt1SnX6Hjq1Ov5KkvZozOJIkqXQMOJIkqXQMOJIkqXQMOJIkqXQ8yVh7xJyV66vS78ChVelWkrSXcwZHkiSVjgFHkiSVjgFHkiSVjgFHkiSVjgFHkiSVjgFHkiSVjgFHkiSVjvfBkSS1rmo9jBd8IO8+zBkcSZJUOgYcSZJUOgYcSZJUOgYcSZJUOgYcSZJUOgYcSZJUOgYcSZJUOgYcSZJUOgYcSZJUOgYcSZJUOs0OOBFxRETMioilEfF8RFxVtH8sImZExB+Lnwe3XLmSJEkfrJIZnK3A1zOzFzAAuDwiegHXATMz80hgZrEsSZK0xzQ74GTmmsx8unj9GrAMOBwYAdxdbHY3cFaFNUqSJDVJizxNPCK6AccC84BDM3NNseoV4NDdvOdi4GKAT3ziEy1RhpppzsRvVK3vgWPGVa1vSZJ2p+KTjCPiI8ADwNWZ+WrDdZmZQO7qfZk5ITNrM7O2S5culZYhSZK0XUUBJyLaUx9u7snMB4vmv0XEYcX6w4C1lZUoSZLUNJVcRRXARGBZZt7WYNU0YFTxehTwcPPLkyRJarpKzsEZBHwJeC4iFhVt1wO3AlMiYgzwEnBuRRVKkkptzsr1Vet74NCqda02rtkBJzNnA7Gb1Sc1t19JkqRKeSdjSZJUOgYcSZJUOgYcSZJUOgYcSZJUOi1yJ2NJktqsWbdUr++hY6vXtyriDI4kSSodA44kSSodD1FJkkrNGwnum5zBkSRJpWPAkSRJpWPAkSRJpeM5OHuBORO/UbW+B44ZV7W+JWlfMX7GC1Xp95pTjqpKv/sCZ3AkSVLpGHAkSVLpGHAkSVLpGHAkSVLpGHAkSVLpeBWVJEkVGrBqQpV69krX5nIGR5IklY4zOJIktXHVus8OlPdeO87gSJKk0nEGpyXMuqV6fQ8dW72+JUkqKWdwJElS6TiD0wLmrFxftb4HDq1a15IklZYzOJIkqXScwZEkqY2r3n12oKz32nEGR5Iklc6+MYPjVU6SJO1WGe+z4wyOJEkqnX1iBsernCRJ2r0ynuNTtRmciDg9IpZHxIqIuK5anyNJkrSjqgSciNgf+AnwWaAXcH5E9KrGZ0mSJO2oWjM4dcCKzFyZmW8B9wMjqvRZkiRJ7xGZ2fKdRpwDnJ6ZXymWvwR8JjOvaLDNxcDFxWIPYHmLF9J4hwD/3Yqfv7dz/JrPsWs+x64yjl/zOXbNV42x+2RmdtmxsdVOMs7MCUA1z2pqtIhYkJm1rV3H3srxaz7Hrvkcu8o4fs3n2DXfnhy7ah2iehk4osFy16JNkiSp6qoVcJ4CjoyI7hHxIeA8YFqVPkuSJOk9qnKIKjO3RsQVwO+A/YFJmfl8NT6rhbSJQ2V7Mcev+Ry75nPsKuP4NZ9j13x7bOyqcpKxJElSa/JRDZIkqXQMOJIkqXT2+YATEVdGxB8i4vmI+GGD9rHFYyaWR8RprVljWxYRX4+IjIhDiuWIiNuLsVscEf1au8a2JiL+vdjnFkfEQxFxUIN17neN4KNgGi8ijoiIWRGxtPg9d1XR/rGImBERfyx+HtzatbZVEbF/RDwTEdOL5e4RMa/Y/yYXF9NoFyLioIiYWvzOWxYRA/fUvrdPB5yIGEr9HZaPyczeFE8EKx4rcR7QGzgd+Gnx+Ak1EBFHAKcCqxo0fxY4svjvYuBnrVBaWzcDODoz+wAvAGPB/a6xfBRMk20Fvp6ZvYABwOXFeF0HzMzMI4GZxbJ27SpgWYPlHwDjM/OfgP8BxrRKVXuHHwP/lZmfBo6hfhz3yL63Twcc4DLg1sx8EyAz1xbtI4D7M/PNzHwRWEH94yf0XuOBbwINz1QfAfw6680FDoqIw1qlujYqMx/JzK3F4lzq7xMF7neN5aNgmiAz12Tm08Xr16j/B+Zw6sfs7mKzu4GzWqXANi4iugKfA35RLAcwDJhabOLY7UZEfBQYDEwEyMy3MnMDe2jf29cDzlHAicVU4/+LiP5F++HAXxpst7poUyEiRgAvZ+azO6xy7JrmIuA/i9eOXeM4Ts0UEd2AY4F5wKGZuaZY9QpwaGvV1cb9iPo/5LYVy52BDQ3+SHH/273uwDrgl8Uhvl9ERCf20L7Xao9q2FMi4lHgf+1i1beo//4fo37atj8wJSI+tQfLa9M+YOyup/7wlHbh/cYuMx8utvkW9YcP7tmTtWnfFBEfAR4Ars7MV+snIuplZkaE9wzZQUScCazNzIURMaSVy9kbtQP6AVdm5ryI+DE7HI6q5r5X+oCTmSfvbl1EXAY8mPU3A5ofEduofxCYj5pg92MXEf+H+mT+bPFLsivwdETU4dgB77/fAUTEl4EzgZPyHzejcuwax3FqoohoT324uSczHyya/xYRh2XmmuIw8trd97DPGgQMj4gzgBrgQOrPKTkoItoVszjuf7u3GlidmfOK5anUB5w9su/t64eofgsMBYiIo4APUf+U02nAeRHx4YjoTv0Js/Nbq8i2JjOfy8yPZ2a3zOxG/U7cLzNfoX7s/qW4mmoAsLHBVKSovwKI+inv4Zn5RoNV7neN46NgmqA4Z2QisCwzb2uwahowqng9Cnh4T9fW1mXm2MzsWvyeOw94LDMvAGYB5xSbOXa7Ufyb8JeI6FE0nQQsZQ/te6WfwfkAk4BJEbEEeAsYVfw1/XxETKH+f8RW4PLMfKcV69yb/AdwBvUnyL4BjG7dctqkO4EPAzOKGbC5mXlpZrrfNcJe+CiY1jYI+BLwXEQsKtquB26l/rD8GOAl4NzWKW+vdC1wf0TcDDxDcRKtdulK4J7ij5GV1P+bsB97YN/zUQ2SJKl09vVDVJIkqYQMOJIkqXQMOJIkqXQMOJIkqXQMOJIkqXQMOJIkqXQMOJIkqXT+P9ZKd9NduH1MAAAAAElFTkSuQmCC
"
>
</div>

</div>

<div class="jp-OutputArea-child">

    
    <div class="jp-OutputPrompt jp-OutputArea-prompt"></div>


<div class="jp-RenderedText jp-OutputArea-output" data-mime-type="text/plain">
<pre>Baker South
Optimization terminated successfully.
         Current function value: 4.099956
         Iterations: 40
         Function evaluations: 77
Pearson residual: 0.0009
Chi-square goodness-of-fit test result - Reject H0: False (0.9565)
</pre>
</div>
</div>

<div class="jp-OutputArea-child">

    
    <div class="jp-OutputPrompt jp-OutputArea-prompt"></div>




<div class="jp-RenderedImage jp-OutputArea-output ">
<img src="data:image/png;base64,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jVNr2PvkGvYtdV+LFi2ioaGhzQGnoxhwJFXNACLt/n72s59xyy238M4773Dsscdy0UUX8aUvfYkFCxbw7rvvMmzYMGbMmMGf//xnrrnmGvbee29WrFjBqFGjuP3229ljjz149NFHufbaa3n77bf5+Mc/zp133slee+3FM888w8SJE3nzzTf54Ac/yOzZs7nmmmtYt24dc+fOZdKkSZx55plMmDCBJUuWsGHDBq677jrGjBnDunXrGDduHM8//zxHHHEE69at65DPa8CRJKnkli1bxowZM/jlL39Jz549+cpXvsLy5cs566yz+Na3vsW6deu48MILOfroo3nyySdZsGABS5cu5aMf/Sinn346Dz74ICNHjuT666/nscceo0+fPnzve9/jpptu4sorr+S8885jxowZDB06lNdee43evXvzne98h4aGBm677TYArrrqKkaPHs306dNZu3Ytw4YN4+STT+aOO+6gd+/eLFu2jMWLFzNkyJAO+cwGHEmSSm7OnDksXLiQoUOHArBu3To+/OEPc8011zB06FDq6uq45ZZbNu8/bNgwPvaxjwFw/vnnM3fuXOrq6li6dCkjRowA4J133uG4445j+fLlHHzwwZv73meffbZbw6OPPsqsWbOYPLkyK7t+/XoaGxt56qmn+OpXvwrA4MGDNz+cs1oGHEmSSi4zGTt2LDfcsOUFzqtWreKNN95gw4YNrF+/nj59+gBQPEx7s4ggMznllFO49957t9j2wgsvtLqGBx54gIEDB1bxSVrP++BIklRyJ510EjNnzmT16tUA/OUvf+Hll1/mn//5n/nud7/LBRdcwDe+8Y3N+y9YsICXXnqJTZs2MWPGDI4//niGDx/OL3/5S1asWAHAm2++yYsvvsjAgQNZtWoVzzzzDACvv/46GzduZO+99+b111/f3Odpp53GrbfeynsP+X7uuecAOPHEE7nnnnsAWLJkCYsXL+6Qz+wMjiRJu1InfK37yCOP5Prrr+fUU09l06ZN9OzZkzFjxtCzZ0/+4R/+gXfffZdPfepTPP744+yxxx4MHTqUyy67bPNFxp/97GfZY489+OlPf8r555/P22+/DcD111/P4YcfzowZM5gwYQLr1q2jV69ePPbYY4waNYobb7yRY445hkmTJnH11Vdz+eWXM3jwYDZt2sSAAQN45JFHuOSSSxg3bhyDBg1i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
"
>
</div>

</div>

<div class="jp-OutputArea-child">

    
    <div class="jp-OutputPrompt jp-OutputArea-prompt"></div>


<div class="jp-RenderedText jp-OutputArea-output" data-mime-type="text/plain">
<pre>Calf Island
Optimization terminated successfully.
         Current function value: 2.826812
         Iterations: 39
         Function evaluations: 78
Pearson residual: -0.0091
Chi-square goodness-of-fit test result - Reject H0: False (0.469)
</pre>
</div>
</div>

<div class="jp-OutputArea-child">

    
    <div class="jp-OutputPrompt jp-OutputArea-prompt"></div>




<div class="jp-RenderedImage jp-OutputArea-output ">
<img src="data:image/png;base64,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vJOxpIo9tXxN1foePLxqXUsqMQOOJEk7U0s/OqWNPi5lwYIF/OUvf+GEE05o0vs+fDjngAEDKvr8ii4TlyRJ2pYFCxbw29/+ttU+34AjSdIu4De/+Q21tbX069eP8847jzlz5tC3b1/Wr1/P22+/TZ8+fVi0aBGPPfYYQ4cO5Ytf/CK9evXi/PPPZ+PGjUD9AzMHDx5M//79+fKXv7zpYZtPP/00Rx55JIcddhi1tbW8/vrrXHXVVdTV1dGvXz/q6up4++23Oeecc6itreXwww/ngQceAGDdunWcfvrp9O7dm5NPPpl169a1yPf1EJUkSSW3ZMkS6urqePLJJ+nYsSNf//rXWbp0KSeeeCLf/e53WbduHWeddRaHHnoojz32GHPnzmXx4sV86lOf4vjjj+e+++5j2LBhXHvttTz88MPsscce3HDDDdx4441MmDCB0047jbq6OgYOHMgbb7xB586d+f73v8+8efO45ZZbALjiiisYMWIE06ZNY+3atdTW1nLMMcdw66230rlzZ5YsWcLChQvp379/i3xnA44kSSU3a9Ys5s+fz8CBA4H6WZNPfvKTXHXVVQwcOJCamhpuuummTdvX1tZuesjmGWecwRNPPEFNTQ2LFy9myJAhALz33nsMHjyYpUuXsv/++2/qe6+99tpmDQ899BAzZsxg0qRJAKxfv54VK1bw+OOPc/HFFwPQt2/fTQ/nrJQBR5KkkstMxowZw3XXbX6C86pVq3jrrbd4//33Wb9+PXvssQcAxT3uNokIMpNjjz2Wu+66a7N1zz33XKNruPfee+nVq1cF36TxPAdHkqSSO/roo5k+fTqvvfYaAH/72994+eWXOe+88/jBD37AmWeeyeWXX75p+7lz5/LSSy+xceNG6urqOOqooxg0aBBPPvkky5YtA+Dtt9/mxRdfpFevXqxatYqnn34agDfffJMNGzaw55578uabb27q87jjjuPmm2/mw6c7PfvsswAMHTqUO++8E4BFixaxcOHCFvnOzuBIavta+rLahtroJbYqsVbY5w455BCuvfZaRo4cycaNG+nYsSOjR4+mY8eOfOUrX+GDDz7gyCOP5JFHHmG33XZj4MCBfOMb32DZsmUMHz6ck08+md12241f/epXnHHGGbz77rsAXHvttfTs2ZO6ujouuugi1q1bR6dOnXj44YcZPnw4119/Pf369WPixIlceeWVXHLJJfTt25eNGzfSo0cPHnzwQS644ALGjh1L79696d27N0cccUSLfGcDjiRJu4DTTjuN0047bZvrdt99d+bMmQPAY489xl577cWDDz641XYjRozYNFPT0MCBA5k9e/ZW7Vtue+utt261TadOnbj77rsb9R2awkNUkiSpdJzBkSRJmwwbNoxhw4a1dhkVcwZHkqQq+/DEWjVfU8fQgCNJUhXV1NSwZs0aQ04FMpM1a9ZQU1PT6Pd4iEqSpCrq1q0bK1euZPXq1a1dSrtWU1NDt27dGr29AUdqAwatmFLF3idVsW9JO9KxY0d69OjR2mXscjxEJUmSSseAI0mSSseAI0mSSseAI0mSSseAI0mSSseAI0mSSseAI0mSSsf74Ei7gKeWr6la34OHV61rSWo2Z3AkSVLpOIMjqc1zBkpSUzmDI0mSSseAI0mSSseAI0mSSmeHAScipkXEaxGxqEHbJyJiZkT8ofi5T9EeEXFTRCyLiIUR0b+axUuSJG1LY2ZwfgUcv0XbBGBWZh4MzCqWAb4AHFz8Oxf4WcuUKUmS1Hg7DDiZ+Tjwty2aRwO3Fa9vA05q0H571psN7B0R+7dQrZIkSY3S3HNw9svMVcXrV4H9itcHAH9usN3Kok2SJGmnqfg+OJmZEZFNfV9EnEv9YSwOOuigSsuQqmryzBer1velx/asWt9qHP/7SuXT3Bmcv3546Kn4+VrR/gpwYIPtuhVtW8nMKZk5IDMHdO3atZllSJIkba25AWcGMKZ4PQZ4oEH7vxVXUw0CXm9wKEuSJGmn2OEhqoi4CxgG7BsRK4HvAdcD90TEOOBl4NRi898CJwDLgHeAsVWoWZIk6SPtMOBk5hnbWXX0NrZN4MJKi5IkSaqEdzKWJEmlY8CRJEmlY8CRJEmlY8CRJEmlY8CRJEmlY8CRJEmlU/GjGiSpvRu0YkoVe59Uxb4lbY8zOJIkqXQMOJIkqXQMOJIkqXQMOJIkqXQMOJIkqXQMOJIkqXQMOJIkqXQMOJIkqXQMOJIkqXS8k7HUCN7pVpLaF2dwJElS6RhwJElS6RhwJElS6RhwJElS6RhwJElS6RhwJElS6RhwJElS6RhwJElS6RhwJElS6RhwJElS6RhwJElS6RhwJElS6RhwJElS6VQUcCLi0oh4PiIWRcRdEVETET0iYk5ELIuIuoj4WEsVK0mS1BjNDjgRcQBwMTAgMw8FdgdOB24AJmfmZ4C/A+NaolBJkqTGqvQQVQegU0R0ADoDq4ARwPRi/W3ASRV+hiRJUpM0O+Bk5ivAJGAF9cHmdWA+sDYzNxSbrQQO2Nb7I+LciJgXEfNWr17d3DIkSZK2Uskhqn2A0UAP4F+APYDjG/v+zJySmQMyc0DXrl2bW4YkSdJWKjlEdQzwUmauzsz3gfuAIcDexSErgG7AKxXWKEmS1CSVBJwVwKCI6BwRARwNLAYeBU4pthkDPFBZiZIkSU1TyTk4c6g/mfgZ4LmirynA5cBlEbEM6AJMbYE6JUmSGq3DjjfZvsz8HvC9LZqXA7WV9CtJklQJ72QsSZJKx4AjSZJKx4AjSZJKx4AjSZJKx4AjSZJKx4AjSZJKp6LLxKW2YvLMF6vS76XH9qxKv5Kk6nIGR5IklY4BR5IklY4BR5IklY4BR5IklY4BR5IklY5XUUlStT16XfX6Hj6xen1L7ZgzOJIkqXQMOJIkqXQMOJIkqXQMOJIkqXQ8yViSquyp5Wuq1vfg4VXrWmrXnMGRJEmlY8CRJEmlY8CRJEml4zk4KoVBK6ZUqedJVepXklRNzuBIkqTSMeBIkqTSMeBIkqTSMeBIkqTSMeBIkqTSMeBIkqTSMeBIkqTSMeBIkqTSqSjgRMTeETE9Il6IiCURMTgiPhERMyPiD8XPfVqqWEmSpMaodAbnx8B/ZuZngcOAJcAEYFZmHgzMKpYlSZJ2mmYHnIj4Z2AoMBUgM9/LzLXAaOC2YrPbgJMqK1GSJKlpKpnB6QGsBn4ZEc9GxC8iYg9gv8xcVWzzKrDftt4cEedGxLyImLd69eoKypAkSdpcJQGnA9Af+FlmHg68zRaHozIzgdzWmzNzSmYOyMwBXbt2raAMSZKkzVUScFYCKzNzTrE8nfrA89eI2B+g+PlaZSVKkiQ1TbMDTma+Cvw5InoVTUcDi4EZwJiibQzwQEUVSpIkNVGHCt9/EXBHRHwMWA6MpT403RMR44CXgVMr/AxJkqQmqSjgZOYCYMA2Vh1dSb+SJEmV8E7GkiSpdAw4kiSpdCo9B0dqlMkzX6xKv5ce27Mq/UqS2jdncCRJUukYcCRJUukYcCRJUukYcCRJUukYcCRJUukYcCRJUukYcCRJUukYcCRJUukYcCRJUukYcCRJUukYcCRJUukYcCRJUun4sE1Jau8eva56fQ+fWL2+pSpyBkeSJJWOAUeSJJWOAUeSJJWOAUeSJJWOAUeSJJWOAUeSJJWOAUeSJJWOAUeSJJWOAUeSJJWOdzLWTjFoxZQq9TypSv1KktozZ3AkSVLpGHAkSVLpGHAkSVLpVHwOTkTsDswDXsnMURHRA7gb6ALMB76ame9V+jmSpG17avmaqvU9eHjVupaqqiVmcMYDSxos3wBMzszPAH8HxrXAZ0iSJDVaRQEnIroBXwR+USwHMAKYXmxyG3BSJZ8hSZLUVJXO4PwI+DawsVjuAqzNzA3F8krggAo/Q5IkqUmaHXAiYhTwWmbOb+b7z42IeRExb/Xq1c0tQ5IkaSuVzOAMAU6MiD9Rf1LxCODHwN4R8eHJy92AV7b15syckpkDMnNA165dKyhDkiRpc80OOJk5MTO7ZWZ34HTgkcw8E3gUOKXYbAzwQMVVSpIkNUE17oNzOXBZRCyj/pycqVX4DEmSpO1qkWdRZeZjwGPF6+VAbUv0K0mS1BzeyViSJJWOAUeSJJWOAUeSJJWOAUeSJJWOAUeSJJWOAUeSJJWOAUeSJJWOAUeSJJWOAUeSJJWOAUeSJJVOizyqQZJUXpNnvli1vi89tmfV+tauzRkcSZJUOs7gSJI+0qAVU6rY+6Qq9q1dmTM4kiSpdAw4kiSpdAw4kiSpdAw4kiSpdAw4kiSpdAw4kiSpdAw4kiSpdLwPjuDR66rX9/CJ1etbkqTtcAZHkiSVjgFHkiSVjgFHkiSVjgFHkiSVjgFHkiSVjgFHkiSVjpeJS5Ja1eSZL1at70uP7Vm1vtW2OYMjSZJKx4AjSZJKp9kBJyIOjIhHI2JxRDwfEeOL9k9ExMyI+EPxc5+WK1eSJGnHKjkHZwPwzcx8JiL2BOZHxEzgbGBWZl4fEROACcDllZeqanlq+Zqq9T14eNW6liRpu5o9g5OZqzLzmeL1m8AS4ABgNHBbsdltwEkV1ihJktQkLXIOTkR0Bw4H5gD7ZeaqYtWrwH7bec+5ETEvIuatXr26JcqQJEkCWiDgRMQ/AfcCl2TmGw3XZWYCua33ZeaUzByQmQO6du1aaRmSJEmbVBRwIqIj9eHmjsy8r2j+a0TsX6zfH3itshIlSZKappKrqAKYCizJzBsbrJoBjClejwEeaH55kiRJTVfJVVRDgK8Cz0XEgqLtCuB64J6IGAe8DJxaUYWSJElN1OyAk5lPALGd1Uc3t19JkqRK+SwqSVKrGrRiShV7n1TFvtWW+agGSZJUOgYcSZJUOgYcSZJUOp6D0x48el31+h4+sXp9S5LUSpzBkSRJpWPAkSRJpWPAkSRJpWPAkSRJpWPAkSRJpeNVVO3AU8vXVK3vwcOr1rUkSa3GGRxJklQ6BhxJklQ6BhxJklQ6BhxJklQ6nmQsSSq1p6b+76r1PXjcpKr1rco4gyNJkkrHgCNJkkrHgCNJkkrHc3BawqPXVa/v4ROr17ckSSXlDI4kSSodZ3AkSarQ5JkvVqXfS4/tWZV+dwXO4EiSpNJxBqcF+DBMSZLaFmdwJElS6TiDI0lShQatmFKlnr1TcnM5gyNJkkpn15jB8T41kiTtUpzBkSRJpbNLzOB4lZMkqT3ziehNV7UZnIg4PiKWRsSyiJhQrc+RJEnaUlVmcCJid+AnwLHASuDpiJiRmYur8XmSJKn5yjhDVK0ZnFpgWWYuz8z3gLuB0VX6LEmSpM1EZrZ8pxGnAMdn5teK5a8Cn8vMbzTY5lzg3GKxF7C0xQvZ3L7Af1f5M8rGMWs6x6zpHLOmc8yax3FruvYwZp/KzK5bNrbaScaZOQWo1p2RthIR8zJzwM76vDJwzJrOMWs6x6zpHLPmcdyarj2PWbUOUb0CHNhguVvRJkmSVHXVCjhPAwdHRI+I+BhwOjCjSp8lSZK0maocosrMDRHxDeC/gN2BaZn5fDU+qwl22uGwEnHMms4xazrHrOkcs+Zx3Jqu3Y5ZVU4yliRJak0+qkGSJJWOAUeSJJVO6QNORFwUES9ExPMR8cMG7ROLx0gsjYjjWrPGtioivhkRGRH7FssRETcV47YwIvq3do1tRUT8R7GfLYyI+yNi7wbr3Ne2w0e67FhEHBgRj0bE4uL32Pii/RMRMTMi/lD83Ke1a21rImL3iHg2Ih4slntExJxif6srLoJRISL2jojpxe+yJRExuD3vZ6UOOBExnPo7KB+WmX2ASUX7IdRf2dUHOB74afF4CRUi4kBgJLCiQfMXgIOLf+cCP2uF0tqqmcChmdkXeBGYCO5rH6XBI12+ABwCnFGMlza3AfhmZh4CDAIuLMZpAjArMw8GZhXL2tx4YEmD5RuAyZn5GeDvwLhWqart+jHwn5n5WeAw6seu3e5npQ44wAXA9Zn5LkBmvla0jwbuzsx3M/MlYBn1j5fQP0wGvg00PAt9NHB71psN7B0R+7dKdW1MZj6UmRuKxdnU3/sJ3Nc+io90aYTMXJWZzxSv36T+fzoHUD9WtxWb3Qac1CoFtlER0Q34IvCLYjmAEcD0YhPHrIGI+GdgKDAVIDPfy8y1tOP9rOwBpyfw+WJK8v9FxMCi/QDgzw22W1m0CYiI0cArmfn7LVY5bo1zDvB/i9eO2fY5Nk0UEd2Bw4E5wH6ZuapY9SqwX2vV1Ub9iPo/0jYWy12AtQ3+EHF/21wPYDXwy+Kw3i8iYg/a8X7Wao9qaCkR8TDwP7ax6jvUf79PUD+tOxC4JyI+vRPLa7N2MG5XUH94Sg181Jhl5gPFNt+h/pDCHTuzNpVfRPwTcC9wSWa+UT8hUS8zMyK850chIkYBr2Xm/IgY1srltBcdgP7ARZk5JyJ+zBaHo9rbftbuA05mHrO9dRFxAXBf1t/sZ25EbKT+wWG7/KMktjduEfE/qU/yvy9+gXYDnomIWnbxcfuofQ0gIs4GRgFH5z9uMLVLj9kOODaNFBEdqQ83d2TmfUXzXyNi/8xcVRwqfm37PexyhgAnRsQJQA2wF/Xnl+wdER2KWRz3t82tBFZm5pxieTr1Aafd7mdlP0T1f4DhABHRE/gY9U9FnQGcHhEfj4ge1J80O7e1imxLMvO5zPxkZnbPzO7U7/T9M/NV6sft34qrqQYBrzeYutylRcTx1E+Hn5iZ7zRY5b62fT7SpRGKc0emAksy88YGq2YAY4rXY4AHdnZtbVVmTszMbsXvsNOBRzLzTOBR4JRiM8esgeJ3/J8jolfRdDSwmHa8n7X7GZwdmAZMi4hFwHvAmOIv6+cj4h7q/+NtAC7MzA9asc724rfACdSfKPsOMLZ1y2lTbgE+DswsZr5mZ+b5mem+th1t9JEubdEQ4KvAcxGxoGi7Arie+sPu44CXgVNbp7x25XLg7oi4FniW4oRabXIRcEfxB8dy6n/H70Y73c98VIMkSSqdsh+ikiRJuyADjiRJKh0DjiRJKh0DjiRJKh0DjiRJKh0DjiRJKh0DjiRJKp3/DwNHe7uU/iemAAAAAElFTkSuQmCC
"
>
</div>

</div>

<div class="jp-OutputArea-child">

    
    <div class="jp-OutputPrompt jp-OutputArea-prompt"></div>


<div class="jp-RenderedText jp-OutputArea-output" data-mime-type="text/plain">
<pre>Little Brewster
Optimization terminated successfully.
         Current function value: 1.999561
         Iterations: 40
         Function evaluations: 77
Pearson residual: -0.0028
Chi-square goodness-of-fit test result - Reject H0: True (0.0)
</pre>
</div>
</div>

<div class="jp-OutputArea-child">

    
    <div class="jp-OutputPrompt jp-OutputArea-prompt"></div>




<div class="jp-RenderedImage jp-OutputArea-output ">
<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAjgAAAEYCAYAAABRMYxdAAAAOXRFWHRTb2Z0d2FyZQBNYXRwbG90bGliIHZlcnNpb24zLjMuNCwgaHR0cHM6Ly9tYXRwbG90bGliLm9yZy8QVMy6AAAACXBIWXMAAAsTAAALEwEAmpwYAAAZ1UlEQVR4nO3df7BXdb3v8edboTaQpil5vaJBkxLoJcTNDkQJ8GfmAW1MNO0Q0vgjNfXWpFjaL8+oHUZK7YdMUDqlwkVNxnvOPSLKGI6goIgIYaRJGCaHAhUhRd73j/0Vt4C59/7uL5v94fmYYfZan7XW5/v+smYPLz7rs9aKzESSJKkku7V3AZIkSW3NgCNJkopjwJEkScUx4EiSpOIYcCRJUnE6tXcBAPvuu2/27NmzvcuQJEkdzIIFC/47M7tv3b5TBJyePXsyf/789i5DkiR1MBHxwvbavUQlSZKKY8CRJEnFMeBIkqTi7BRzcCRJKtWbb77JypUr2bhxY3uX0qHV1dXRo0cPOnfu3Kz9DTiSJNXQypUr2WOPPejZsycR0d7ldEiZyZo1a1i5ciW9evVq1jFeopIkqYY2btzIPvvsY7ipQkSwzz77tGgUzIAjSVKNGW6q19K/QwOOJEkqjnNwJEnagSbOfLZN+7vsuENaddyf/vQnTj75ZBYvXtym9VRr2LBhTJgwgfr6+qr6cQRHkiS1iU2bNrV3CVs4giPtCh66tnZ9Dx9fu74ltZkbbriBKVOmAPCVr3yFU045hU2bNnHWWWfxxBNPcOihh3LbbbfRtWtXrrjiCmbMmEGnTp04/vjjmTBhAqtXr+b8889nxYoVAPzoRz9iyJAhfPe73+WPf/wjzz33HAcddBDPP/88kydP5tBDDwXeGZHp06cPF198MYsXL+bNN9/ku9/9LqNGjWLDhg2MHTuWp556ik9+8pNs2LChTb6vAUeSpMItWLCAX/7yl8ybN4/M5NOf/jSf+cxnWLZsGZMnT2bIkCGcc845/PSnP2Xs2LHcc889/P73vyciWLt2LQCXXHIJl112GUcddRQrVqzghBNOYOnSpQAsWbKEOXPm0KVLFyZOnMi0adP43ve+x6pVq1i1ahX19fVceeWVjBgxgilTprB27VoaGho49thjueWWW+jatStLly5l0aJFDBgwoE2+s5eoJEkq3Jw5czj11FPp1q0bH/rQh/j85z/P7373Ow488ECGDBkCwNlnn82cOXP48Ic/TF1dHePGjePuu++ma9euADzwwANcdNFF9O/fn5EjR/LKK6/w2muvATBy5Ei6dOkCwOmnn8706dMBmDZtGqeddhoA999/P9dddx39+/dn2LBhbNy4kRUrVvDwww9z9tlnA9CvXz/69evXJt/ZERxJknZRW996HRF06tSJxx57jFmzZjF9+nRuvvlmHnzwQTZv3szcuXOpq6vbpp9u3bptWT7ggAPYZ599WLRoEVOnTuXnP/850PiwvrvuuovevXvX9ktVOIIjSVLhjj76aH7729/y+uuvs379eu655x6OPvpoVqxYwaOPPgrA7bffzlFHHcVrr73GunXrOOmkk5g4cSJPPfUUAMcffzw33XTTlj4XLlz4np83evRofvjDH7Ju3botIzInnHACN910E5kJwJNPPgnA0KFDuf322wFYvHgxixYtapPv/L4jOBExBTgZeDkzD6u0/TvwL8AbwB+BsZm5trJtPDAOeAv4Wmb+V5tUKklSAVp7W3c1BgwYwJe//GUaGhqAxknGe++9N7179+YnP/kJ55xzDn379uWCCy5g3bp1jBo1io0bN5KZ3HDDDQDceOONXHjhhfTr149NmzYxdOjQLaMzWzvttNO45JJLuOqqq7a0XXXVVVx66aX069ePzZs306tXL+677z4uuOACxo4dS58+fejTpw9HHHFEm3zneDtJvecOEUOB14DbmgSc44EHM3NTRFwPkJmXR0Rf4A6gAfifwAPAIZn51j/7jPr6+pw/f37VX0bS9j06+Rs163vwuAk161sqwdKlS+nTp097l1GE7f1dRsSCzNzmoTnve4kqMx8G/rZV2/2Z+fbN7nOBHpXlUcCdmfmPzHweWE5j2JEkSdph2mIOzjnAf1aWDwD+3GTbykrbNiLi3IiYHxHzV69e3QZlSJIkNaoq4ETEt4BNwG9aemxmTsrM+sys7969ezVlSJIkvUurbxOPiC/TOPn4mHxnIs+LwIFNdutRaZP0z/ikYUlqU60awYmIE4FvAiMz8/Umm2YAZ0TEByOiF3Aw8Fj1ZUqSJDVfc24TvwMYBuwbESuB7wDjgQ8CMysPCZqbmedn5jMRMQ1YQuOlqwvf7w4qSZKktva+ASczz9xO8+R/sv+/Af9WTVGSJBWrrS9J76SXoRcuXMhf/vIXTjrppBYd9/bLOevrt7nzu0V8VYPUDBNnPluzvtvjoV9tzjlEkraycOFC5s+f3+KA01Z8VYMkSbuAX//61zQ0NNC/f3/OO+885s2bR79+/di4cSPr16/n0EMPZfHixcyePZuhQ4fyuc99jt69e3P++eezefNmoPGFmYMHD2bAgAF84Qtf2PKyzccff5wjjzyST33qUzQ0NLBu3Tquvvpqpk6dSv/+/Zk6dSrr16/nnHPOoaGhgcMPP5x7770XgA0bNnDGGWfQp08fTj31VDZs2NAm39cRHEmSCrd06VKmTp3KI488QufOnfnqV7/KsmXLGDlyJN/+9rfZsGEDZ599NocddhizZ8/mscceY8mSJXzsYx/jxBNP5O6772bYsGFcc801PPDAA3Tr1o3rr7+eG264gSuuuILRo0czdepUBg4cyCuvvELXrl35/ve/z/z587n55psBuPLKKxkxYgRTpkxh7dq1NDQ0cOyxx3LLLbfQtWtXli5dyqJFixgwYECbfGcDjiRJhZs1axYLFixg4MCBQOOoyUc/+lGuvvpqBg4cSF1dHTfeeOOW/RsaGvj4xz8OwJlnnsmcOXOoq6tjyZIlDBkyBIA33niDwYMHs2zZMvbff/8tfe+5557breH+++9nxowZTJjQ+HqXjRs3smLFCh5++GG+9rWvAdCvX78tL+eslgFHkqTCZSZjxozh2mvfPV9u1apVvPbaa7z55pts3LiRbt26AVC5Q3qLiCAzOe6447jjjjvete3pp59udg133XUXvXv3ruKbNJ9zcCRJKtwxxxzD9OnTefnllwH429/+xgsvvMB5553HD37wA8466ywuv/zyLfs/9thjPP/882zevJmpU6dy1FFHMWjQIB555BGWL18OwPr163n22Wfp3bs3q1at4vHHHwfg1VdfZdOmTeyxxx68+uqrW/o84YQTuOmmm3j72cBPPvkkAEOHDuX2228HYPHixSxatKhNvrMjOJIk7UjtcGdg3759ueaaazj++OPZvHkznTt3ZtSoUXTu3JkvfvGLvPXWWxx55JE8+OCD7LbbbgwcOJCLLrqI5cuXM3z4cE499VR22203fvWrX3HmmWfyj3/8A4BrrrmGQw45hKlTp3LxxRezYcMGunTpwgMPPMDw4cO57rrr6N+/P+PHj+eqq67i0ksvpV+/fmzevJlevXpx3333ccEFFzB27Fj69OlDnz59OOKII9rkOxtwJEnaBYwePZrRo0dvd9vuu+/OvHnzAJg9ezZ77rkn99133zb7jRgxYstITVMDBw5k7ty527Rvve8tt9yyzT5dunThzjvvbNZ3aAkvUUmSpOI4giNJkrYYNmwYw4YNa+8yquYIjiRJNfb2xFq1Xkv/Dg04kiTVUF1dHWvWrDHkVCEzWbNmDXV1dc0+xktUkiTVUI8ePVi5ciWrV69u71I6tLq6Onr06NHs/Q04kqr26HNratb34OE161raITp37kyvXr3au4xdjpeoJElScQw4kiSpOAYcSZJUHAOOJEkqjgFHkiQVx4AjSZKKY8CRJEnFMeBIkqTiGHAkSVJxDDiSJKk4BhxJklQc30UlNcOgFZNq2PuEGvYtSbsmR3AkSVJxDDiSJKk4BhxJklSc9w04ETElIl6OiMVN2j4SETMj4g+Vn3tX2iMiboyI5RGxKCIG1LJ4SZKk7WnOCM6vgBO3arsCmJWZBwOzKusAnwUOrvw5F/hZ25QpSZLUfO8bcDLzYeBvWzWPAm6tLN8KnNKk/bZsNBfYKyL2b6NaJUmSmqW1t4nvl5mrKssvAftVlg8A/txkv5WVtlVsJSLOpXGUh4MOOqiVZUjaJTx0be36Hj6+dn1LajdVTzLOzASyFcdNysz6zKzv3r17tWVIkiRt0dqA89e3Lz1Vfr5caX8ROLDJfj0qbZIkSTtMawPODGBMZXkMcG+T9n+t3E01CFjX5FKWJEnSDvG+c3Ai4g5gGLBvRKwEvgNcB0yLiHHAC8Dpld3/AzgJWA68DoytQc2SJEn/1PsGnMw88z02HbOdfRO4sNqiJEmSquGTjCVJUnEMOJIkqTgGHEmSVBwDjiRJKk5rn2QsqQ09+tyamvU9eHjNupaknZYjOJIkqTgGHEmSVBwDjiRJKo5zcCTt9JyjJKmlHMGRJEnFMeBIkqTiGHAkSVJxDDiSJKk4BhxJklQcA44kSSqOAUeSJBXHgCNJkorjg/4k7fImzny2Zn1fdtwhNetb0ntzBEeSJBXHgCNJkopjwJEkScVxDo6KUKs5FM6fkKSOyREcSZJUHAOOJEkqjgFHkiQVx4AjSZKKY8CRJEnF8S4qFWHQikk16nlCjfqVJNWSIziSJKk4VQWciLgsIp6JiMURcUdE1EVEr4iYFxHLI2JqRHygrYqVJElqjlYHnIg4APgaUJ+ZhwG7A2cA1wMTM/MTwN+BcW1RqCRJUnNVe4mqE9AlIjoBXYFVwAhgemX7rcApVX6GJElSi7Q64GTmizTOwFxBY7BZBywA1mbmpspuK4EDqi1SkiSpJVp9F1VE7A2MAnoBa4H/A5zYguPPBc4FOOigg1pbhjoI3xUlSdqRqrlEdSzwfGauzsw3gbuBIcBelUtWAD2AF7d3cGZOysz6zKzv3r17FWVIkiS9WzUBZwUwKCK6RkQAxwBLgIeA0yr7jAHura5ESZKklmn1JarMnBcR04EngE3Ak8Ak4P8Cd0bENZW2yW1RqCTVSu0eFAk+LFJqH1U9yTgzvwN8Z6vm54CGavqVJEmqhk8yliRJxTHgSJKk4hhwJElScQw4kiSpOAYcSZJUHAOOJEkqjgFHkiQVx4AjSZKKY8CRJEnFMeBIkqTiGHAkSVJxDDiSJKk4BhxJklQcA44kSSqOAUeSJBXHgCNJkopjwJEkScUx4EiSpOIYcCRJUnEMOJIkqTgGHEmSVBwDjiRJKo4BR5IkFceAI0mSimPAkSRJxTHgSJKk4hhwJElScQw4kiSpOAYcSZJUnE7tXYAklW7izGdr1vdlxx1Ss76ljqyqEZyI2CsipkfE7yNiaUQMjoiPRMTMiPhD5efebVWsJElSc1R7ierHwP/LzE8CnwKWAlcAszLzYGBWZV2SJGmHaXXAiYgPA0OByQCZ+UZmrgVGAbdWdrsVOKW6EiVJklqmmhGcXsBq4JcR8WRE/CIiugH7Zeaqyj4vAftt7+CIODci5kfE/NWrV1dRhiRJ0rtVE3A6AQOAn2Xm4cB6troclZkJ5PYOzsxJmVmfmfXdu3evogxJkqR3q+YuqpXAysycV1mfTmPA+WtE7J+ZqyJif+DlaotUxzdoxaQa9TyhRv1KkjqyVo/gZOZLwJ8jonel6RhgCTADGFNpGwPcW1WFkiRJLVTtc3AuBn4TER8AngPG0hiapkXEOOAF4PQqP0OSJKlFqgo4mbkQqN/OpmOq6VeSJKkavqpBkiQVx4AjSZKKY8CRJEnF8WWbklRjtXtMAvioBGn7HMGRJEnFMeBIkqTiGHAkSVJxDDiSJKk4BhxJklQcA44kSSqOAUeSJBXHgCNJkopjwJEkScUx4EiSpOIYcCRJUnEMOJIkqTgGHEmSVBwDjiRJKo4BR5IkFceAI0mSimPAkSRJxTHgSJKk4hhwJElScQw4kiSpOAYcSZJUHAOOJEkqjgFHkiQVx4AjSZKKY8CRJEnFqTrgRMTuEfFkRNxXWe8VEfMiYnlETI2ID1RfpiRJUvO1xQjOJcDSJuvXAxMz8xPA34FxbfAZkiRJzVZVwImIHsDngF9U1gMYAUyv7HIrcEo1nyFJktRS1Y7g/Aj4JrC5sr4PsDYzN1XWVwIHbO/AiDg3IuZHxPzVq1dXWYYkSdI7Wh1wIuJk4OXMXNCa4zNzUmbWZ2Z99+7dW1uGJEnSNjpVcewQYGREnATUAXsCPwb2iohOlVGcHsCL1Zepmnro2tr1PXx87fqWJOk9tHoEJzPHZ2aPzOwJnAE8mJlnAQ8Bp1V2GwPcW3WVkiRJLVCL5+BcDvzviFhO45ycyTX4DEmSpPdUzSWqLTJzNjC7svwc0NAW/UqSJLWGTzKWJEnFMeBIkqTitMklKnVsjz63pmZ9Dx5es64lSXpPjuBIkqTiOIIjSR2dz7KStuEIjiRJKo4BR5IkFceAI0mSimPAkSRJxTHgSJKk4ngXlSR1cD7LStqWIziSJKk4BhxJklQcA44kSSqOAUeSJBXHgCNJkopjwJEkScUx4EiSpOIYcCRJUnEMOJIkqTgGHEmSVBwDjiRJKo4BR5IkFceAI0mSimPAkSRJxTHgSJKk4hhwJElScTq1dwFqhoeurV3fw8fXrm9JktqJIziSJKk4rQ44EXFgRDwUEUsi4pmIuKTS/pGImBkRf6j83LvtypUkSXp/1YzgbAK+npl9gUHAhRHRF7gCmJWZBwOzKuuSJEk7TKvn4GTmKmBVZfnViFgKHACMAoZVdrsVmA1cXlWVkqR28+jkb9Ss78HjJtSsb+3a2mQOTkT0BA4H5gH7VcIPwEvAfu9xzLkRMT8i5q9evbotypAkSQLaIOBExIeAu4BLM/OVptsyM4Hc3nGZOSkz6zOzvnv37tWWIUmStEVVt4lHRGcaw81vMvPuSvNfI2L/zFwVEfsDL1db5K7u0efW1KzvwcNr1rUkSe2mmruoApgMLM3MG5psmgGMqSyPAe5tfXmSJEktV80IzhDgS8DTEbGw0nYlcB0wLSLGAS8Ap1dVoSRJUgtVcxfVHCDeY/Mxre1XkiSpWj7JWJIkFceAI0mSimPAkSRJxTHgSJKk4hhwJElScQw4kiSpOAYcSZJUHAOOJEkqjgFHkiQVx4AjSZKKU9XbxNXo0cnfqFnfg8dNqFnfkiSVyhEcSZJUHEdwJEntylFw1YIjOJIkqTgGHEmSVBwDjiRJKo4BR5IkFWeXmGQ8ceazNev7suMOqVnfkiSpdRzBkSRJxTHgSJKk4hhwJElScXaJOTiDVkyqYe8+REqSpJ2NIziSJKk4u8QIjiRp1+WrIHZNjuBIkqTiGHAkSVJxDDiSJKk4zsGRJKlKtXpivk/Lbz1HcCRJUnEcwZEkqUq1e96ad2m1Vs1GcCLixIhYFhHLI+KKWn2OJEnS1moyghMRuwM/AY4DVgKPR8SMzFxSi8+TJKloD11bu76Hj6/ZHCJov3lEtRrBaQCWZ+ZzmfkGcCcwqkafJUmS9C6RmW3facRpwImZ+ZXK+peAT2fmRU32ORc4t7LaG1jW5oW8Y1/gv2vYv9qW56tj8Xx1LJ6vjsNz1Twfy8zuWze22yTjzJwE1PItmFtExPzMrN8Rn6Xqeb46Fs9Xx+L56jg8V9Wp1SWqF4EDm6z3qLRJkiTVXK0CzuPAwRHRKyI+AJwBzKjRZ0mSJL1LTS5RZeamiLgI+C9gd2BKZj5Ti89qph1yKUxtxvPVsXi+OhbPV8fhuapCTSYZS5IktSdf1SBJkopjwJEkScXZJQJORHw9IjIi9q2sR0TcWHmNxKKIGNDeNQoi4t8j4veVc3JPROzVZNv4yvlaFhEntGOZqvB1LDu3iDgwIh6KiCUR8UxEXFJp/0hEzIyIP1R+7t3eteodEbF7RDwZEfdV1ntFxLzK79nUyo07aobiA05EHAgcD6xo0vxZ4ODKn3OBn7VDadrWTOCwzOwHPAuMB4iIvjTeiXcocCLw08rrQNROmryO5bNAX+DMynnSzmMT8PXM7AsMAi6snKMrgFmZeTAwq7KuncclwNIm69cDEzPzE8DfgXHtUlUHVHzAASYC3wSazqYeBdyWjeYCe0XE/u1SnbbIzPszc1NldS6Nz0+CxvN1Z2b+IzOfB5bT+DoQtR9fx7KTy8xVmflEZflVGv/RPIDG83RrZbdbgVPapUBtIyJ6AJ8DflFZD2AEML2yi+erBYoOOBExCngxM5/aatMBwJ+brK+stGnncQ7wn5Vlz9fOx3PSgURET+BwYB6wX2auqmx6CdivverSNn5E43/IN1fW9wHWNvmPn79nLdBur2poKxHxAPA/trPpW8CVNF6e0k7in52vzLy3ss+3aBxe/82OrE0qUUR8CLgLuDQzX2kcFGiUmRkRPitkJxARJwMvZ+aCiBjWzuUUocMHnMw8dnvtEfG/gF7AU5Vf6B7AExHRgK+SaDfvdb7eFhFfBk4Gjsl3HtLk+dr5eE46gIjoTGO4+U1m3l1p/mtE7J+ZqyqX5l9uvwrVxBBgZEScBNQBewI/pnEKRafKKI6/Zy1Q7CWqzHw6Mz+amT0zsyeNQ3sDMvMlGl8b8a+Vu6kGAeuaDNmqnUTEiTQOz47MzNebbJoBnBERH4yIXjRODn+sPWrUFr6OZSdXmb8xGViamTc02TQDGFNZHgPcu6Nr07Yyc3xm9qj8e3UG8GBmngU8BJxW2c3z1QIdfgSnlf4DOInGyaqvA2PbtxxV3Ax8EJhZGXWbm5nnZ+YzETENWELjpasLM/Otdqxzl7cTvo5F2xoCfAl4OiIWVtquBK4DpkXEOOAF4PT2KU/NdDlwZ0RcAzxJY2hVM/iqBkmSVJxiL1FJkqRdlwFHkiQVx4AjSZKKY8CRJEnFMeBIkqTiGHAkSVJxDDiSJKk4/x+WCO9FPEED2wAAAABJRU5ErkJggg==
"
>
</div>

</div>

<div class="jp-OutputArea-child">

    
    <div class="jp-OutputPrompt jp-OutputArea-prompt"></div>


<div class="jp-RenderedText jp-OutputArea-output" data-mime-type="text/plain">
<pre>NE Appledore
Optimization terminated successfully.
         Current function value: 3.686326
         Iterations: 37
         Function evaluations: 72
Pearson residual: -0.0051
Chi-square goodness-of-fit test result - Reject H0: True (0.0)
</pre>
</div>
</div>

<div class="jp-OutputArea-child">

    
    <div class="jp-OutputPrompt jp-OutputArea-prompt"></div>




<div class="jp-RenderedImage jp-OutputArea-output ">
<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAjgAAAEYCAYAAABRMYxdAAAAOXRFWHRTb2Z0d2FyZQBNYXRwbG90bGliIHZlcnNpb24zLjMuNCwgaHR0cHM6Ly9tYXRwbG90bGliLm9yZy8QVMy6AAAACXBIWXMAAAsTAAALEwEAmpwYAAAca0lEQVR4nO3dfbRVdb3v8fdXobagpSl5PaBBpYh6yWiDGGrgc+YQazhM0w6hZZkSehojxfKhjmdoHYaUmhU3MB2p4UVNhrdzroh6jYaKGx+Q2GGEud2GsaPwcaMg3/vHmtAWUDZ77cWCud+vMRys+Ztz/dZ3TSebz/795kNkJpIkSWWyQ70LkCRJ6m4GHEmSVDoGHEmSVDoGHEmSVDoGHEmSVDq96l0AwB577JEDBw6sdxmSJGk7M3/+/L9lZr8N27eJgDNw4ECamprqXYYkSdrORMRzm2p3ikqSJJWOAUeSJJWOAUeSJJXONnEOjiRJZbV69WpaW1tZtWpVvUvZrjU0NDBgwAB69+7dqe0NOJIk1VBrayu77LILAwcOJCLqXc52KTNZsWIFra2tDBo0qFPvcYpKkqQaWrVqFbvvvrvhpgoRwe67775Fo2AGHEmSasxwU70t3YcGHEmSVDqegyNJ0lY0ZfYz3drfhcfs16X3/fnPf+bEE09k4cKF3VpPtUaPHs3kyZNpbGysqh9HcCRJUrdYs2ZNvUtYb7MjOBExHTgRWJ6ZB22w7pvAZKBfZv4tKhNkPwJOAF4HvpSZj3d/2ZK2Jd39G2lHXf3tVNLbXXPNNUyfPh2AL3/5y5x88smsWbOGM844g8cff5wDDzyQm2++mT59+nDxxRcza9YsevXqxbHHHsvkyZNpa2vja1/7Gi0tLQD88Ic/ZNSoUVxxxRX86U9/YunSpeyzzz48++yzTJs2jQMPPBD454jMkCFDmDBhAgsXLmT16tVcccUVjB07lvb2dsaPH89TTz3F/vvvT3t7e7d8385MUf0CuB64uWNjROwNHAu0dGj+NLBv8d8hwE+KPyVJUp3Mnz+fG2+8kUcffZTM5JBDDuFTn/oUixcvZtq0aYwaNYqzzjqLG264gfHjx3PXXXfxhz/8gYhg5cqVAEycOJELL7yQww47jJaWFo477jiam5sBWLRoEXPnzmWnnXZiypQp3H777Xz3u99l2bJlLFu2jMbGRi655BKOPPJIpk+fzsqVKxkxYgRHH300P/vZz+jTpw/Nzc0sWLCAYcOGdct33uwUVWY+BPx9E6umAN8CskPbWODmrHgE2DUi9uqWSiVJUpfMnTuXz372s/Tt25edd96Zz33uc/z2t79l7733ZtSoUQCceeaZzJ07l/e///00NDRw9tlnc+edd9KnTx8A7rvvPs4//3wOPvhgTjrpJF5++WVeffVVAE466SR22mknAE499VRmzpwJwO23384pp5wCwL333svVV1/NwQcfzOjRo1m1ahUtLS089NBDnHnmmQAMHTqUoUOHdst37tJJxhExFnghM5/a4LKt/sDzHZZbi7ZlXa5QkiTVxIaXXkcEvXr1Yt68ecyZM4eZM2dy/fXXc//997N27VoeeeQRGhoaNuqnb9++61/379+f3XffnQULFjBjxgx++tOfApWb9d1xxx0MHjy4tl+qsMUnGUdEH+AS4LJqPjgizomIpohoamtrq6YrSZL0Lg4//HB+/etf8/rrr/Paa69x1113cfjhh9PS0sLDDz8MwK233sphhx3Gq6++yksvvcQJJ5zAlClTeOqppwA49thjue6669b3+eSTT77j533+85/nBz/4AS+99NL6EZnjjjuO6667jszKxM8TTzwBwBFHHMGtt94KwMKFC1mwYEG3fOeujOB8BBgErBu9GQA8HhEjgBeAvTtsO6Bo20hmTgWmAjQ2NuamtpEkqWzqceL8sGHD+NKXvsSIESOAyknGu+22G4MHD+bHP/4xZ511FgcccADnnnsuL730EmPHjmXVqlVkJtdccw0A1157Leeddx5Dhw5lzZo1HHHEEetHZzZ0yimnMHHiRC699NL1bZdeeikXXHABQ4cOZe3atQwaNIh77rmHc889l/HjxzNkyBCGDBnCJz7xiW75zrEuSb3rRhEDgXs2vIqqWPdnoLG4iuozwPlUrqI6BLg2M0dsrv/GxsZsamrawtIlbSu8ikp6Z83NzQwZMqTeZZTCpvZlRMzPzI1umrPZKaqIuA14GBgcEa0Rcfa7bP4bYCmwBPhfwNe3pHBJkqTusNkpqsw8fTPrB3Z4ncB51ZclSZLUdd7JWJIklY4BR5IklY4BR5IklY4BR5IklU6X7mQsSZK66IGrure/MZO6t79u8uSTT/KXv/yFE044YYvet+7hnI2NG135vUUcwZEkSd3uySef5De/+U3dPt8RHKkn6O7fGDvaRn97lPR2v/zlL7n22mt58803OeSQQzjrrLP4yle+wrx583jrrbcYMWIEM2bM4G9/+xuXXXYZu+yyC0uWLGHMmDHccMMN7LDDDtx7771cfvnlvPHGG3zkIx/hxhtvZOedd+axxx5j4sSJvPbaa7z3ve9l9uzZXHbZZbS3tzN37lwmTZrEiSeeyIQJE1i4cCGrV6/miiuuYOzYsbS3tzN+/Hieeuop9t9/f9rb27vl+xpwJEkquebmZmbMmMHvfvc7evfuzde//nUWL17MSSedxHe+8x3a29s588wzOeigg3jwwQeZN28eixYt4kMf+hDHH388d955J6NHj+bKK6/kvvvuo2/fvnz/+9/nmmuu4eKLL+bzn/88M2bMYPjw4bz88sv06dOH733vezQ1NXH99dcDcMkll3DkkUcyffp0Vq5cyYgRIzj66KP52c9+Rp8+fWhubmbBggUMGzasW76zAUeSpJKbM2cO8+fPZ/jw4QC0t7fzwQ9+kMsuu4zhw4fT0NDAtddeu377ESNG8OEPfxiA008/nblz59LQ0MCiRYsYNWoUAG+++SaHHnooixcvZq+99lrf9/ve975N1nDvvfcya9YsJk+eDMCqVatoaWnhoYce4hvf+AYAQ4cOXf9wzmoZcCRJKrnMZNy4cVx11dunq5ctW8arr77K6tWrWbVqFX379gWgeJj2ehFBZnLMMcdw2223vW3d008/3eka7rjjDgYPHlzFN+k8TzKWJKnkjjrqKGbOnMny5csB+Pvf/85zzz3HV7/6Vf793/+dM844g4suumj99vPmzePZZ59l7dq1zJgxg8MOO4yRI0fyu9/9jiVLlgDw2muv8cwzzzB48GCWLVvGY489BsArr7zCmjVr2GWXXXjllVfW93ncccdx3XXXse4h30888QQARxxxBLfeeisACxcuZMGCBd3ynR3BkSRpa6rDifkHHHAAV155Jcceeyxr166ld+/ejB07lt69e/OFL3yBt956i09+8pPcf//97LDDDgwfPpzzzz9//UnGn/3sZ9lhhx34xS9+wemnn84bb7wBwJVXXsl+++3HjBkzmDBhAu3t7ey0007cd999jBkzhquvvpqDDz6YSZMmcemll3LBBRcwdOhQ1q5dy6BBg7jnnns499xzGT9+PEOGDGHIkCF84hOf6JbvHOuS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
"
>
</div>

</div>

<div class="jp-OutputArea-child">

    
    <div class="jp-OutputPrompt jp-OutputArea-prompt"></div>


<div class="jp-RenderedText jp-OutputArea-output" data-mime-type="text/plain">
<pre>NW Appledore
Optimization terminated successfully.
         Current function value: 1.966661
         Iterations: 37
         Function evaluations: 72
Pearson residual: 0.0062
Chi-square goodness-of-fit test result - Reject H0: False (0.0846)
</pre>
</div>
</div>

<div class="jp-OutputArea-child">

    
    <div class="jp-OutputPrompt jp-OutputArea-prompt"></div>




<div class="jp-RenderedImage jp-OutputArea-output ">
<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAjgAAAEYCAYAAABRMYxdAAAAOXRFWHRTb2Z0d2FyZQBNYXRwbG90bGliIHZlcnNpb24zLjMuNCwgaHR0cHM6Ly9tYXRwbG90bGliLm9yZy8QVMy6AAAACXBIWXMAAAsTAAALEwEAmpwYAAAa40lEQVR4nO3dfZRWdd3v8fdXoUbI0pA8HtGgkxLqIcRxAlECnzMPaMt8SLsJbfmQmnpaq8TSrLyX2s2SUnuQk6SuUnGhJsvjfW4RdRkuRQdFRCaMMKcxTKJARUiR7/ljtjgCysxcc3HNbN6vtWbNtX9779/1vWavgc/8fvshMhNJkqQy2a7WBUiSJHU1A44kSSodA44kSSodA44kSSodA44kSSqdXrUuAGCXXXbJgQMH1roMSZLUw8ybN+/vmdl/4/ZuEXAGDhxIY2NjrcuQJEk9TES8uLl2p6gkSVLpGHAkSVLpbDHgRMS0iHglIhZuZt23IiIjYpdiOSLi2ohYEhELImJ4NYqWJEn6IO05B+cm4HrglraNEbEHcCTQ3Kb5C8BexdfngF8U3yVJ2ia99dZbtLS0sHbt2lqX0qPV1dUxYMAAevfu3a7ttxhwMvORiBi4mVVTgG8D97RpGw/ckq0PuHo8InaKiN0yc1m7qpEkqWRaWlrYcccdGThwIBFR63J6pMxkxYoVtLS0MGjQoHbt06lzcCJiPPBSZj6z0ardgb+0WW4p2jbXx5kR0RgRjcuXL+9MGZIkdXtr166lX79+hpsKRAT9+vXr0ChYhwNORPQBLgEu6+i+bWXm1Mysz8z6/v03uXxdkqTSMNxUrqM/w87cB+d/AIOAZ4o3GwA8FRENwEvAHm22HVC0SZIkbTUdDjiZ+SzwiXeWI+LPQH1m/j0iZgLnRcTttJ5cvMrzbyRJeteUWc93aX8XHbF3p/b785//zLHHHsvChZtcJF1TY8aMYfLkydTX11fUT3suE78NeAwYHBEtEXHGB2x+H7AUWAL8H+AbFVUnSZJ6jHXr1tW6hA3acxXVKVtYP7DN6wTOrbwsSXpXV//F21Zn//qVepprrrmGadOmAfD1r3+d4447jnXr1nHqqafy1FNPse+++3LLLbfQp08fLr74YmbOnEmvXr048sgjmTx5MsuXL+fss8+mubn17jA/+clPGDVqFJdffjl/+tOfWLp0KXvuuScvvPACN954I/vuuy/w7ojMkCFDOP/881m4cCFvvfUWl19+OePHj2fNmjVMnDiRZ555hs985jOsWbOmSz5vt3gWlSRJqp558+bx61//mrlz55KZfO5zn+Pzn/88ixcv5sYbb2TUqFGcfvrp/PznP2fixIncfffd/OEPfyAiWLlyJQAXXHABF110EQcffDDNzc0cddRRNDU1AbBo0SLmzJnDDjvswJQpU7jjjjv4wQ9+wLJly1i2bBn19fVccsklHHrooUybNo2VK1fS0NDA4Ycfzg033ECfPn1oampiwYIFDB/eNfcI9lENkiSV3Jw5czj++OPp27cvH/nIR/jSl77E73//e/bYYw9GjRoFwGmnncacOXP42Mc+Rl1dHWeccQZ33XUXffr0AeCBBx7gvPPOY9iwYYwbN45XX32V119/HYBx48axww47AHDiiScyY8YMAO644w5OOOEEAO6//36uuuoqhg0bxpgxY1i7di3Nzc088sgjnHbaaQAMHTqUoUOHdslndgRHkqRt1MaXXkcEvXr14oknnmD27NnMmDGD66+/ngcffJD169fz+OOPU1dXt0k/ffv23fB69913p1+/fixYsIDp06fzy1/+Emi9Wd+dd97J4MGDq/uhCo7gSJJUcocccgi/+93veOONN1i9ejV33303hxxyCM3NzTz22GMA3HrrrRx88MG8/vrrrFq1imOOOYYpU6bwzDOt9/Q98sgjue666zb0OX/+/Pd9v5NOOokf//jHrFq1asOIzFFHHcV1111H6+m68PTTTwMwevRobr31VgAWLlzIggULuuQzO4IjSdJWVIsT24cPH87XvvY1GhoagNaTjHfeeWcGDx7Mz372M04//XT22WcfzjnnHFatWsX48eNZu3Ytmck111wDwLXXXsu5557L0KFDWbduHaNHj94wOrOxE044gQsuuIBLL710Q9ull17KhRdeyNChQ1m/fj2DBg3i3nvv5ZxzzmHixIkMGTKEIUOGcMABB3TJZ453klQt1dfXZ2NjY63LkNRNeRWVerKmpiaGDBlS6zJKYXM/y4iYl5mb3DTHKSpJklQ6BhxJklQ6BhxJklQ6BhxJklQ6BhxJklQ6BhxJklQ63gdHkqSt6aEru7a/sZO6tr8uMn/+fP76179yzDHHdGi/dx7OWV+/yZXfHeIIjiRJ6nLz58/nvvvuq9n7G3AkSdoG/OY3v6GhoYFhw4Zx1llnMXfuXIYOHcratWtZvXo1++67LwsXLuThhx9m9OjRfPGLX2Tw4MGcffbZrF+/Hmh9YObIkSMZPnw4X/7ylzc8bPPJJ5/koIMO4rOf/SwNDQ2sWrWKyy67jOnTpzNs2DCmT5/O6tWrOf3002loaGD//ffnnnvuAWDNmjWcfPLJDBkyhOOPP541a9Z0yed1ikpSxbzTsNS9NTU1MX36dB599FF69+7NN77xDRYvXsy4ceP43ve+x5o1azjttNPYb7/9ePjhh3niiSdYtGgRn/zkJzn66KO56667GDNmDFdccQUPPPAAffv25eqrr+aaa67h4osv5qSTTmL69OkceOCBvPrqq/Tp04cf/vCHNDY2cv311wNwySWXcOihhzJt2jRWrlxJQ0MDhx9+ODfccAN9+vShqamJBQsWMHz48C75zAYcSZJKbvbs2cybN48DDzwQaB01+cQnPsFll13GgQceSF1dHddee+2G7RsaGvjUpz4FwCmnnMKcOXOoq6tj0aJFjBo1CoA333yTkSNHsnjxYnbbbbcNfX/0ox/dbA33338/M2fOZPLkyQCsXbuW5uZmHnnkEb75zW8CMHTo0A0P56yUAUeSpJLLTCZMmMCVV773BOdly5bx+uuv89Zbb7F27Vr69u0LQES8Z7uIIDM54ogjuO22296z7tlnn213DXfeeSeDBw+u4JO0n+fgSJJUcocddhgzZszglVdeAeAf//gHL774ImeddRY/+tGPOPXUU/nOd76zYfsnnniCF154gfXr1zN9+nQOPvhgRowYwaOPPsqSJUsAWL16Nc8//zyDBw9m2bJlPPnkkwC89tprrFu3jh133JHXXnttQ59HHXUU1113He885Pvpp58GYPTo0dx6660ALFy4kAULFnTJZ3YER5KkrakGl3Xvs88+XHHFFRx55JGsX7+e3r17M378eHr37s1XvvIV3n77bQ466CAefPBBtttuOw488EDOO+88lixZwtixYzn++OPZbrvtuOmmmzjllFP417/+BcAVV1zB3nvvzfTp0zn//PNZs2YNO+ywAw888ABjx47lqquuYtiwYUyaNIlLL72UCy+8kKFDh7J+/XoGDRrEvffeyznnnMPEiRMZMmQIQ4YM4YADDuiSzxzvJKlaqq+vz8bGxlqXIamTqn2SsScxqydrampi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
"
>
</div>

</div>

<div class="jp-OutputArea-child">

    
    <div class="jp-OutputPrompt jp-OutputArea-prompt"></div>


<div class="jp-RenderedText jp-OutputArea-output" data-mime-type="text/plain">
<pre>SW Appledore
Optimization terminated successfully.
         Current function value: 1.505738
         Iterations: 42
         Function evaluations: 81
Pearson residual: -0.0007
Chi-square goodness-of-fit test result - Reject H0: True (0.0)
</pre>
</div>
</div>

<div class="jp-OutputArea-child">

    
    <div class="jp-OutputPrompt jp-OutputArea-prompt"></div>




<div class="jp-RenderedImage jp-OutputArea-output ">
<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAjgAAAEYCAYAAABRMYxdAAAAOXRFWHRTb2Z0d2FyZQBNYXRwbG90bGliIHZlcnNpb24zLjMuNCwgaHR0cHM6Ly9tYXRwbG90bGliLm9yZy8QVMy6AAAACXBIWXMAAAsTAAALEwEAmpwYAAAamklEQVR4nO3df7BWZb338fdXoTaQpin6eMSEJiXUhxBhh6IE+DNzRBsSLTuINqSpKaeZFEuz8ozaYaTUfsiEZZM/NoOajNM5j4g6RiMoKCKCGGHttmFyKFARUuL7/LGXhIK697734obF+zXj7Hv9uK/7y+Vm89nXuta6IjORJEmqkl3qXYAkSVJnM+BIkqTKMeBIkqTKMeBIkqTKMeBIkqTK6VLvAgD23nvv7N27d73LkCRJ26n58+f/b2b2bOv520XA6d27N/Pmzat3GZIkaTsVEX9qz/leopIkSZVjwJEkSZVjwJEkSZWzXczBkSSpCt58801aWlpYv359vUvZYTU0NNCrVy+6du1aUzsGHEmSOklLSwu77bYbvXv3JiLqXc4OJzNZtWoVLS0t9OnTp6a2vEQlSVInWb9+PXvttZfhpoMigr322qtTRsAMOJIkdSLDTW06q/8MOJIkqXKcgyNJUkkmz3y+U9ubcPzBHXrfH//4R0455RQWLVrUqfXUavjw4UyaNIlBgwZ1etuO4EiSpHbbsGFDvUt4T47gSHXU2b/dveWt3/LKbl/S9umGG27g1ltvBeDLX/4yp512Ghs2bOCLX/wiTz75JIceeii//OUv6d69O5dffjkzZsygS5cunHDCCUyaNImVK1dy/vnn09zcDMAPfvADhg4dytVXX80f/vAHli9fzkc/+lFeeOEFpk6dyqGHHgr8a0SmX79+XHzxxSxatIg333yTq6++mlGjRrFu3TrGjRvH008/zSc+8QnWrVtXWh8YcCRJqpD58+fz85//nLlz55KZfOpTn+LTn/40S5cuZerUqQwdOpRzzz2XH//4x4wbN457772X5557johg9erVAFxyySVMmDCBo48+mubmZk488USWLFkCwOLFi5k9ezbdunVj8uTJTJs2je985zusWLGCFStWMGjQIK644gpGjhzJrbfeyurVq2lsbOS4447jlltuoXv37ixZsoSFCxcycODA0vrBS1SSJFXI7NmzOf300+nRowcf+tCH+NznPsdvf/tbDjjgAIYOHQrA2WefzezZs/nwhz9MQ0MD5513Hvfccw/du3cH4MEHH+Siiy5iwIABnHrqqbzyyiu89tprAJx66ql069YNgDPOOIPp06cDMG3aNEaPHg3AAw88wHXXXceAAQMYPnw469evp7m5mUcffZSzzz4bgP79+9O/f//S+sERHEmSdgLvvP06IujSpQuPP/44s2bNYvr06dx888089NBDbNy4kTlz5tDQ0LBFOz169Nj0ev/992evvfZi4cKFNDU18dOf/hRofWDf3XffTd++fcv9Q70HR3AkSaqQY445hl//+te8/vrrrF27lnvvvZdjjjmG5uZmHnvsMQDuuOMOjj76aF577TXWrFnDySefzOTJk3n66acBOOGEE7jppps2tblgwYJ3/bwxY8bw/e9/nzVr1mwakTnxxBO56aabyEwAnnrqKQCGDRvGHXfcAcCiRYtYuHBhp//53+IIjiRJJanHhPyBAwdyzjnn0NjYCLROMt5zzz3p27cvP/rRjzj33HM55JBDuOCCC1izZg2jRo1i/fr1ZCY33HADADfeeCMXXngh/fv3Z8OGDQwbNmzT6Mw7jR49mksuuYQrr7xy074rr7ySSy+9lP79+7Nx40b69OnD/fffzwUXXMC4cePo168f/fr144gjjiitH+KtdFVPgwYNynnz5tW7DGmb8y4qqVqWLFlCv3796l3GDm9r/RgR8zOzzQ/M8RKVJEmqHAOOJEmqHAOOJEmqHAOOJEmqHAOOJEmqHAOOJEmqHJ+DI0lSWR6+tnPbGzGxc9vrJAsWLOAvf/kLJ598crve99binIMGtfnu7zZ73xGciLg1Il6OiEWb7fuviHguIhZGxL0RscdmxyZGxLKIWBoRJ3Z6xZIkabuyYMECfvOb39S7jLdpyyWqXwAnvWPfTOCwzOwPPA9MBIiIQ4AzgUOL9/w4InbttGolSdL7+tWvfkVjYyMDBgzgK1/5CnPnzqV///6sX7+etWvXcuihh7Jo0SIeeeQRhg0bxmc/+1n69u3L+eefz8aNG4HWBTOPPPJIBg4cyOc///lNi20+8cQTHHXUUXzyk5+ksbGRNWvWcNVVV9HU1MSAAQNoampi7dq1nHvuuTQ2NnL44Ydz3333AbBu3TrOPPNM+vXrx+mnn866detK64P3vUSVmY9GRO937Htgs805wOji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
"
>
</div>

</div>

<div class="jp-OutputArea-child">

    
    <div class="jp-OutputPrompt jp-OutputArea-prompt"></div>


<div class="jp-RenderedText jp-OutputArea-output" data-mime-type="text/plain">
<pre>Hurricane Island
Optimization terminated successfully.
         Current function value: 2.318743
         Iterations: 34
         Function evaluations: 67
Pearson residual: -0.0002
Chi-square goodness-of-fit test result - Reject H0: False (0.4478)
</pre>
</div>
</div>

<div class="jp-OutputArea-child">

    
    <div class="jp-OutputPrompt jp-OutputArea-prompt"></div>




<div class="jp-RenderedImage jp-OutputArea-output ">
<img src="data:image/png;base64,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
"
>
</div>

</div>

<div class="jp-OutputArea-child">

    
    <div class="jp-OutputPrompt jp-OutputArea-prompt"></div>


<div class="jp-RenderedText jp-OutputArea-output" data-mime-type="text/plain">
<pre>Schoodic
Optimization terminated successfully.
         Current function value: 1.940951
         Iterations: 38
         Function evaluations: 74
Pearson residual: -0.0015
Chi-square goodness-of-fit test result - Reject H0: True (0.0039)
</pre>
</div>
</div>

<div class="jp-OutputArea-child">

    
    <div class="jp-OutputPrompt jp-OutputArea-prompt"></div>




<div class="jp-RenderedImage jp-OutputArea-output ">
<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAjgAAAEYCAYAAABRMYxdAAAAOXRFWHRTb2Z0d2FyZQBNYXRwbG90bGliIHZlcnNpb24zLjMuNCwgaHR0cHM6Ly9tYXRwbG90bGliLm9yZy8QVMy6AAAACXBIWXMAAAsTAAALEwEAmpwYAAAb3klEQVR4nO3df7RXdZ3v8efboI6QpSk5XpGB7iihLSI8niSUwN9jLdGumaZzCW2hpqbO3FViWVa2tBmuNGq/mIG0O2m4UJPrau4VUa/R8hcoInGECJMwCgYHVAKTeN8/zhc6Isg55/vdHPic52Mt1tnfvff3/X3v714HXnz2r8hMJEmSSrJXdzcgSZLUaAYcSZJUHAOOJEkqjgFHkiQVx4AjSZKK06u7GwA44IADcuDAgd3dhiRJ2k3NmzfvPzKzX0fX3y0CzsCBA5k7d253tyFJknZTEfFCZ9b3EJUkSSqOAUeSJBXHgCNJkoqzW5yDI0lSCV5//XVWrFjBxo0bu7uVPVZTUxP9+/end+/eddUx4EiS1CArVqxgn332YeDAgUREd7ezx8lM1qxZw4oVKxg0aFBdtTxEJUlSg2zcuJH999/fcNNFEcH+++/fkBEwA44kSQ1kuKlPo76/nQaciJgWEasiYuF2lv1DRGREHFB7HRFxU0QsjYgFETG8IV1KkiR1QkfOwbkVuAX4UfuZEXEIcBKwvN3svwUOrf35MPC92k9JknqcybOWNLTelSce1qX3/eY3v+HjH/84Cxe+aayiW40ePZpJkybR3Nzc8No7HcHJzEeAl7azaDLwBSDbzRsL/CjbPAbsGxEHNaRTSZK029i0aVN3t/CWunQVVUSMBV7MzGe2OVZ2MPDbdq9X1Oat3E6NCcAEgAEDBnSlDUkFa/T/fNvr6v+CpT3FjTfeyLRp0wD47Gc/y+mnn86mTZs499xzeeqppzjiiCP40Y9+RJ8+fbjqqquYOXMmvXr14qSTTmLSpEmsXr2aiy66iOXL2w7SfPvb32bkyJFce+21/PrXv2bZsmUMGDCA559/nqlTp3LEEUcAfxmRGTJkCJdddhkLFy7k9ddf59prr2Xs2LFs2LCB8ePH88wzz/D+97+fDRs2VPYddDrgREQf4GraDk91WWZOAaYANDc3505WlyRJHTBv3jx++MMf8vjjj5OZfPjDH+ajH/0oixcvZurUqYwcOZLzzz+f7373u4wfP5577rmH5557johg7dq1AFx++eVceeWVHHPMMSxfvpyTTz6Z1tZWABYtWsScOXPYe++9mTx5MnfeeSdf+9rXWLlyJStXrqS5uZmrr76a4447jmnTprF27VpaWlo44YQT+MEPfkCfPn1obW1lwYIFDB9e3am6XbmK6r8Cg4BnIuI3QH/gqYj4K+BF4JB26/avzZMkSbvAnDlzOOOMM+jbty/vfOc7+cQnPsHPf/5zDjnkEEaOHAnAeeedx5w5c3j3u99NU1MTF1xwAXfffTd9+vQB4IEHHuDSSy9l2LBhnHbaabz88su8+uqrAJx22mnsvffeAJx11lnMmDEDgDvvvJMzzzwTgPvvv58bbriBYcOGMXr0aDZu3Mjy5ct55JFHOO+88wAYOnQoQ4cOrex76PQITmY+C7x3y+tayGnOzP+IiJnApRHxE9pOLl6XmW86PCVJknatbS+/jgh69erFE088wezZs5kxYwa33HILDz74IJs3b+axxx6jqanpTXX69u27dfrggw9m//33Z8GCBUyfPp3vf//7QNsN++666y4GDx5c7Ua9hY5cJn4H8CgwOCJWRMQFb7H6z4BlwFLgX4DPNaRLSZLUIcceeyw//elP+eMf/8j69eu55557OPbYY1m+fDmPPvooALfffjvHHHMMr776KuvWrePUU09l8uTJPPPMMwCcdNJJ3HzzzVtrzp8/f4ef96lPfYp//Md/ZN26dVtHZE4++WRuvvlmMtvOQHn66acBGDVqFLfffjsACxcuZMGCBQ3f/i12OoKTmefsZPnAdtMJXFJ/W5Ik7fm644T24cOH85nPfIaWlhag7STj/fbbj8GDB/Od73yH888/n8MPP5yLL76YdevWMXbsWDZu3EhmcuONNwJw0003cckllzB06FA2bdrEqFGjto7ObOvMM8/k8ssv55prrtk675prruGKK65g6NChbN68mUGDBnHfffdx8cUXM378eIYMGcKQIUM48sgjK/seYku66k7Nzc05d+7c7m5D0m7Eq6i0J2ptbWXIkCHd3cYeb3vfY0TMy8wO3zDHRzVIkqTiGHAkSVJxDDiSJKk4BhxJklQcA44kSSqOAUeSJBWnSw/blCRJHfDQ9Y2tN2ZiY+s1yPz58/nd737Hqaee2qn3bXk4Z3Nzh6/+7jBHcCRJUl3mz5/Pz372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
"
>
</div>

</div>

<div class="jp-OutputArea-child">

    
    <div class="jp-OutputPrompt jp-OutputArea-prompt"></div>


<div class="jp-RenderedText jp-OutputArea-output" data-mime-type="text/plain">
<pre>Nubble Lighthouse
Optimization terminated successfully.
         Current function value: 1.954186
         Iterations: 39
         Function evaluations: 75
Pearson residual: 0.0011
Chi-square goodness-of-fit test result - Reject H0: True (0.0016)
</pre>
</div>
</div>

<div class="jp-OutputArea-child">

    
    <div class="jp-OutputPrompt jp-OutputArea-prompt"></div>




<div class="jp-RenderedImage jp-OutputArea-output ">
<img src="data:image/png;base64,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
"
>
</div>

</div>

<div class="jp-OutputArea-child">

    
    <div class="jp-OutputPrompt jp-OutputArea-prompt"></div>


<div class="jp-RenderedText jp-OutputArea-output" data-mime-type="text/plain">
<pre>Nahant
Optimization terminated successfully.
         Current function value: 2.971218
         Iterations: 32
         Function evaluations: 61
Pearson residual: 0.0047
Chi-square goodness-of-fit test result - Reject H0: True (0.0)
</pre>
</div>
</div>

<div class="jp-OutputArea-child">

    
    <div class="jp-OutputPrompt jp-OutputArea-prompt"></div>




<div class="jp-RenderedImage jp-OutputArea-output ">
<img src="data:image/png;base64,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RsT8iPgtQGY+BUwFFgH/BZyXme9UrXpJkrRV/vSnP9HQ0EDv3r05++yzmTNnDr169WLt2rW8/vrrHHTQQSxcuJD777+fgQMH8pWvfIXu3btzzjnnsH79eqDpgZn9+/enT58+fO1rX9vwsM1HH32Uww47jM9//vM0NDTw8ssvc9lllzFlyhR69+7NlClTeP311znzzDNpaGjgkEMO4c477wRgzZo1nHLKKfTo0YMTTzyRNWvWtEq/WzxElZmnbmZ40ofs/1Pgp5UUJUmSWs/ixYuZMmUKDz74IO3bt+db3/oWS5YsYejQofzgBz9gzZo1nH766Rx88MHcf//9PPLIIyxatIhPf/rTHHvssdx+++0MGjSIK664gnvuuYdOnTpx9dVXc8011zBmzBiGDx/OlClT6Nu3L6+88godO3bkxz/+MXPnzuW6664D4JJLLmHIkCFMnjyZ1atX09DQwJFHHsn1119Px44dWbx4MQsWLKBPnz6t0rPPopIkqeRmzZrFvHnz6Nu3L9C0avLJT36Syy67jL59+1JXV8e11167Yf+GhoYND9k89dRTmT17NnV1dSxatIgBAwYA8NZbb9G/f3+WLFnCvvvuu2Hu3XfffbM13H333UyfPp1x48YBsHbtWpYtW8YDDzzAt7/9bQB69eq14eGclTLgSJJUcpnJiBEjuPLK95/gvGLFCl577TXefvtt1q5dS6dOnQCIiPftFxFkJkcddRS33HLL+9578sknt7qG2267je7du1fQydbzWVSSJJXcEUccwbRp01i5ciUAL730Es8//zxnn302P/nJTzjttNO4+OKLN+z/yCOP8Nxzz7F+/XqmTJnC4YcfTr9+/XjwwQdZunQpAK+//jrPPPMM3bt3Z8WKFTz66KMAvPrqq6xbt47ddtuNV199dcOcxxxzDBMmTODdC68ff/xxAAYOHMjNN98MwMKFC1mwYEGr9OwKjiRJ21MNLuvu2bMnV1xxBUcffTTr16+nffv2DBs2jPbt2/P1r3+dd955h8MOO4x7772XXXbZhb59+3L++eezdOlSBg8ezIknnsguu+zCDTfcwKmnnsqbb74JwBVXXMGBBx7IlClTuOCCC1izZg0dOnTgnnvuYfDgwVx11VX07t2bsWPHcumll3LhhRfSq1cv1q9fT7du3ZgxYwbnnnsuI0eOpEePHvTo0YNDDz20VXo24Eg7gH7LJlZx9nE89Oyqqs3ef3DVppbUioYPH87w4cM3+96uu+7KnDlzALj//vvZfffdmTFjxib7DRkyZMNKTXN9+/bl4Ycf3mR8432vv/76Tfbp0KEDt95661b1sC08RCVJkkrHFRxJkrTBoEGDGDRoUK3LqJgrOJIkVdl7TzRSS23r76EBR5KkKqqrq2PVqlWGnApkJqtWraKurm6rP+MhKkmSqqhLly4sX76cxsbGWpeyU6urq6NLly5bvb8BR5KkKmrfvj3dunWrdRltjoeoJElS6RhwJElS6XiISlLFvJGgpB2NKziSJKl0XMGRtOO778ot79NSNXgukKTqcwVHkiSVjis4knZ4nuMjaVu5giNJkkrHgCNJkkrHgCNJkkrHgCNJkkrHgCNJkkrHgCNJkkrHgCNJkkrHgCNJkkrHgCNJkkrHgCNJkkrHgCNJkkpniwEnIiZHxMqIWNhs7BMRMTMi/lL83LMYj4i4NiKWRsSCiOhTzeIlSZI2Z2tWcG4Ajt1obAwwKzMPAGYV2wBfBg4ofp0F/KZ1ypQkSdp6Www4mfkA8NJGw8OAG4vXNwInNBv/QzZ5GNgjIvZtpVolSZK2SkvPwdknM1cUr18E9ile7wf8vdl+y4uxTUTEWRExNyLmNjY2trAMSZKkTVV8knFmJpAt+NzEzKzPzPrOnTtXWoYkSdIGLQ04/3z30FPxc2Ux/gKwf7P9uhRjkiRJ201LA850YETxegRwZ7Pxfy+upuoHvNzsUJYkSdJ20W5LO0TELcAgYO+IWA78ELgKmBoRo4DngZOL3e8CjgOWAm8AI6tQsyRJ0ofaYsDJzFM/4K0jNrNvAudVWpQkSVIlvJOxJEkqHQOOJEkqnS0eopIE3Hdl9eYePLZ6c0tSG+UKjiRJKh0DjiRJKh0DjiRJKh0DjiRJKh0DjiRJKh0DjiRJKh0DjiRJKh0DjiRJKh0DjiRJKh0DjiRJKh0f1SCpzRs/85mqzX3RUQdWbW5JH8wVHEmSVDoGHEmSVDoGHEmSVDqegyOpzeu3bGIVZx9XxbklfRBXcCRJUum4giNthYeeXVW1ufsPrtrUktRmuYIjSZJKx4AjSZJKx4AjSZJKx4AjSZJKx4AjSZJKx4AjSZJKx4AjSZJKx4AjSZJKx4AjSZJKp6KAExEXRcRTEbEwIm6JiLqI6BYRcyJiaURMiYiPtFaxkiRJW6PFASci9gO+DdRn5sHArsApwNXA+Mz8LPAvYFRrFCpJkrS1Kj1E1Q7oEBHtgI7ACmAIMK14/0bghAq/Q5IkaZu0OOBk5gvAOGAZTcHmZWAesDoz1xW7LQf229znI+KsiJgbEXMbGxtbWoYkSdImKjlEtScwDOgG/BvQCTh2az+fmRMzsz4z6zt37tzSMiRJkjZRySGqI4HnMrMxM98GbgcGAHsUh6wAugAvVFijJEnSNqkk4CwD+kVEx4gI4AhgEXAfcFKxzwjgzspKlCRJ2jaVnIMzh6aTiR8DnizmmghcDPxHRCwF9gImtUKdkiRJW63dlnf5YJn5Q+CHGw0/CzRUMq8kSVIlvJOxJEkqHQOOJEkqHQOOJEkqHQOOJEkqHQOOJEkqnYquopJ2FONnPlOVeS866sCqzCtJqi5XcCRJUum4gqNS6LdsYpVmHleleSVJ1eQKjiRJKh0DjiRJKh0DjiRJKh0DjiRJKh0DjiRJKh0DjiRJKh0DjiRJKh0DjiRJKh0DjiRJKh0DjiRJKh0f1aDtwodhSpK2J1dwJElS6biCI0lVVq0VTHAVU/ogruBIkqTSMeBIkqTSMeBIkqTS8RwcSaqyfssmVnH2cVWcW9p5uYIjSZJKx4AjSZJKx4AjSZJKp6KAExF7RMS0iHg6IhZHRP+I+EREzIyIvxQ/92ytYiVJkrZGpSs4vwT+KzM/B3weWAyMAWZl5gHArGJbkiRpu2lxwImIjwMDgUkAmflWZq4GhgE3FrvdCJxQWYmSJEnbppIVnG5AI/D7iHg8In4XEZ2AfTJzRbHPi8A+lRYpSZK0LSoJOO2APsBvMvMQ4HU2OhyVmQnk5j4cEWdFxNyImNvY2FhBGZIkSe9XScBZDizPzDnF9jSaAs8/I2JfgOLnys19ODMnZmZ9ZtZ37ty5gjIkSZLer8UBJzNfBP4eEd2LoSOARcB0YEQxNgK4s6IKJUmStlGlj2q4ALgpIj4CPAuMpCk0TY2IUcDzwMkVfockSdI2qSjgZOZ8oH4zbx1RybySJEmV8E7GkiSpdAw4kiSpdAw4kiSpdAw4kiSpdAw4kiSpdAw4kiSpdAw4kiSpdAw4kiSpdAw4kiSpdAw4kiSpdAw4kiSpdAw4kiSpdAw4kiSpdAw4kiSpdNrVugC1Df2WTazSzOOqNK8kaWfmCo4kSSodA44kSSodA44kSSodA44kSSodA44kSSodA44kSSodLxOXpJ3c+JnPVG3ui446sGpzS9XkCo4kSSodA44kSSodA44kSSodA44kSSodA44kSSodr6KSpJ1c9R5mCz7QVjsrV3AkSVLpVBxwImLXiHg8ImYU290iYk5ELI2IKRHxkcrLlCRJ2nqtsYIzGljcbPtqYHxmfhb4FzCqFb5DkiRpq1UUcCKiC/AV4HfFdgBDgGnFLjcCJ1TyHZIkSduq0hWcXwDfA9YX23sBqzNzXbG9HNhvcx+MiLMiYm5EzG1sbKywDEmSpPe0OOBExPHAysyc15LPZ+bEzKzPzPrOnTu3tAxJkqRNVHKZ+ABgaEQcB9QBuwO/BPaIiHbFKk4X4IXKy5QkSdp6LV7BycyxmdklM7sCpwD3ZuZpwH3AScVuI4A7K65SkiRpG1TjPjgXA/8REUtpOidnUhW+Q5Ik6QO1yp2MM/N+4P7i9bNAQ2vMK0mS1BLeyViSJJWOAUeSJJWOAUeSJJWOAUeSJJVOq5xkrJ3b+JnPVG3ui446sGpzS5L0QVzBkSRJpWPAkSRJpWPAkSRJpWPAkSRJpWPAkSRJpWPAkSRJpeNl4qLfsolVnH1cFeeWJGnzXMGRJEml4wqOJOlDeTNQ7YxcwZEkSaVjwJEkSaVjwJEkSaVjwJEkSaVjwJEkSaVjwJEkSaVjwJEkSaXjfXAkSR/Ku51rZ+QKjiRJKh0DjiRJKh0DjiRJKh0DjiRJKh0DjiRJKh0DjiRJKh0DjiRJKp0WB5yI2D8i7ouIRRHxVESMLsY/EREzI+Ivxc89W69cSZKkLatkBWcd8J3M7An0A86LiJ7AGGBWZh4AzCq2JUmStpsWB5zMXJGZjxWvXwUWA/sBw4Abi91uBE6osEZJkqRt0irn4EREV+AQYA6wT2auKN56EdjnAz5zVkTMjYi5jY2NrVGGJEkS0AoBJyI+BtwGXJiZrzR/LzMTyM19LjMnZmZ9ZtZ37ty50jIkSZI2qCjgRER7msLNTZl5ezH8z4jYt3h/X2BlZSVKkiRtm0quogpgErA4M69p9tZ0YETxegRwZ8vLkyRJ2nbtKvjsAOAbwJMRMb8YuwS4CpgaEaOA54GTK6pQcN+V1Zt78NjqzS1JUo20OOBk5mwgPuDtI1o6ryRJUqW8k7EkSSodA44kSSodA44kSSodA44kSSqdSq6i0nby0LOrqjZ3/8FVm1qSpJox4EiSastbYagKPEQlSZJKx4AjSZJKx4AjSZJKx4AjSZJKx4AjSZJKx4AjSZJKx4AjSZJKx/vgSJJqypuZqhpcwZEkSaXjCk5r8C6ckiTtUFzBkSRJpWPAkSRJpWPAkSRJpeM5OJKkUnto0v+t2tz9R42r2tyqjAGnFXiJoyRJOxYPUUmSpNIx4EiSpNIx4EiSpNJpE+fgeIKZJEltiys4kiSpdNrECo4kSVVVrUf2+LieFnMFR5IklY4rOJIkVaha90PbXvdCGz/zmarNfdFRB1Zt7g9TtRWciDg2IpZExNKIGFOt75EkSdpYVVZwImJX4FfAUcBy4NGImJ6Zi6rxfZIklVq1zvGB0p7nU60VnAZgaWY+m5lvAbcCw6r0XZIkSe8Tmdn6k0acBBybmd8str8BfCEzz2+2z1nAWcXmwcDCVi9k57A38D+1LqJG7L3taat9g73be9uzvXr/dGZ23niwZicZZ+ZEYCJARMzNzPpa1VJL9m7vbUlb7Rvs3d7bnlr3Xq1DVC8A+zfb7lKMSZIkVV21As6jwAER0S0iPgKcAkyv0ndJkiS9T1UOUWXmuog4H/hvYFdgcmY+9SEfmViNOnYS9t42tdXe22rfYO9tlb3XSFVOMpYkSaolH9UgSZJKx4AjSZJKZ4cIOBHxnYjIiNi72I6IuLZ4zMOCiOhT6xpbW0T8pOhtfkTcHRH/Voy3hd5/HhFPF/3dERF7NHtvbNH7kog4poZltrqI+FpEPBUR6yOifqP3Stv3u9rS41siYnJErIyIhc3GPhERMyPiL8XPPWtZYzVExP4RcV9ELCr+ro8uxttC73UR8UhEPFH0/qNivFtEzCn+3k8pLrwppYjYNSIej4gZxXZNe695wImI/YGjgWXNhr8MHFD8Ogv4TQ1Kq7afZ2avzOwNzAAuK8bbQu8zgYMzsxfwDDAWICJ60nTF3UHAscCvi8d+lMVC4KvAA80H20DfzR/f8mWgJ3Bq0XdZ3UDTn2VzY4BZmXkAMKvYLpt1wHcysyfQDziv+HNuC72/CQzJzM8DvYFjI6IfcDUwPjM/C/wLGFW7EqtuNLC42XZNe695wAHGA98Dmp/tPAz4QzZ5GNgjIvatSXVVkpmvNNvsxHv9t4Xe787MdcXmwzTdJwmaer81M9/MzOeApTQ99qMUMnNxZi7ZzFul7rvQph7fkpkPAC9tNDwMuLF4fSNwwvasaXvIzBWZ+Vjx+lWa/me3H22j98zM14rN9sWvBIYA04rxUvYOEBFdgK8Avyu2gxr3XtOAExHDgBcy84mN3toP+Huz7eXFWKlExE8j4u/Aaby3gtMmem/mTOA/i9dtrfd3tYW+20KPW7JPZq4oXr8I7FPLYqotIroChwBzaCO9F4do5gMraVqp/iuwutk/6Mr89/4XNC1WrC+296LGvVf9UQ0RcQ/wvzbz1veBS2g6PFVKH9Z7Zt6Zmd8Hvh8RY4HzgR9u1wKraEu9F/t8n6Yl7Zu2Z23VtDV9S5mZEVHae3RExMeA24ALM/OVpn/MNylz75n5DtC7OK/wDuBzta1o+4iI44GVmTkvIgbVuJwNqh5wMvPIzY1HxP8GugFPFH/5uwCPRUQDJXnUwwf1vhk3AXfRFHDaRO8RcQZwPHBEvnczpp2+9234M29up+97K7SFHrfknxGxb2auKA47r6x1QdUQEe1pCjc3ZebtxXCb6P1dmbk6Iu4D+tN0mkG7YiWjrH/vBwBDI+I4oA7YHfglNe69ZoeoMvPJzPxkZnbNzK40LV/1ycwXaXqsw78XVxT1A15utrxZChFxQLPNYcDTxeu20PuxNC1lDs3MN5q9NR04JSI+GhHdaDrR+pFa1LidtYW+fXxLU78jitcjgNKt6BXnXUwCFmfmNc3eagu9d373itCI6AAcRdM5SPcBJxW7lbL3zBybmV2K/5efAtybmadR495r9jTxLbgLOI6mky3fAEbWtpyquCoiutN0vPJ54JxivC30fh3wUWBmsXr3cGaek5lPRcRUYBFNh67OK5Z8SyEiTgQmAJ2B/xcR8zPzmLL3DS16fMtOLSJuAQYBe0fEcppWZ68CpkbEKJr+mz+5dhVWzQDgG8CTxbko0HQqQlvofV/gxuKKwV2AqZk5IyIWAbdGxBXA4zQFwLbiYmrYu49qkCRJpbMjXCYuSZLUqgw4kiSpdAw4kiSpdAw4kiSpdAw4kiSpdAw4kiSpdAw4kiSpdP4/rE3WWwcxNKQAAAAASUVORK5CYII=
"
>
</div>

</div>

<div class="jp-OutputArea-child">

    
    <div class="jp-OutputPrompt jp-OutputArea-prompt"></div>


<div class="jp-RenderedText jp-OutputArea-output" data-mime-type="text/plain">
<pre>Pemaquid
Optimization terminated successfully.
         Current function value: 2.281216
         Iterations: 34
         Function evaluations: 67
Pearson residual: 0.0003
Chi-square goodness-of-fit test result - Reject H0: False (0.1205)
</pre>
</div>
</div>

<div class="jp-OutputArea-child">

    
    <div class="jp-OutputPrompt jp-OutputArea-prompt"></div>




<div class="jp-RenderedImage jp-OutputArea-output ">
<img src="data:image/png;base64,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
"
>
</div>

</div>

<div class="jp-OutputArea-child">

    
    <div class="jp-OutputPrompt jp-OutputArea-prompt"></div>


<div class="jp-RenderedText jp-OutputArea-output" data-mime-type="text/plain">
<pre>Fort Weatherill
Optimization terminated successfully.
         Current function value: 2.808555
         Iterations: 35
         Function evaluations: 68
Pearson residual: -0.0023
Chi-square goodness-of-fit test result - Reject H0: False (0.2127)
</pre>
</div>
</div>

<div class="jp-OutputArea-child">

    
    <div class="jp-OutputPrompt jp-OutputArea-prompt"></div>




<div class="jp-RenderedImage jp-OutputArea-output ">
<img src="data:image/png;base64,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Nn3u3YdzNjZ+4MrvbeIMjiRJanNz5szhN7/5Tbt9vwFHkqQO4Fe/+hVNTU3079+f888/nxkzZtCvXz/WrVvHmjVrOPjgg5k3bx5PPvkkQ4cO5Utf+hK9e/fmggsuYMOGDUDzAzMHDx7MgAED+MpXvrLxYZvPPvsshx9+OIcccghNTU2sXr2aq6++mkmTJtG/f38mTZrEmjVrOOecc2hqauLQQw/loYceAmDt2rWcccYZ9OnTh1NOOYW1a9e2yfF6ikpS7dp6yr2lHXT6XdqZLFiwgEmTJvH000/TuXNnvvGNb7Bw4UJOOukk/vM//5O1a9dy9tln87nPfY4nn3ySmTNnMn/+fD796U9z/PHH88ADDzBs2DCuvfZaHnvsMbp168YNN9zAuHHjuOKKKzj99NOZNGkSAwcO5PXXX6dr1658//vfZ9asWdxyyy0AXHnllYwYMYKJEyeyatUqmpqaOProo7n11lvp2rUrCxYsYO7cuQwYMKBNjtmAI0lS4aZOncrs2bMZOHAg0Dxr8slPfpKrr76agQMH0tDQwE033bRx/6amJj7zmc8AcOaZZzJt2jQaGhqYP38+Q4YMAeAf//gHgwcPZuHChey7774b+9599903W8MjjzzClClTGDu2+eag69atY8mSJTz11FN885vfBKBfv34bH85ZKwOOtCPYyWdAnlm8css7tdLg4XXrWuowMpNRo0Zx3XXv/7dm2bJlvPnmm7zzzjusW7eObt26ARAR79svIshMjjnmGO655573vff73/9+q2u4//776d27dw1HsvVcgyNJUuGOOuooJk+ezPLlywH4+9//ziuvvML555/PD37wA8466yy+/e1vb9x/5syZvPzyy2zYsIFJkyZxxBFHMGjQIJ5++mkWLVoEwJo1a3jppZfo3bs3y5Yt49lnnwXgjTfeYP369ey222688cYbG/s87rjjuPnmm3n3Id/PP/88AEOHDuXuu+8GYN68ecydO7dNjtkZHEmStqd2WFfWt29frr32Wo499lg2bNhA586dGTlyJJ07d+arX/0q//znPzn88MN5/PHH2WWXXRg4cCAXX3wxixYtYvjw4Zxyyinssssu3H777Zx55pm8/fbbAFx77bUcdNBBTJo0iUsuuYS1a9fSpUsXHnvsMYYPH871119P//79GTNmDFdddRWXXXYZ/fr1Y8OGDfTq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
"
>
</div>

</div>

</div>

</div>

</div>

</body>

<br/>
From the histograms, the residuals of the observed are pretty close to the residuals of the expected, and in a good number of cases we fail to reject the null hypothesis that their errors are from two different distributions. For the purposes of moving forward, let's call this satisfactory. *Note: The rest of this post performs analysis on all of the sites, not just the sites that were determined to have a statistically significant goodness-of-fit, mostly because this is just a research endeavor.*

## Exact Hypothesis Test (E-Test)

We'll now compare the earliest and latest recorded years of the observed data for each kelp forest site. The purpose being that if we can determine a statistically significant difference between the two distributions, we can determine that there has been a change in the rate of kelp observations between the earliest and latest years at a site. This can have important implications for decision making in wildlife monitoring- if we're highly confident there has been a decrease in kelp, that may indicate a priority for wildlife management organizations. The Exact Hypothesis test is useful for this purpose. In most implementations on the internet, a Poisson E-Test compares the two population's Poisson rate parameters. In the code below, I reference the source code for the Poisson E-Test the python statsmodels library, and hack in some functionality Zero Inflated PMF.

<body class="jp-Notebook" data-jp-theme-light="true" data-jp-theme-name="JupyterLab Light">

<div class="jp-Cell jp-CodeCell jp-Notebook-cell jp-mod-noOutputs  ">
<div class="jp-Cell-inputWrapper">
<div class="jp-InputArea jp-Cell-inputArea">
<div class="jp-CodeMirrorEditor jp-Editor jp-InputArea-editor" data-type="inline">
     <div class="CodeMirror cm-s-jupyter">
<div class=" highlight hl-ipython3"><pre><span></span><span class="k">def</span> <span class="nf">etest_zip_2indep</span><span class="p">(</span><span class="n">lambda1</span><span class="p">,</span> <span class="n">pi1</span><span class="p">,</span> <span class="n">n1</span><span class="p">,</span> <span class="n">sum1</span><span class="p">,</span> <span class="n">lambda2</span><span class="p">,</span> <span class="n">pi2</span><span class="p">,</span> <span class="n">n2</span><span class="p">,</span> <span class="n">sum2</span><span class="p">,</span> <span class="n">ratio_null</span><span class="o">=</span><span class="mi">1</span><span class="p">,</span> <span class="n">method</span><span class="o">=</span><span class="s1">&#39;score&#39;</span><span class="p">,</span> 
                     <span class="n">alternative</span><span class="o">=</span><span class="s1">&#39;2-sided&#39;</span><span class="p">,</span> <span class="n">ygrid</span><span class="o">=</span><span class="kc">None</span><span class="p">,</span> <span class="n">y_grid</span><span class="o">=</span><span class="kc">None</span><span class="p">):</span>
    <span class="sd">&quot;&quot;&quot;E-test for ratio of two sample Zero Inflated Poisson rates. A modification of the </span>
<span class="sd">    etest_poisson_2indep function in statsmodels library, Incorporates estimated ZIP parameters: lambda, pi.</span>
<span class="sd">    </span>
<span class="sd">    References:</span>
<span class="sd">     https://www.statsmodels.org/devel/generated/statsmodels.stats.rates.etest_poisson_2indep.html#statsmodels.stats.rates.etest_poisson_2indep</span>
<span class="sd">    &quot;&quot;&quot;</span>
    <span class="n">d</span> <span class="o">=</span> <span class="n">n2</span> <span class="o">/</span> <span class="n">n1</span>
    <span class="n">r</span> <span class="o">=</span> <span class="n">ratio_null</span>
    <span class="n">r_d</span> <span class="o">=</span> <span class="n">r</span> <span class="o">/</span> <span class="n">d</span>

    <span class="n">eps</span> <span class="o">=</span> <span class="mf">1e-20</span>  <span class="c1"># avoid zero division in stat_func</span>

    <span class="k">if</span> <span class="n">method</span> <span class="ow">in</span> <span class="p">[</span><span class="s1">&#39;score&#39;</span><span class="p">]:</span>
        <span class="k">def</span> <span class="nf">stat_func</span><span class="p">(</span><span class="n">x1</span><span class="p">,</span> <span class="n">x2</span><span class="p">):</span>
            <span class="k">return</span> <span class="p">(</span><span class="n">x1</span> <span class="o">-</span> <span class="n">x2</span> <span class="o">*</span> <span class="n">r_d</span><span class="p">)</span> <span class="o">/</span> <span class="n">np</span><span class="o">.</span><span class="n">sqrt</span><span class="p">((</span><span class="n">x1</span> <span class="o">+</span> <span class="n">x2</span><span class="p">)</span> <span class="o">*</span> <span class="n">r_d</span> <span class="o">+</span> <span class="n">eps</span><span class="p">)</span>

    <span class="k">elif</span> <span class="n">method</span> <span class="ow">in</span> <span class="p">[</span><span class="s1">&#39;wald&#39;</span><span class="p">]:</span>
        <span class="k">def</span> <span class="nf">stat_func</span><span class="p">(</span><span class="n">x1</span><span class="p">,</span> <span class="n">x2</span><span class="p">):</span>
            <span class="k">return</span> <span class="p">(</span><span class="n">x1</span> <span class="o">-</span> <span class="n">x2</span> <span class="o">*</span> <span class="n">r_d</span><span class="p">)</span> <span class="o">/</span> <span class="n">np</span><span class="o">.</span><span class="n">sqrt</span><span class="p">(</span><span class="n">x1</span> <span class="o">+</span> <span class="n">x2</span> <span class="o">*</span> <span class="n">r_d</span><span class="o">**</span><span class="mi">2</span> <span class="o">+</span> <span class="n">eps</span><span class="p">)</span>
    <span class="k">else</span><span class="p">:</span>
        <span class="k">raise</span> <span class="ne">ValueError</span><span class="p">(</span><span class="s1">&#39;method not recognized&#39;</span><span class="p">)</span>

    <span class="n">stat_sample</span> <span class="o">=</span> <span class="n">stat_func</span><span class="p">(</span><span class="n">sum1</span><span class="p">,</span> <span class="n">sum2</span><span class="p">)</span>

    <span class="k">if</span> <span class="n">ygrid</span> <span class="ow">is</span> <span class="ow">not</span> <span class="kc">None</span><span class="p">:</span>
        <span class="n">warnings</span><span class="o">.</span><span class="n">warn</span><span class="p">(</span><span class="s2">&quot;ygrid is deprecated, use y_grid&quot;</span><span class="p">,</span> <span class="ne">DeprecationWarning</span><span class="p">)</span>
    <span class="n">y_grid</span> <span class="o">=</span> <span class="n">y_grid</span> <span class="k">if</span> <span class="n">y_grid</span> <span class="ow">is</span> <span class="ow">not</span> <span class="kc">None</span> <span class="k">else</span> <span class="n">ygrid</span>

    <span class="c1"># The following uses a fixed truncation for evaluating the probabilities</span>
    <span class="c1"># It will currently only work for small counts, so that sf at truncation</span>
    <span class="c1"># point is small</span>
    <span class="c1"># We can make it depend on the amount of truncated sf.</span>
    <span class="c1"># Some numerical optimization or checks for large means need to be added.</span>
    <span class="k">if</span> <span class="n">y_grid</span> <span class="ow">is</span> <span class="kc">None</span><span class="p">:</span>
        <span class="n">threshold</span> <span class="o">=</span> <span class="n">stats</span><span class="o">.</span><span class="n">poisson</span><span class="o">.</span><span class="n">isf</span><span class="p">(</span><span class="mf">1e-13</span><span class="p">,</span> <span class="nb">max</span><span class="p">(</span><span class="n">lambda1</span><span class="p">,</span> <span class="n">lambda2</span><span class="p">))</span>
        <span class="n">threshold</span> <span class="o">=</span> <span class="nb">max</span><span class="p">(</span><span class="n">threshold</span><span class="p">,</span> <span class="mi">100</span><span class="p">)</span>   <span class="c1"># keep at least 100</span>
        <span class="n">y_grid</span> <span class="o">=</span> <span class="n">np</span><span class="o">.</span><span class="n">arange</span><span class="p">(</span><span class="n">threshold</span> <span class="o">+</span> <span class="mi">1</span><span class="p">)</span>
    <span class="k">else</span><span class="p">:</span>
        <span class="n">y_grid</span> <span class="o">=</span> <span class="n">np</span><span class="o">.</span><span class="n">asarray</span><span class="p">(</span><span class="n">y_grid</span><span class="p">)</span>
        <span class="k">if</span> <span class="n">y_grid</span><span class="o">.</span><span class="n">ndim</span> <span class="o">!=</span> <span class="mi">1</span><span class="p">:</span>
            <span class="k">raise</span> <span class="ne">ValueError</span><span class="p">(</span><span class="s2">&quot;y_grid needs to be None or 1-dimensional array&quot;</span><span class="p">)</span>

    <span class="n">pdf1</span> <span class="o">=</span> <span class="n">zip_pmf</span><span class="p">(</span><span class="n">y_grid</span><span class="p">,</span> <span class="n">pi</span><span class="o">=</span><span class="n">pi1</span><span class="p">,</span> <span class="n">lambda_</span><span class="o">=</span><span class="n">lambda1</span><span class="p">)</span>
    <span class="n">pdf2</span> <span class="o">=</span> <span class="n">zip_pmf</span><span class="p">(</span><span class="n">y_grid</span><span class="p">,</span> <span class="n">pi</span><span class="o">=</span><span class="n">pi2</span><span class="p">,</span> <span class="n">lambda_</span><span class="o">=</span><span class="n">lambda2</span><span class="p">)</span>

    <span class="n">stat_space</span> <span class="o">=</span> <span class="n">stat_func</span><span class="p">(</span><span class="n">y_grid</span><span class="p">[:,</span> <span class="kc">None</span><span class="p">],</span> <span class="n">y_grid</span><span class="p">[</span><span class="kc">None</span><span class="p">,</span> <span class="p">:])</span>  <span class="c1"># broadcasting</span>
    <span class="n">eps</span> <span class="o">=</span> <span class="mf">1e-15</span>   <span class="c1"># correction for strict inequality check</span>

    <span class="k">if</span> <span class="n">alternative</span> <span class="ow">in</span> <span class="p">[</span><span class="s1">&#39;two-sided&#39;</span><span class="p">,</span> <span class="s1">&#39;2-sided&#39;</span><span class="p">,</span> <span class="s1">&#39;2s&#39;</span><span class="p">]:</span>
        <span class="n">mask</span> <span class="o">=</span> <span class="n">np</span><span class="o">.</span><span class="n">abs</span><span class="p">(</span><span class="n">stat_space</span><span class="p">)</span> <span class="o">&gt;=</span> <span class="n">np</span><span class="o">.</span><span class="n">abs</span><span class="p">(</span><span class="n">stat_sample</span><span class="p">)</span> <span class="o">-</span> <span class="n">eps</span>
    <span class="k">elif</span> <span class="n">alternative</span> <span class="ow">in</span> <span class="p">[</span><span class="s1">&#39;larger&#39;</span><span class="p">,</span> <span class="s1">&#39;l&#39;</span><span class="p">]:</span>
        <span class="n">mask</span> <span class="o">=</span> <span class="n">stat_space</span> <span class="o">&gt;=</span> <span class="n">stat_sample</span> <span class="o">-</span> <span class="n">eps</span>
    <span class="k">elif</span> <span class="n">alternative</span> <span class="ow">in</span> <span class="p">[</span><span class="s1">&#39;smaller&#39;</span><span class="p">,</span> <span class="s1">&#39;s&#39;</span><span class="p">]:</span>
        <span class="n">mask</span> <span class="o">=</span> <span class="n">stat_space</span> <span class="o">&lt;=</span> <span class="n">stat_sample</span> <span class="o">+</span> <span class="n">eps</span>
    <span class="k">else</span><span class="p">:</span>
        <span class="k">raise</span> <span class="ne">ValueError</span><span class="p">(</span><span class="s1">&#39;invalid alternative&#39;</span><span class="p">)</span>

    <span class="n">pvalue</span> <span class="o">=</span> <span class="p">((</span><span class="n">pdf1</span><span class="p">[:,</span> <span class="kc">None</span><span class="p">]</span> <span class="o">*</span> <span class="n">pdf2</span><span class="p">[</span><span class="kc">None</span><span class="p">,</span> <span class="p">:])[</span><span class="n">mask</span><span class="p">])</span><span class="o">.</span><span class="n">sum</span><span class="p">()</span>
    <span class="k">return</span> <span class="n">stat_sample</span><span class="p">,</span> <span class="n">pvalue</span>
</pre></div>

     </div>
</div>
</div>
</div>

</div><div class="jp-Cell jp-CodeCell jp-Notebook-cell   ">
<div class="jp-Cell-inputWrapper">
<div class="jp-InputArea jp-Cell-inputArea">
<div class="jp-CodeMirrorEditor jp-Editor jp-InputArea-editor" data-type="inline">
     <div class="CodeMirror cm-s-jupyter">

<div class=" highlight hl-ipython3"><pre><span></span>
  <span class="c1">#######################################################</span>
  <span class="c1"># Iterate through sites, run E-test for comparing two </span>
  <span class="c1"># Zero Inflated Poisson means.</span>
  <span class="c1">#######################################################</span>

  <span class="c1"># E-test paper: https://userweb.ucs.louisiana.edu/~kxk4695/JSPI-04.pdf</span>
  <span class="c1"># Zero inflated models: https://en.wikipedia.org/wiki/Zero-inflated_model</span>

  <span class="k">for</span> <span class="n">site</span> <span class="ow">in</span> <span class="n">df</span><span class="p">[</span><span class="s2">&quot;SITE&quot;</span><span class="p">]</span><span class="o">.</span><span class="n">unique</span><span class="p">():</span>
    <span class="n">df_site</span> <span class="o">=</span> <span class="n">df</span><span class="p">[</span><span class="n">df</span><span class="p">[</span><span class="s2">&quot;SITE&quot;</span><span class="p">]</span> <span class="o">==</span> <span class="n">site</span><span class="p">]</span>
    
    <span class="n">years</span> <span class="o">=</span> <span class="p">[</span>
        <span class="nb">min</span><span class="p">(</span><span class="n">df_site</span><span class="p">[</span><span class="s2">&quot;YEAR&quot;</span><span class="p">]),</span>
        <span class="nb">max</span><span class="p">(</span><span class="n">df_site</span><span class="p">[</span><span class="s2">&quot;YEAR&quot;</span><span class="p">])]</span>
    
    <span class="k">if</span> <span class="nb">len</span><span class="p">(</span><span class="nb">set</span><span class="p">(</span><span class="n">years</span><span class="p">))</span> <span class="o">&lt;</span> <span class="mi">2</span><span class="p">:</span>
        <span class="nb">print</span><span class="p">(</span><span class="sa">f</span><span class="s2">&quot;No years for site </span><span class="si">{</span><span class="n">site</span><span class="si">}</span><span class="s2">: </span><span class="si">{</span><span class="n">df_site</span><span class="p">[</span><span class="s1">&#39;YEAR&#39;</span><span class="p">]</span><span class="o">.</span><span class="n">unique</span><span class="p">()</span><span class="si">}</span><span class="s2">&quot;</span><span class="p">)</span>
        <span class="k">continue</span>
    <span class="k">else</span><span class="p">:</span>
        <span class="n">min_year</span> <span class="o">=</span> <span class="n">years</span><span class="p">[</span><span class="mi">0</span><span class="p">]</span>
        <span class="n">max_year</span> <span class="o">=</span> <span class="n">years</span><span class="p">[</span><span class="mi">1</span><span class="p">]</span>
        
    <span class="c1"># run comparison between earliest and latest year for site</span>
    <span class="n">df1</span> <span class="o">=</span> <span class="n">df_site</span><span class="p">[</span><span class="n">df_site</span><span class="p">[</span><span class="s2">&quot;YEAR&quot;</span><span class="p">]</span> <span class="o">==</span> <span class="n">min_year</span><span class="p">]</span>
    <span class="n">df2</span> <span class="o">=</span> <span class="n">df_site</span><span class="p">[</span><span class="n">df_site</span><span class="p">[</span><span class="s2">&quot;YEAR&quot;</span><span class="p">]</span> <span class="o">==</span> <span class="n">max_year</span><span class="p">]</span>
    
    <span class="c1"># fit zip model to data</span>
    <span class="n">x1</span> <span class="o">=</span> <span class="n">df1</span><span class="p">[</span><span class="s2">&quot;COUNT&quot;</span><span class="p">]</span>
    <span class="n">model</span> <span class="o">=</span> <span class="n">ZeroInflatedPoisson</span><span class="p">(</span><span class="n">x1</span><span class="p">)</span>
    <span class="n">pi1</span><span class="p">,</span> <span class="n">lambda1</span> <span class="o">=</span> <span class="n">model</span><span class="o">.</span><span class="n">fit</span><span class="p">()</span><span class="o">.</span><span class="n">params</span>

    <span class="c1"># fit zip model to data</span>
    <span class="n">x2</span> <span class="o">=</span> <span class="n">df2</span><span class="p">[</span><span class="s2">&quot;COUNT&quot;</span><span class="p">]</span>
    <span class="n">model</span> <span class="o">=</span> <span class="n">ZeroInflatedPoisson</span><span class="p">(</span><span class="n">x2</span><span class="p">)</span>
    <span class="n">pi2</span><span class="p">,</span> <span class="n">lambda2</span> <span class="o">=</span> <span class="n">model</span><span class="o">.</span><span class="n">fit</span><span class="p">()</span><span class="o">.</span><span class="n">params</span>

    <span class="c1"># run zip E-test</span>
    <span class="n">alpha</span> <span class="o">=</span> <span class="mf">0.05</span>
    <span class="n">alt</span> <span class="o">=</span> <span class="s2">&quot;larger&quot;</span> <span class="c1"># &quot;2-sided&quot;, &quot;smaller&quot;</span>
    <span class="n">etest</span> <span class="o">=</span> <span class="n">etest_zip_2indep</span><span class="p">(</span>
        <span class="n">lambda1</span><span class="o">=</span><span class="n">lambda1</span><span class="p">,</span>
        <span class="n">pi1</span><span class="o">=</span><span class="n">pi1</span><span class="p">,</span>
        <span class="n">n1</span><span class="o">=</span><span class="nb">len</span><span class="p">(</span><span class="n">x1</span><span class="p">),</span>
        <span class="n">sum1</span><span class="o">=</span><span class="nb">sum</span><span class="p">(</span><span class="n">x1</span><span class="p">),</span>
        <span class="n">lambda2</span><span class="o">=</span><span class="n">lambda2</span><span class="p">,</span>
        <span class="n">pi2</span><span class="o">=</span><span class="n">pi2</span><span class="p">,</span>
        <span class="n">n2</span><span class="o">=</span><span class="nb">len</span><span class="p">(</span><span class="n">x2</span><span class="p">),</span>
        <span class="n">sum2</span><span class="o">=</span><span class="nb">sum</span><span class="p">(</span><span class="n">x2</span><span class="p">),</span>
        <span class="n">alternative</span><span class="o">=</span><span class="n">alt</span><span class="p">)</span>
    
    <span class="nb">print</span><span class="p">(</span><span class="s2">&quot;-&quot;</span><span class="o">*</span><span class="mi">25</span><span class="p">)</span>
    <span class="nb">print</span><span class="p">(</span><span class="n">site</span><span class="p">)</span>
    <span class="nb">print</span><span class="p">(</span><span class="sa">f</span><span class="s2">&quot;Min. year (</span><span class="si">{</span><span class="n">min_year</span><span class="si">}</span><span class="s2">) est. lambda: </span><span class="si">{</span><span class="n">np</span><span class="o">.</span><span class="n">round</span><span class="p">(</span><span class="n">lambda1</span><span class="p">,</span> <span class="mi">4</span><span class="p">)</span><span class="si">}</span><span class="s2"> (support=</span><span class="si">{</span><span class="nb">len</span><span class="p">(</span><span class="n">x1</span><span class="p">)</span><span class="si">}</span><span class="s2">)&quot;</span><span class="p">)</span>
    <span class="nb">print</span><span class="p">(</span><span class="sa">f</span><span class="s2">&quot;Max. year (</span><span class="si">{</span><span class="n">max_year</span><span class="si">}</span><span class="s2">) est. lambda: </span><span class="si">{</span><span class="n">np</span><span class="o">.</span><span class="n">round</span><span class="p">(</span><span class="n">lambda2</span><span class="p">,</span> <span class="mi">4</span><span class="p">)</span><span class="si">}</span><span class="s2"> (support=</span><span class="si">{</span><span class="nb">len</span><span class="p">(</span><span class="n">x2</span><span class="p">)</span><span class="si">}</span><span class="s2">)&quot;</span><span class="p">)</span>
    <span class="nb">print</span><span class="p">(</span><span class="sa">f</span><span class="s2">&quot;Modified Poisson Exact Test for ZIP - Reject H0: </span><span class="si">{</span><span class="n">etest</span><span class="p">[</span><span class="mi">1</span><span class="p">]</span> <span class="o">&lt;</span> <span class="n">alpha</span><span class="si">}</span><span class="s2"> (</span><span class="si">{</span><span class="n">np</span><span class="o">.</span><span class="n">round</span><span class="p">(</span><span class="n">etest</span><span class="p">[</span><span class="mi">1</span><span class="p">],</span> <span class="mi">4</span><span class="p">)</span><span class="si">}</span><span class="s2">)&quot;</span><span class="p">)</span>
    <span class="nb">print</span><span class="p">(</span><span class="s2">&quot;-&quot;</span><span class="o">*</span><span class="mi">25</span><span class="p">)</span>

    <span class="n">bins</span> <span class="o">=</span> <span class="mi">30</span>
    <span class="n">hist1</span> <span class="o">=</span> <span class="n">np</span><span class="o">.</span><span class="n">histogram</span><span class="p">(</span><span class="n">x1</span><span class="p">,</span> <span class="n">bins</span><span class="o">=</span><span class="n">bins</span><span class="p">)</span>
    <span class="n">hist2</span> <span class="o">=</span> <span class="n">np</span><span class="o">.</span><span class="n">histogram</span><span class="p">(</span><span class="n">x2</span><span class="p">,</span> <span class="n">bins</span><span class="o">=</span><span class="n">bins</span><span class="p">)</span>
    
    <span class="c1"># plot histograms</span>
    <span class="n">fig</span><span class="p">,</span> <span class="n">ax</span> <span class="o">=</span> <span class="n">plt</span><span class="o">.</span><span class="n">subplots</span><span class="p">(</span><span class="n">figsize</span><span class="o">=</span><span class="p">(</span><span class="mi">8</span><span class="p">,</span><span class="mi">4</span><span class="p">))</span>
    <span class="n">width1</span> <span class="o">=</span> <span class="p">(</span><span class="n">np</span><span class="o">.</span><span class="n">max</span><span class="p">(</span><span class="n">hist1</span><span class="p">[</span><span class="mi">1</span><span class="p">][:</span><span class="o">-</span><span class="mi">1</span><span class="p">])</span> <span class="o">-</span> <span class="n">np</span><span class="o">.</span><span class="n">min</span><span class="p">(</span><span class="n">hist1</span><span class="p">[</span><span class="mi">1</span><span class="p">][:</span><span class="o">-</span><span class="mi">1</span><span class="p">]))</span> <span class="o">/</span> <span class="n">bins</span>
    <span class="n">width2</span> <span class="o">=</span> <span class="p">(</span><span class="n">np</span><span class="o">.</span><span class="n">max</span><span class="p">(</span><span class="n">hist2</span><span class="p">[</span><span class="mi">1</span><span class="p">][:</span><span class="o">-</span><span class="mi">1</span><span class="p">])</span> <span class="o">-</span> <span class="n">np</span><span class="o">.</span><span class="n">min</span><span class="p">(</span><span class="n">hist2</span><span class="p">[</span><span class="mi">1</span><span class="p">][:</span><span class="o">-</span><span class="mi">1</span><span class="p">]))</span> <span class="o">/</span> <span class="n">bins</span>
    <span class="n">ax</span><span class="o">.</span><span class="n">bar</span><span class="p">(</span><span class="n">hist1</span><span class="p">[</span><span class="mi">1</span><span class="p">][:</span><span class="o">-</span><span class="mi">1</span><span class="p">],</span> <span class="n">hist1</span><span class="p">[</span><span class="mi">0</span><span class="p">],</span> <span class="n">width</span><span class="o">=</span><span class="n">width1</span><span class="p">,</span> <span class="n">alpha</span><span class="o">=</span><span class="mf">0.5</span><span class="p">,</span> <span class="n">label</span><span class="o">=</span><span class="n">min_year</span><span class="p">)</span>
    <span class="n">ax</span><span class="o">.</span><span class="n">bar</span><span class="p">(</span><span class="n">hist2</span><span class="p">[</span><span class="mi">1</span><span class="p">][:</span><span class="o">-</span><span class="mi">1</span><span class="p">],</span> <span class="n">hist2</span><span class="p">[</span><span class="mi">0</span><span class="p">],</span> <span class="n">width</span><span class="o">=</span><span class="n">width2</span><span class="p">,</span> <span class="n">alpha</span><span class="o">=</span><span class="mf">0.5</span><span class="p">,</span> <span class="n">label</span><span class="o">=</span><span class="n">max_year</span><span class="p">)</span>
    <span class="n">ax</span><span class="o">.</span><span class="n">legend</span><span class="p">()</span>
    <span class="n">fig</span><span class="o">.</span><span class="n">tight_layout</span><span class="p">()</span>
    <span class="n">plt</span><span class="o">.</span><span class="n">show</span><span class="p">()</span>
    <span class="n">plt</span><span class="o">.</span><span class="n">close</span><span class="p">()</span>
    
</pre></div>

     </div>
</div>
</div>
</div>

<div class="jp-Cell-outputWrapper">


<div class="jp-OutputArea jp-Cell-outputArea">

<div class="jp-OutputArea-child">

    
    <div class="jp-OutputPrompt jp-OutputArea-prompt"></div>


<div class="jp-RenderedText jp-OutputArea-output" data-mime-type="text/plain">
<pre>Optimization terminated successfully.
         Current function value: 6.589366
         Iterations: 33
         Function evaluations: 63
Optimization terminated successfully.
         Current function value: 3.029926
         Iterations: 34
         Function evaluations: 67
-------------------------
Baker North
Min. year (2014) est. lambda: 15.0178 (support=72)
Max. year (2018) est. lambda: 6.0679 (support=106)
Modified Poisson Exact Test for ZIP - Reject H0: True (0.0)
-------------------------
</pre>
</div>
</div>

<div class="jp-OutputArea-child">

    
    <div class="jp-OutputPrompt jp-OutputArea-prompt"></div>




<div class="jp-RenderedImage jp-OutputArea-output ">
<img src="data:image/png;base64,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
"
>
</div>

</div>

<div class="jp-OutputArea-child">

    
    <div class="jp-OutputPrompt jp-OutputArea-prompt"></div>


<div class="jp-RenderedText jp-OutputArea-output" data-mime-type="text/plain">
<pre>Optimization terminated successfully.
         Current function value: 7.912684
         Iterations: 30
         Function evaluations: 60
Optimization terminated successfully.
         Current function value: 2.792870
         Iterations: 36
         Function evaluations: 69
-------------------------
Baker South
Min. year (2014) est. lambda: 14.4416 (support=89)
Max. year (2018) est. lambda: 4.1148 (support=114)
Modified Poisson Exact Test for ZIP - Reject H0: True (0.0)
-------------------------
</pre>
</div>
</div>

<div class="jp-OutputArea-child">

    
    <div class="jp-OutputPrompt jp-OutputArea-prompt"></div>




<div class="jp-RenderedImage jp-OutputArea-output ">
<img src="data:image/png;base64,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
"
>
</div>

</div>

<div class="jp-OutputArea-child">

    
    <div class="jp-OutputPrompt jp-OutputArea-prompt"></div>


<div class="jp-RenderedText jp-OutputArea-output" data-mime-type="text/plain">
<pre>Optimization terminated successfully.
         Current function value: 2.493912
         Iterations: 39
         Function evaluations: 76
Optimization terminated successfully.
         Current function value: 2.399326
         Iterations: 37
         Function evaluations: 71
-------------------------
Calf Island
Min. year (2014) est. lambda: 5.2408 (support=138)
Max. year (2017) est. lambda: 4.5515 (support=96)
Modified Poisson Exact Test for ZIP - Reject H0: False (0.2638)
-------------------------
</pre>
</div>
</div>

<div class="jp-OutputArea-child">

    
    <div class="jp-OutputPrompt jp-OutputArea-prompt"></div>




<div class="jp-RenderedImage jp-OutputArea-output ">
<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAjgAAAEYCAYAAABRMYxdAAAAOXRFWHRTb2Z0d2FyZQBNYXRwbG90bGliIHZlcnNpb24zLjMuNCwgaHR0cHM6Ly9tYXRwbG90bGliLm9yZy8QVMy6AAAACXBIWXMAAAsTAAALEwEAmpwYAAAWm0lEQVR4nO3dfYxd9X3n8fcXbOSGmsU2M8MIB4+TEuJoaRwy4UG1KgcvVdpdYYITAyJlily5fzQrEzbaOo20baMFTLSAQULZeOvsTkmKmSUPtkDp1poYdWvVtH5KkwwQE2uAscbjqQkiZkUx5Lt/zDEx9ozn3rl3mJmf3y8J3XN+5+F+7y8nno/O7zxEZiJJklSSc6a6AEmSpGYz4EiSpOIYcCRJUnEMOJIkqTgGHEmSVJxZ7+WXXXTRRdnR0fFefqUkSSrYnj17/iUzW05tf08DTkdHB7t3734vv1KSJBUsIl4crd0hKkmSVBwDjiRJKo4BR5IkFec9vQZHkiQ17vjx4wwMDPDGG29MdSnvmTlz5rBw4UJmz55d0/oGHEmSZpiBgQHmzp1LR0cHETHV5Uy6zOTo0aMMDAywePHimrZxiEqSpBnmjTfeYMGCBWdFuAGICBYsWFDXGSsDjiRJM9DZEm5OqPf3GnAkSVJxvAZHkqQZ7sHtP23q/r5w/YfGXefll1/m9ttvZ2hoiIhg7dq1rFu3jldeeYWbb76Z/v5+Ojo66OnpYd68eTz33HPccccd7N27l7vvvpsvfvGL79rf22+/TWdnJ5dccglPPvlkw7/BMziSJKlus2bN4v7776evr49du3bxyCOP0NfXx4YNG1ixYgUHDhxgxYoVbNiwAYD58+fz8MMPnxZsTnjooYdYsmRJ8+obb4WIuBx4/KSmDwD/Bfirqr0D6AdWZ+bPm1bZBDSaYGtJrJIkCdrb22lvbwdg7ty5LFmyhEOHDrF161aefvppALq6uli+fDn33Xcfra2ttLa28tRTT522r4GBAZ566im+/OUv88ADDzSlvnHP4GTm85m5NDOXAh8H/h/wXWA90JuZlwG91bwkSTrL9Pf3s2/fPq6++mqGhobeCT4XX3wxQ0ND425/55138tWvfpVzzmnewFK9e1oB/CwzXwRWAt1VezdwY9OqkiRJM8KxY8dYtWoVGzdu5IILLnjXsogY9+6nJ598ktbWVj7+8Y83ta56A84twGPVdFtmDlbTh4G2plUlSZKmvePHj7Nq1Spuu+02brrpJgDa2toYHByJB4ODg7S2tp5xHzt37mTbtm10dHRwyy238IMf/IDPfe5zDddWc8CJiPOAG4D/feqyzEwgx9hubUTsjojdw8PDEy5UkiRNH5nJmjVrWLJkCXfdddc77TfccAPd3SMDPN3d3axcufKM+7n33nsZGBigv7+fLVu2cN111/HNb36z4frquU38d4G9mXliMG0oItozczAi2oEjo22UmZuATQCdnZ2jhiBJkjRxU3GTzM6dO3n00Ue54oorWLp0KQD33HMP69evZ/Xq1WzevJlFixbR09MDwOHDh+ns7OS1117jnHPOYePGjfT19Z02rNUs9QScW/nV8BTANqAL2FB9bm1iXZIkaRpbtmwZIwM4p+vt7T2t7eKLL2ZgYOCM+1y+fDnLly9vRnm1DVFFxPnA9cB3TmreAFwfEQeAf1fNS5IkTbmazuBk5uvAglPajjJyV5UkSdK04pOMJUlScQw4kiSpOAYcSZJUHAOOJEkqTj23iUuSpOlox73N3d8nvzTuKi+//DK33347Q0NDRARr165l3bp1vPLKK9x888309/fT0dFBT08P8+bN47nnnuOOO+5g79693H333e+8Vfz555/n5ptvfme/Bw8e5Ctf+Qp33nlnQz/BMziSJKlus2bN4v7776evr49du3bxyCOP0NfXx4YNG1ixYgUHDhxgxYoVbNgw8hSZ+fPn8/DDD78TbE64/PLL2b9/P/v372fPnj28733v49Of/nTD9RlwJElS3drb27nyyisBmDt3LkuWLOHQoUNs3bqVrq4uALq6uvje974HQGtrK5/4xCeYPXv2mPvs7e3lgx/8IIsWLWq4PgOOJElqSH9/P/v27ePqq69maGiI9vZ2YOTpxUNDQ+Ns/Stbtmzh1ltvbUpNBhxJkjRhx44dY9WqVWzcuPG090pFBBFR037efPNNtm3bxmc/+9mm1GXAkSRJE3L8+HFWrVrFbbfdxk033QRAW1sbg4ODAAwODtLa2lrTvr7//e9z5ZVX0tbW1pTaDDiSJKlumcmaNWtYsmQJd9111zvtN9xwA93d3QB0d3ezcuXKmvb32GOPNW14CrxNXJKkma+G27qbbefOnTz66KNcccUVLF26FIB77rmH9evXs3r1ajZv3syiRYvo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
"
>
</div>

</div>

<div class="jp-OutputArea-child">

    
    <div class="jp-OutputPrompt jp-OutputArea-prompt"></div>


<div class="jp-RenderedText jp-OutputArea-output" data-mime-type="text/plain">
<pre>Optimization terminated successfully.
         Current function value: 2.309742
         Iterations: 37
         Function evaluations: 74
Optimization terminated successfully.
         Current function value: 1.875434
         Iterations: 36
         Function evaluations: 73
-------------------------
Little Brewster
Min. year (2014) est. lambda: 5.8085 (support=96)
Max. year (2017) est. lambda: 2.9593 (support=54)
Modified Poisson Exact Test for ZIP - Reject H0: True (0.0)
-------------------------
</pre>
</div>
</div>

<div class="jp-OutputArea-child">

    
    <div class="jp-OutputPrompt jp-OutputArea-prompt"></div>




<div class="jp-RenderedImage jp-OutputArea-output ">
<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAjgAAAEYCAYAAABRMYxdAAAAOXRFWHRTb2Z0d2FyZQBNYXRwbG90bGliIHZlcnNpb24zLjMuNCwgaHR0cHM6Ly9tYXRwbG90bGliLm9yZy8QVMy6AAAACXBIWXMAAAsTAAALEwEAmpwYAAATUElEQVR4nO3df6xedZ0n8PcHW9PVKRGwLQ0VLus4bk3IVLwKZsim0HHizm4oUgUNDg1h0/1DExjG7NTxj901C1QTtJKQjexivMFZsZkftoF1ZkjFzA5ZnC0/ZtSCU5dUuU251KIBTFgBv/tHH9hKC/e59z7t7f329Uqa55zv+fF8np6c3He+53vOqdZaAAB6csp8FwAAMGoCDgDQHQEHAOiOgAMAdEfAAQC6s+h4ftlb3/rWNjY2djy/EgDo2IMPPvjT1tqyV7cf14AzNjaWXbt2Hc+vBAA6VlU/Plq7S1QAQHcEHACgOwIOANCd4zoGBwCYuxdeeCGTk5N5/vnn57uU42bJkiVZtWpVFi9ePNT6Ag4ALDCTk5NZunRpxsbGUlXzXc4x11rLwYMHMzk5mXPPPXeobVyiAoAF5vnnn88ZZ5xxUoSbJKmqnHHGGTPqsRJwAGABOlnCzctm+nuHukRVVXuTPJvkpSQvttbGq+r0JN9IMpZkb5IrWms/m9G3AwAcAzMZg3Nxa+2nh81vTrKztbalqjYP5v94pNUBANP64r3/NNL9/eEHfmvadZ544olcffXVmZqaSlVl06ZNue666/L000/nyiuvzN69ezM2NpZt27bltNNOy2OPPZZrrrkmDz30UG688cZ86lOf+rX9vfTSSxkfH89ZZ52Vu+++e86/YS6XqNYnmRhMTyS5bM7VAAALwqJFi3LLLbdk9+7deeCBB3Lbbbdl9+7d2bJlS9atW5c9e/Zk3bp12bJlS5Lk9NNPz6233npEsHnZl770paxevXp09Q25XkvyN1XVkny5tXZ7khWttf2D5U8mWXG0DatqU5JNSXL22WfPsdzXN9cEO0xiBQCSlStXZuXKlUmSpUuXZvXq1dm3b1+2b9+e73znO0mSjRs3Zu3atfnc5z6X5cuXZ/ny5bnnnnuO2Nfk5GTuueeefOYzn8kXvvCFkdQ3bMC5qLW2r6qWJ7m3qh47fGFrrQ3CzxEGYej2JBkfHz/qOgDAwrV37948/PDDueCCCzI1NfVK8DnzzDMzNTU17fbXX399Pv/5z+fZZ58dWU1DXaJqre0bfD6V5C+TvC/JVFWtTJLB51MjqwoAWBCee+65bNiwIVu3bs2pp576a8uqatq7n+6+++4sX74873nPe0Za17QBp6reXFVLX55O8ntJvp9kR5KNg9U2Jtk+0soAgBPaCy+8kA0bNuSqq67K5ZdfniRZsWJF9u8/NIJl//79Wb58+evu4/7778+OHTsyNjaWj370o/n2t7+dj3/843OubZgenBVJ/q6q/iHJ3ye5p7X2V0m2JPlAVe1J8ruDeQDgJNBay7XXXpvVq1fnhhtueKX90ksvzcTEoXuQJiYmsn79+tfdz80335zJycns3bs3d911Vy655JJ87Wtfm3N9047Baa09nuS3j9J+MMm6OVcAAMzJfNwkc//99+fOO+/MeeedlzVr1iRJbrrppmzevDlXXHFF7rjjjpxzzjnZtm1bkuTJJ5/M+Ph4nnnmmZxyyinZunVrdu/efcRlrVHxLioAYMYuuuiitHb0e4d27tx5RNuZZ56ZycnJ193n2rVrs3bt2lGU51UNAEB/BBwAoDsCDgDQHQEHAOiOgAMAdEfAAQC64zZxAFjo7rt5tPu7+NPTrvLEE0/k6quvztTUVKoqmzZtynXXXZenn346V155Zfbu3ZuxsbFs27Ytp512Wh577LFcc801eeihh3LjjTe+8lbxH/7wh7nyyitf2e/jjz+ez372s7n++uvn9BP04AAAM7Zo0aLccsst2b17dx544IHcdttt2b17d7Zs2ZJ169Zlz549WbduXbZsOfSig9NPPz233nrrK8HmZe985zvzyCOP5JFHHsmDDz6YN73pTfnQhz405/oEHABgxlauXJnzzz8/SbJ06dKsXr06+/bty/bt27Nx46FXVW7cuDHf/OY3kyTLly/Pe9/73ixevPg197lz5868/e1vzznnnDPn+gQcAGBO9u7dm4cffjgXXHBBpqamsnLlyiSHnl48NTU19H7uuuuufOxjHxtJTQIOADBrzz33XDZs2JCtW7ce8V6pqkpVDbWfX/7yl9mxY0c+8pGPjKQuAQcAmJUXXnghGzZsyFVXXZXLL788SbJixYrs378/SbJ///4sX758qH1961vfyvnnn58VK1aMpDYBBwCYsdZarr322qxevTo33HDDK+2XXnppJiYmkiQT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
"
>
</div>

</div>

<div class="jp-OutputArea-child">

    
    <div class="jp-OutputPrompt jp-OutputArea-prompt"></div>


<div class="jp-RenderedText jp-OutputArea-output" data-mime-type="text/plain">
<pre>Optimization terminated successfully.
         Current function value: 2.522298
         Iterations: 38
         Function evaluations: 75
Optimization terminated successfully.
         Current function value: 3.424512
         Iterations: 38
         Function evaluations: 75
-------------------------
NE Appledore
Min. year (2014) est. lambda: 4.65 (support=150)
Max. year (2018) est. lambda: 7.1346 (support=90)
Modified Poisson Exact Test for ZIP - Reject H0: False (1.0)
-------------------------
</pre>
</div>
</div>

<div class="jp-OutputArea-child">

    
    <div class="jp-OutputPrompt jp-OutputArea-prompt"></div>




<div class="jp-RenderedImage jp-OutputArea-output ">
<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAjgAAAEYCAYAAABRMYxdAAAAOXRFWHRTb2Z0d2FyZQBNYXRwbG90bGliIHZlcnNpb24zLjMuNCwgaHR0cHM6Ly9tYXRwbG90bGliLm9yZy8QVMy6AAAACXBIWXMAAAsTAAALEwEAmpwYAAAVzElEQVR4nO3df5DV9X3v8ecbl1xaSyLgLmwguPTepN1OuEWyCWbidKg0mTS3I15w0Iypex3u0M4kvSjXaUjzR+qdUTFTBZk6dqjEbkwawpjcwOide69Bnd6Si7cr2MasVqyusmRZKMZaYmzBvO8f+1WW37t7Dhz4nOdjxjnnfM73+z3v8/EL58X38/l+v5GZSJIklWRCowuQJEmqNwOOJEkqjgFHkiQVx4AjSZKKY8CRJEnFaWl0AQCXXnppdnR0NLoMSZJ0gXn66af/MTNbj28/LwJOR0cHvb29jS5DkiRdYCLilZO1O0QlSZKKY8CRJEnFMeBIkqTinBdzcCRJ0ugdPnyYgYEB3nrrrUaXcs5MmjSJWbNmMXHixFEtb8CRJOkCMzAwwOTJk+no6CAiGl3OWZeZHDx4kIGBAebMmTOqdRyikiTpAvPWW28xbdq0pgg3ABHBtGnTxnTEyoAjSdIFqFnCzTvG+n0NOJIkqTjOwZEk6QK39rEX6rq9Wz75oTMus2fPHm688UaGhoaICFasWMHKlSt57bXXuO666+jv76ejo4PNmzczZcoUnn/+eW666SZ27tzJ7bffzq233nrM9t5++226urqYOXMmjzzySM3fwSM4kiRpzFpaWrj77rvp6+tjx44d3HffffT19bFmzRoWLVrE7t27WbRoEWvWrAFg6tSprF+//oRg8457772Xzs7O+tVXty2dx2pNtqNJspIkNZP29nba29sBmDx5Mp2dnezdu5ctW7bw5JNPAtDd3c3ChQu56667aGtro62tjUcfffSEbQ0MDPDoo4/y5S9/mXvuuacu9XkER5Ik1aS/v59du3axYMEChoaG3g0+M2bMYGho6Izr33zzzXz1q19lwoT6xRIDjiRJGrdDhw6xdOlS1q1bx3vf+95j3ouIM5799Mgjj9DW1sZHPvKRutZlwJEkSeNy+PBhli5dyg033MCSJUsAmD59OoODgwAMDg7S1tZ22m1s376drVu30tHRwfXXX8/jjz/O5z73uZprM+BIkqQxy0yWL19OZ2cnq1aterf96quvpqenB4Cenh4WL1582u3ceeedDAwM0N/fz6ZNm7jqqqv4xje+UXN9TTHJWJKkkjXiZJjt27fz0EMPMXfuXObNmwfAHXfcwerVq1m2bBkbN27ksssuY/PmzQDs27ePrq4u3njjDSZMmMC6devo6+s7YVirXgw4kiRpzK688koy86Tvbdu27YS2GTNmMDAwcNptLly4kIULF9ajPIeoJElSeQw4kiSpOAYcSZJUHAOOJEkqjgFHkiQVx4AjSZKK42nikiRd6J64s77b+80vnXGRPXv2cOONNzI0NEREsGLFClauXMlrr73GddddR39/Px0dHWzevJkpU6bw/PPPc9NNN7Fz505uv/32Y+4qvnbtWh544AEigrlz5/Lggw8yadKkmr6CR3AkSdKYtbS0cPfdd9PX18eOHTu477776OvrY82aNSxatIjdu3ezaNEi1qxZA8DUqVNZv379McEGYO/evaxfv57e3l6effZZ3n77bTZt2lRzfQYcSZI0Zu3t7cyfPx+AyZMn09nZyd69e9myZQvd3d0AdHd3873vfQ+AtrY2PvrRjzJx4sQTtnXkyBF+9rOfceTIEd58803e//7311yfAUeSJNWkv7+fXbt2sWDBAoaGhmhvbweGr148NDR02nVnzpzJrbfeyuzZs2lvb+d973sfn/rUp2quyYAjSZLG7dChQyxdupR169adcF+piCAiTrv+T37yE7Zs2cLLL7/Mj3/8Y37605/W5WabBhxJkjQuhw8fZunSpdxwww0sWbIEgOnTpzM4OAjA4OAgbW1tp93G97//febMmUNraysTJ05kyZIl/OAHP6i5tjMGnIj4WkTsj4hnR7RNjYjHImJ39Tilao+IWB8RL0bE30XE/JorlCRJ553MZPny5XR2drJq1ap326+++mp6enoA6OnpYfHixafdzuzZs9mxYwdvvvkmmcm2bdvo7Oysub7RnCb+F8CfAl8f0bYa2JaZayJidfX6i8BvAx+s/lsA3F89SpKks2UUp3XX2/bt23nooYeYO3cu8+bNA+COO+5g9erVLFu2jI0bN3LZZZexefNmAPbt20dXVxdvvPEGEyZMYN26dfT19bFgwQKuvfZa5s+fT0tLC5dffjkrVqyoub4zBpzM/KuI6DiueTGwsHreAzzJcMBZDHw9h++fviMi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
"
>
</div>

</div>

<div class="jp-OutputArea-child">

    
    <div class="jp-OutputPrompt jp-OutputArea-prompt"></div>


<div class="jp-RenderedText jp-OutputArea-output" data-mime-type="text/plain">
<pre>Optimization terminated successfully.
         Current function value: 1.655086
         Iterations: 40
         Function evaluations: 79
Optimization terminated successfully.
         Current function value: 1.768946
         Iterations: 39
         Function evaluations: 76
-------------------------
NW Appledore
Min. year (2014) est. lambda: 3.6782 (support=138)
Max. year (2018) est. lambda: 2.5539 (support=72)
Modified Poisson Exact Test for ZIP - Reject H0: False (0.5588)
-------------------------
</pre>
</div>
</div>

<div class="jp-OutputArea-child">

    
    <div class="jp-OutputPrompt jp-OutputArea-prompt"></div>




<div class="jp-RenderedImage jp-OutputArea-output ">
<img src="data:image/png;base64,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
"
>
</div>

</div>

<div class="jp-OutputArea-child">

    
    <div class="jp-OutputPrompt jp-OutputArea-prompt"></div>


<div class="jp-RenderedText jp-OutputArea-output" data-mime-type="text/plain">
<pre>Optimization terminated successfully.
         Current function value: 1.695983
         Iterations: 43
         Function evaluations: 83
Optimization terminated successfully.
         Current function value: 1.640015
         Iterations: 43
         Function evaluations: 86
-------------------------
SW Appledore
Min. year (2014) est. lambda: 2.8785 (support=114)
Max. year (2018) est. lambda: 3.775 (support=70)
Modified Poisson Exact Test for ZIP - Reject H0: False (0.7356)
-------------------------
</pre>
</div>
</div>

<div class="jp-OutputArea-child">

    
    <div class="jp-OutputPrompt jp-OutputArea-prompt"></div>




<div class="jp-RenderedImage jp-OutputArea-output ">
<img src="data:image/png;base64,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
"
>
</div>

</div>

<div class="jp-OutputArea-child">

    
    <div class="jp-OutputPrompt jp-OutputArea-prompt"></div>


<div class="jp-RenderedText jp-OutputArea-output" data-mime-type="text/plain">
<pre>No years for site Hurricane Island: [2017]
No years for site Schoodic: [2017]
Optimization terminated successfully.
         Current function value: 1.395149
         Iterations: 42
         Function evaluations: 80
Optimization terminated successfully.
         Current function value: 1.433056
         Iterations: 37
         Function evaluations: 68
-------------------------
Nubble Lighthouse
Min. year (2014) est. lambda: 3.1971 (support=42)
Max. year (2017) est. lambda: 1.4986 (support=108)
Modified Poisson Exact Test for ZIP - Reject H0: False (0.6212)
-------------------------
</pre>
</div>
</div>

<div class="jp-OutputArea-child">

    
    <div class="jp-OutputPrompt jp-OutputArea-prompt"></div>




<div class="jp-RenderedImage jp-OutputArea-output ">
<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAjgAAAEYCAYAAABRMYxdAAAAOXRFWHRTb2Z0d2FyZQBNYXRwbG90bGliIHZlcnNpb24zLjMuNCwgaHR0cHM6Ly9tYXRwbG90bGliLm9yZy8QVMy6AAAACXBIWXMAAAsTAAALEwEAmpwYAAAT4UlEQVR4nO3dfWxd9XnA8e8TkioFAiQQO17cxFEL1GioQF1CB50CLhNTK0JJm4CgWChT/mm3AK06aP+YVg0I1YCAhKah0tUqHWlEXxKFtWtkgipQw5q3reAAYZkBZ46TJmUUJEagz/7whaV5wdf2da7zu9+PhHzPueee+zhXhC/nnntPZCaSJEklmVTvASRJkmrNwJEkScUxcCRJUnEMHEmSVBwDR5IkFWfysXyyM844I9va2o7lU0qSpIJt3rz5N5k589D1xzRw2tra2LRp07F8SkmSVLCIeOlI632LSpIkFcfAkSRJxTFwJElScY7pOTiSJGnsDhw4QH9/P2+++Wa9Rzlmpk6dSmtrK1OmTKlqewNHkqTjTH9/P9OmTaOtrY2IqPc44y4z2bdvH/39/cybN6+qx/gWlSRJx5k333yT008/vSHiBiAiOP3000d0xMrAkSTpONQocfOukf6+Bo4kSSqO5+BIknScu3f9CzXd382XnzXsNq+88go33HADg4ODRATLli1j+fLl7N+/nyVLltDX10dbWxurV69m+vTpPPfcc9x4441s2bKF22+/na9+9at/sL933nmHjo4OZs+ezbp168b8O3gER5IkjdjkyZO5++676e3tZePGjTzwwAP09vayYsUKOjs72bFjB52dnaxYsQKAGTNmcP/99x8WNu+67777aG9vr918NdvTRLLhzuq3vfS28ZtDkqRCtbS00NLSAsC0adNob29n165drFmzhieeeAKArq4uFixYwF133UVTUxNNTU089thjh+2rv7+fxx57jG984xvcc889NZnPIziSJGlM+vr62Lp1K/Pnz2dwcPC98Jk1axaDg4PDPv6mm27iW9/6FpMm1S5LqtpTRPRFxK8jYltEbKqsmxER6yNiR+Xn9JpNJUmSjguvv/46ixYtYuXKlZxyyil/cF9EDPvpp3Xr1tHU1MTHP/7xms41klS6NDPPy8yOyvKtQE9mngn0VJYlSVKDOHDgAIsWLeK6667j6quvBqC5uZmBgQEA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
"
>
</div>

</div>

<div class="jp-OutputArea-child">

    
    <div class="jp-OutputPrompt jp-OutputArea-prompt"></div>


<div class="jp-RenderedText jp-OutputArea-output" data-mime-type="text/plain">
<pre>Optimization terminated successfully.
         Current function value: 3.967357
         Iterations: 31
         Function evaluations: 61
Optimization terminated successfully.
         Current function value: 2.594140
         Iterations: 34
         Function evaluations: 69
-------------------------
Nahant
Min. year (2015) est. lambda: 7.9459 (support=48)
Max. year (2018) est. lambda: 4.6207 (support=90)
Modified Poisson Exact Test for ZIP - Reject H0: True (0.0)
-------------------------
</pre>
</div>
</div>

<div class="jp-OutputArea-child">

    
    <div class="jp-OutputPrompt jp-OutputArea-prompt"></div>




<div class="jp-RenderedImage jp-OutputArea-output ">
<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAjgAAAEYCAYAAABRMYxdAAAAOXRFWHRTb2Z0d2FyZQBNYXRwbG90bGliIHZlcnNpb24zLjMuNCwgaHR0cHM6Ly9tYXRwbG90bGliLm9yZy8QVMy6AAAACXBIWXMAAAsTAAALEwEAmpwYAAAXwUlEQVR4nO3df2xd5Z3n8feXJJ2gaRBJcIKbNDj9NQTB1lDzS0UVkE2U6VQECIKhbIlQVu5IRUpLmWnoP9OuFhqkpckgoUopASzaKY36K1Xb3SVNg7rQBtaQQIPDFAZSSGqcEED8KiyB7/7hA2NCHF/73mvHj98vyfI5zznn3u/Th5oP59cTmYkkSVJJjhrrAiRJkhrNgCNJkopjwJEkScUx4EiSpOIYcCRJUnEmj+aXHXfccdnW1jaaXylJkgr24IMPPpeZLQe3j2rAaWtro7u7ezS/UpIkFSwi/nSodi9RSZKk4hhwJElScQw4kiSpOKN6D44kSarfm2++ye7du3n99dfHupRRM3XqVObOncuUKVNq2t+AI0nSOLN7926mTZtGW1sbETHW5TRdZrJ//352797N/PnzazrGS1SSJI0zr7/+OjNnzpwQ4QYgIpg5c+awzlgZcCRJGocmSrh5x3D7a8CRJEnF8R4cSZLGuTWb/tjQz/vKok8Muc8zzzzDlVdeSV9fHxFBZ2cnK1eu5Pnnn+eyyy5j165dtLW1sWHDBqZPn85jjz3GVVddxUMPPcT111/Ptdde++5ntbW1MW3aNCZNmsTkyZMb8lJgz+BIkqRhmzx5MjfddBM9PT1s3bqVW265hZ6eHlavXs3ChQt5/PHHWbhwIatXrwZgxowZ3Hzzze8JNgNt2bKF7du3N2zGg3LP4Gz5Vm37nXddc+uQJKlAra2ttLa2AjBt2jQWLFjAnj172LhxI/fccw8Ay5cv59xzz+XGG29k1qxZzJo1i1/+8pejUp9ncCRJUl127drFtm3bOPPMM+nr63s3+Bx//PH09fUNeXxEsHjxYj71qU+xbt26htRU7hkcSZLUdK+88grLli1j7dq1HHPMMe/ZFhE1Pf107733MmfOHPbu3cuiRYs48cQT+cxnPlNXXZ7BkSRJI/Lmm2+ybNkyrrjiCi6++GIAZs+eTW9vLwC9vb3MmjVryM+ZM2cOALNmzeKiiy7igQceqLs2A44kSRq2zGTFihUsWLCAa6655t32Cy64gK6uLgC6urpYunTpYT/n1Vdf5eWXX353+e677+bkk0+uuz4vUUmSNM7V8lh3o913333ceeednHLKKbS3twNwww03sGrVKi699FLWr1/PCSecwIYNGwB49tln6ejo4KWXXuKoo45i7dq19PT08Nxzz3HRRRcBcODAAT7/+c+zZMmSuusz4EiSpGE755xzyMxDbtu8efP72o4//nh27979vvZjjjmGhx9+uOH1eYlKkiQVp+aAExGTImJbRPyiWp8fEfdHxBMR8cOI+EDzypQkSardcM7grAR2Dli/EViTmR8DXgBWNLIwSZKkkaop4ETEXODvgFur9QDOB35U7dIFXNiE+iRJkoat1jM4a4F/At6u1mcCL2bmgWp9NzCnsaVJkiSNzJABJyI+B+zNzAdH8gUR0RkR3RHRvW/fvpF8hCRJ0rDU8pj4p4ELIuKzwFTgGOBfgGMjYnJ1FmcusOdQB2fmOmAdQEdHx6GfJ5MkSSNX6wTTtaphIupnnnmGK6+8kr6+PiKCzs5OVq5cyfPPP89ll13Grl27aGtrY8OGDUyfPp3HHnuMq666ioceeojrr7/+PbOKr1mzhltvvZWI4JRTTuH2229n6tSpdXVhyDM4mXldZs7NzDbg74HfZOYVwBbgkmq35cDGuiqRJEnjxuTJk7npppvo6elh69at3HLLLfT09LB69WoWLlzI448/zsKFC1m9ejUAM2bM4Oabb35PsAHYs2cPN998M93d3ezYsYO33nqLu+66q+766nkPzteAayLiCfrvyVlfdzWSJGlcaG1t5bTTTgNg2rRpLFiwgD179rBx40aWL18OwPLly/nZz34G9M8zdfrppzNlypT3fdaBAwf4y1/+woEDB3jttdf40Ic+VHd9w3qTcWbeA9xTLT8JnFF3BZIkaVzbtWsX27Zt48wzz6Svr4/W1lag/+3FfX19hz12zpw5XHvttcybN4+jjz6axYsXs3jx4rpr8k3GkiRpxF555RWWLVvG2rVrOeaYY96zLSLof7PM4F544QU2btzIU089xZ///GdeffVVvve979VdlwFHkiSNyJtvvsmyZcu44ooruPjiiwGYPXs2vb29APT29jJr1qzDfsavf/1r5s+fT0tLC1OmTOHiiy/md7/7Xd21GXAkSdKwZSYrVqxgwYIFXHPNNe+2X3DBBXR1dQHQ1dXF0qVLD/s58+bNY+vWrbz22mtkJps3b2bBggV11+ds4pIkjXc1PNbdaPfddx933nknp5xyCu3t7QDccMMNrFq1iksvvZT169dzwgknsGHDBgCeffZZOjo6eOmllzjqqKNYu3YtPT09nHnmmVxyySWcdtppTJ48mVNPPZXOzs6664vBpjpvho6Ojuzu7h6dL6v1nQBj8A+FJEn12LlzZ0POcow3h+p3RDyYmR0H7+slKkmSVBwDjiRJKo4BR5KkcWg0bzE5Egy3vwYcSZLGmalTp7J///4JE3Iyk/379w9rfiqfopIkaZyZO3cuu3fvZt++fWNdyqiZOnUqc+fOrXl/A44kSePMlClTmD9//liXcUTzEpUkSSqOAUeSJBXHgCNJkopjwJEkScUx4EiSpOIYcCRJUnEMOJIkqTgGHEmSVBwDjiRJKs6QAScipkbEAxHxcEQ8GhHfrNrviIinImJ79dPe9GolSZJqUMtUDW8A52fmKxExBbg3Iv5nte0fM/NHzStPkiRp+IYMONk/Vekr1eqU6mdiTF8qSZLGpZruwYmISRGxHdgLbMrM+6tN10fEIxGxJiL+apBjOyOiOyK6J9Ksp5IkaezUFHAy863MbAfmAmdExMnAdcCJwOnADOBrgxy7LjM7MrOjpaWlMVVLkiQdxrCeosrMF4EtwJLM7M1+bwC3A2c0oT5JkqRhq+UpqpaIOLZaPhpYBDwWEa1VWwAXAjuaV6YkSVLtanmKqhXoiohJ9AeiDZn5i4j4TUS0AAFsB/6heWVKkiTVrpanqB4BTj1E+/lNqUiSJKlOvslYkiQVx4AjSZKKY8CRJEnFMeBIkqTiGHAkSVJxDDiSJKk4BhxJklQcA44kSSqOAUeSJBXHgCNJkopjwJEkScUx4EiSpOIYcCRJUnEMOJIkqTgGHEmSVBwDjiRJKo4BR5IkFceAI0mSimPAkSRJxRky4ETE1Ih4ICIejohHI+KbVfv8iLg/Ip6IiB9GxAeaX64kSdLQajmD8wZwfmZ+EmgHlkTEWcCNwJrM/BjwArCiaVVKkiQNw5ABJ/u9Uq1OqX4SOB/4UdXeBVzYjAIlSZKGq6Z7cCJiUkRsB/YCm4B/B17MzAPVLruBOYMc2xkR3RHRvW/fvgaULEmSdHg1BZzMfCsz24G5wBnAibV+QWauy8yOzOxoaWkZWZWSJEnDMKynqDLzRWALcDZwbERMrjbNBfY0tjRJkqSRqeUpqpaIOLZaPhpYBOykP+hcUu22HNjYpBolSZKGZfLQu9AKdEXEJPoD0YbM/EVE9AB3RcR/B7YB65tYpyRJUs2GDDiZ+Qhw6iHan6T/fhxJkqQjim8yliRJxTHgSJKk4hhwJElScQw4kiSpOAYcSZJUHAOOJEkqjgFHkiQVx4AjSZKKY8CRJEnFMeBIkqTiGHAkSVJxDDiSJKk4BhxJklQcA44kSSqOAUeSJBXHgCNJkopjwJEkScUx4EiSpOIYcCRJUnGGDDgR8eGI2BIRPRHxaESsrNq/ERF7ImJ79fPZ5pcrSZI0tMk17HMA+GpmPhQR04AHI2JTtW1NZv6P5pUnSZI0fEMGnMzsBXqr5ZcjYicwp9mFSZIkjdSw7sGJiDbgVOD+qunqiHgkIm6LiOmDHNMZEd0R0b1v3776qpUkSapBzQEnIj4I/Bj4cma+BHwH+CjQTv8ZnpsOdVxmrsvMjszsaGlpqb9iSZKkIdQUcCJiCv3h5vuZ+ROAzOzLzLcy823gu8AZzStTkiSpdrU8RRXAemBnZn57QHvrgN0uAnY0vjxJkqThq+Upqk8DXwD+EBHbq7avA5dHRDuQwC7gi02oT5IkadhqeYrqXiAOselXjS9HkiSpfr7JWJIkFceAI0mSimPAkSRJxTHgSJKk4hhwJElScQw4kiSpOAYcSZJUHAOOJEkqjgFHkiQVx4AjSZKKY8CRJEnFMeBIkqTiGHAkSVJxDDiSJKk4BhxJklQcA44kSSqOAUeSJBXHgCNJkopjwJEkScUZMuBExIcjYktE9ETEoxGxsmqfERGbIuLx6vf05pcrSZI0tFrO4BwAvpqZJwFnAV+KiJOAVcDmzPw4sLlalyRJGnNDBpzM7M3Mh6rll4GdwBxgKdBV7dYFXNikGiVJkoZlWPfgREQbcCpwPzA7M3urTc8CsxtbmiRJ0sjUHHAi4oPAj4EvZ+ZLA7dlZgI5yHGdEdEdEd379u2rq1hJkqRa1BRwImIK/eHm+5n5k6q5LyJaq+2twN5DHZuZ6zKzIzM7WlpaGlGzJEnSYdXyFFUA64GdmfntAZt+DiyvlpcDGxtfniRJ0vBNrmGfTwNfAP4QEdurtq8Dq4ENEbEC+BNwaVMqlCRJGqYhA05m3gvEIJsXNrYcSZKk+vkmY0mSVBwDjiRJKo4BR5IkFceAI0mSimPAkSRJxTHgSJKk4hhwJElScQw4kiSpOAYcSZJUHAOOJEkqjgFHkiQVx4AjSZKKY8CRJEnFMeBIkqTiGHAkSVJxDDiSJKk4BhxJklQcA44kSSqOAUeSJBXHgCNJkoozZMCJiNsiYm9E7BjQ9o2I2BMR26ufzza3TEmSpNrVcgbnDmDJIdrXZGZ79fOrxpYlSZI0ckMGnMz8LfD8KNQiSZLUEPXcg3N1RDxSXcKaPthOEdEZEd0R0b1v3746vk6SJKk2Iw043wE+CrQDvcBNg+2YmesysyMzO1paWkb4dZIkSbUbUcDJzL7MfCsz3wa+C5zR2LIkSZJGbkQBJyJaB6xeBOwYbF9JkqTRNnmoHSLiB8C5wHERsRv4Z+DciGgHEtgFfLF5JUqSJA3PkAEnMy8/RPP6JtQiSZLUEL7JWJIkFceAI0mSimPAkSRJxTHgSJKk4hhwJElScQw4kiSpOAYcSZJUHAOOJEkqjgFHkiQVx4AjSZKKY8CRJEnFGXIuquJt+VZt+513XXPrkCRJDeMZHEmSVBwDjiRJKo4BR5IkFceAI0mSimPAkSRJxSnqKao1m/747vJZT+8f9vFnf2RmI8uRJEljxDM4kiSpOEMGnIi4LSL2RsSOAW0zImJTRDxe/Z7e3DIlSZJqV8sZnDuAJQe1rQI2Z+bHgc3VuiRJ0hFhyICTmb8Fnj+oeSnQVS13ARc2tixJkqSRG+lNxrMzs7dafhaYPdiOEdEJdALMmzdvhF93BHBKB0mSxo26bzLOzATyMNvXZWZHZna0tLTU+3WSJElDGmnA6YuIVoDq997GlSRJklSfkQacnwPLq+XlwMbGlCNJklS/Wh4T/wHwe+BvImJ3RKwAVgOLIuJx4D9X65IkSUeEIW8yzszLB9m0sMG1SJIkNYRvMpYkScUx4EiSpOIYcCRJUnEMOJIkqTgGHEmSVBwDjiRJKs5I56JSk6zZ9Me6jv/Kok80qBJJksYvz+BIkqTiGHAkSVJxDDiSJKk4BhxJklQcA44kSSqOAUeSJBXHgCNJkopjwJEkScUx4EiSpOIYcCRJUnGcqqEgZz29jt+vH3q/rfM6B93mVA+SpBJ4BkeSJBWnrjM4EbELeBl4CziQmR2NKEqSJKkejbhEdV5mPteAz5EkSWoIL1FJkqTi1BtwErg7Ih6MiMHvXJUkSRpF9V6iOicz90TELGBTRDyWmb8duEMVfDoB5s2bV+fXHfnWbPpjzfue9fS696yf/ZGZnPX0/vftd7inniRJ0vvVdQYnM/dUv/cCPwXOOMQ+6zKzIzM7Wlpa6vk6SZKkmow44ETEX0fEtHeWgcXAjkYVJkmSNFL1XKKaDfw0It75nH/NzP/VkKokSZLqMOKAk5lPAp9sYC2SJEkN4VQNTXDwzcOH4o3DkiQ1j+/BkSRJxTHgSJKk4hhwJElScQw4kiSpOAYcSZJUHJ+iGuD3T75/moThOPsjMxtUSXMd9imvLQP6cN51zS9GhzScKT8O9pVFn2hgJZI0PnkGR5IkFceAI0mSimPAkSRJxTHgSJKk4niTsd7jPTdaP3ltTccMnHbiK4s+Me5vkK2nfrAPknQk8AyOJEkqjgFHkiQVx4AjSZKKY8CRJEnFMeBIkqTi+BSV6vaeqR+2zOSspw895cXWeZ2HnyaiOr7eKSLqfYKoXs1+gqmm/w1ZVlcNh/7cb9W233nXlfMU1zD6PCafJ42C8fpkrGdwJElScQw4kiSpOHUFnIhYEhH/FhFPRMSqRhUlSZJUjxEHnIiYBNwC/C1wEnB5RJzUqMIkSZJGqp4zOGcAT2Tmk5n5/4C7gKWNKUuSJGnkIjNHdmDEJcCSzPyv1foXgDMz8+qD9usE3pms6G+Afxt5uXU7DnhuDL9/LNjniWGi9Xmi9Rfs80Rhn4fvhMxsObix6Y+JZ+Y6YIjnWkdHRHRnZsdY1zGa7PPEMNH6PNH6C/Z5orDPjVPPJao9wIcHrM+t2iRJksZUPQHn/wIfj4j5EfEB4O+BnzemLEmSpJEb8SWqzDwQEVcD/xuYBNyWmY82rLLmOCIulY0y+zwxTLQ+T7T+gn2eKOxzg4z4JmNJkqQjlW8yliRJxTHgSJKk4kyYgDMRp5WIiF0R8YeI2B4R3WNdTzNExG0RsTcidgxomxERmyLi8er39LGssZEG6e83ImJPNc7bI+KzY1ljo0XEhyNiS0T0RMSjEbGyai95nAfrc7FjHRFTI+KBiHi46vM3q/b5EXF/9bf7h9VDLePeYfp7R0Q8NWCM28e41IaLiEkRsS0iflGtN2WMJ0TAmeDTSpyXme0Fv1fhDmDJQW2rgM2Z+XFgc7Veijt4f38B1lTj3J6ZvxrlmprtAPDVzDwJOAv4UvX/35LHebA+Q7lj/QZwfmZ+EmgHlkTEWcCN9Pf5Y8ALwIqxK7GhBusvwD8OGOPtY1VgE60Edg5Yb8oYT4iAg9NKFCszfws8f1DzUqCrWu4CLhzNmpppkP4WLTN7M/Ohavll+v8wzqHscR6sz8XKfq9Uq1OqnwTOB35UtRczzofpb9EiYi7wd8Ct1XrQpDGeKAFnDvDMgPXdFP7HopLA3RHxYDVlxkQxOzN7q+VngdljWcwouToiHqkuYRVzqeZgEdEGnArczwQZ54P6DAWPdXXpYjuwF9gE/DvwYmYeqHYp6m/3wf3NzHfG+PpqjNdExF+NXYVNsRb4J+Dtan0mTRrjiRJwJqpzMvM0+i/NfSkiPjPWBY227H8PQun/VfQd4KP0n+buBW4a02qaJCI+CPwY+HJmvjRwW6njfIg+Fz3WmflWZrbT/2b8M4ATx7ai5jq4vxFxMnAd/f0+HZgBfG3sKmysiPgcsDczHxyN75soAWdCTiuRmXuq33uBn9L/B2Mi6IuIVoDq994xrqepMrOv+kP5NvBdChzniJhC/7/ov5+ZP6maix7nQ/V5Iow1QGa+CGwBzgaOjYh3Xkpb5N/uAf1dUl2ezMx8A7idssb408AFEbGL/ltFzgf+hSaN8UQJOBNuWomI+OuImPbOMrAY2HH4o4rxc2B5tbwc2DiGtTTdO/+Sr1xEYeNcXaNfD+zMzG8P2FTsOA/W55LHOiJaIuLYavloYBH99x5tAS6pditmnAfp72MDQnvQfy9KMWOcmddl5tzMbKP/38O/ycwraNIYT5g3GVePU67lP6aVuH5sK2quiPgI/WdtoH9Kjn8tsc8R8QPgXOA4oA/4Z+BnwAZgHvAn4NLMLOLG3EH6ey79lywS2AV8ccC9KeNeRJwD/B/gD/zHdfuv039PSqnjPFifL6fQsY6I/0T/DaaT6P+P7w2Z+d+qv2V30X+5ZhvwX6qzG+PaYfr7G6AFCGA78A8DbkYuRkScC1ybmZ9r1hhPmIAjSZImjolyiUqSJE0gBhxJklQcA44kSSqOAUeSJBXHgCNJkopjwJEkScUx4EiSpOL8fwpK2g+mkqi7AAAAAElFTkSuQmCC
"
>
</div>

</div>

<div class="jp-OutputArea-child">

    
    <div class="jp-OutputPrompt jp-OutputArea-prompt"></div>


<div class="jp-RenderedText jp-OutputArea-output" data-mime-type="text/plain">
<pre>Optimization terminated successfully.
         Current function value: 2.405481
         Iterations: 33
         Function evaluations: 67
Optimization terminated successfully.
         Current function value: 2.072086
         Iterations: 37
         Function evaluations: 70
-------------------------
Pemaquid
Min. year (2016) est. lambda: 4.6389 (support=96)
Max. year (2017) est. lambda: 3.1823 (support=90)
Modified Poisson Exact Test for ZIP - Reject H0: True (0.0)
-------------------------
</pre>
</div>
</div>

<div class="jp-OutputArea-child">

    
    <div class="jp-OutputPrompt jp-OutputArea-prompt"></div>




<div class="jp-RenderedImage jp-OutputArea-output ">
<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAjgAAAEYCAYAAABRMYxdAAAAOXRFWHRTb2Z0d2FyZQBNYXRwbG90bGliIHZlcnNpb24zLjMuNCwgaHR0cHM6Ly9tYXRwbG90bGliLm9yZy8QVMy6AAAACXBIWXMAAAsTAAALEwEAmpwYAAAYqUlEQVR4nO3df3Bd5Z3f8fcXbOIN2IsNsq0ijIEmrGmZGI+CoSEpxEvqpDsYMIEwTPCyZrxJw4wJSXdhd2Y3zRTWtCVQOkw2zkJQMyng5peZJHTjOmQYMjFbYwtiZIMJcUAeITsm4ECHgMm3f+jYVYRkXeneK1mP3q+ZO/fcc55zz/fR0ZU/Puc890RmIkmSVJKjxrsASZKkRjPgSJKk4hhwJElScQw4kiSpOAYcSZJUnCljubETTzwx58+fP5ablCRJBXviiSd+lZktA+ePacCZP38+mzdvHstNSpKkgkXELweb7ykqSZJUHAOOJEkqjgFHkiQVZ0yvwZEkSfV766236O7u5o033hjvUsbMtGnTaGtrY+rUqTW1N+BIkjTBdHd3M336dObPn09EjHc5TZeZ7Nu3j+7ubk499dSa1vEUlSRJE8wbb7zBCSecMCnCDUBEcMIJJ4zoiJUBR5KkCWiyhJuDRtrfmgNORBwdEVsj4nvV61Mj4vGIeC4iHoyIY0ZYqyRJUlOM5Bqc1cB2YEb1+jbgjsx8ICL+HlgJfLnB9UmSpGHcseHZhr7fZy9677BtXnzxRa655hp6e3uJCFatWsXq1at5+eWXufLKK9m1axfz589n3bp1zJw5kx07dnDttdeyZcsWbrnlFj7/+c8feq9XXnmF6667jm3bthER3HvvvZx33nl19aGmIzgR0Qb8W+AfqtcBfBj4ZtWkA7ikrkokSdKEMWXKFG6//Xa6urrYtGkTd999N11dXaxZs4YlS5awc+dOlixZwpo1awCYNWsWd9111+8Fm4NWr17N0qVL2bFjB08++SQLFiyov74a290J/AUwvXp9AvBKZh6oXncDJw22YkSsAlYBzJs3b9SF1uSRv6tv/QtvbkwdkiQVrrW1ldbWVgCmT5/OggUL2L17N+vXr+fHP/4xACtWrOCCCy7gtttuY/bs2cyePZvvf//7v/c+r776Ko8++ij33XcfAMcccwzHHFP/VS/DHsGJiD8B9mTmE6PZQGauzcz2zGxvaXnHvbAkSdIEt2vXLrZu3crixYvp7e09FHzmzp1Lb2/vYdf9xS9+QUtLC9deey1nn3021113Ha+//nrdNdVyiuoDwMURsQt4gL5TU/8VOD4iDh4BagN2112NJEmaUF577TWWL1/OnXfeyYwZM35vWUQMO/rpwIEDbNmyhU9/+tNs3bqVY4899tBprXoMG3Ay8+bMbMvM+cAngB9l5tXAI8DlVbMVwPq6q5EkSRPGW2+9xfLly7n66qu57LLLAJgzZw49PT0A9PT0MHv27MO+R1tbG21tbSxevBiAyy+/nC1bttRdWz3fg/OXwI0R8Rx91+TcU3c1kiRpQshMVq5cyYIFC7jxxhsPzb/44ovp6OgAoKOjg2XLlh32febOncvJJ5/MM888A8DGjRs588wz664vMrPuN6lVe3t7bt68uXkb8CJjSdIksH379oaMNKrHY489xgc/+EHOOussjjqq73jJrbfeyuLFi7niiit44YUXOOWUU1i3bh2zZs3ipZdeor29nf3793PUUUdx3HHH0dXVxYwZM+js7OS6667jzTff5LTTTuNrX/saM2fOfMc2B+t3RDyRme0D2xZ3L6qfPr9v1Oued2EDC5EkqWDnn38+Qx0k2bhx4zvmzZ07l+7u7kHbL1y4kEYfAPFWDZIkqTgGHEmSVBwDjiRJKo4BR5IkFceAI0mSimPAkSRJxSlumLgkSZNOvd8DN1AN3wv34osvcs0119Db20tEsGrVKlavXs3LL7/MlVdeya5du5g/fz7r1q1j5syZ7Nixg2uvvZYtW7Zwyy23HLqr+DPPPMOVV1556H2ff/55vvjFL3LDDTfU1QWP4EiSpBGbMmUKt99+O11dXWzatIm7776brq4u1qxZw5IlS9i5cydLliw5dF+pWbNmcddddx0KNgedccYZdHZ20tnZyRNPPMG73/1uLr300rrrM+BIkqQRa21tZdGiRQBMnz6dBQsWsHv3btavX8+KFSsAWLFiBd/97ncBmD17Nu9///uZOnXqkO+5ceNGTj/9dE455ZS66zPgSJKkuuzatYutW7eyePFient7aW1tBfq+vbi3t7fm93nggQe46qqrGlKTAUeSJI3aa6+9xvLly7nzzjuZMWPG7y2LCCKipvd58803eeihh/j4xz/ekLoMOJIkaVTeeustli9fztVXX81ll10GwJw5c+jp6QGg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
"
>
</div>

</div>

<div class="jp-OutputArea-child">

    
    <div class="jp-OutputPrompt jp-OutputArea-prompt"></div>


<div class="jp-RenderedText jp-OutputArea-output" data-mime-type="text/plain">
<pre>Optimization terminated successfully.
         Current function value: 3.156283
         Iterations: 36
         Function evaluations: 67
Optimization terminated successfully.
         Current function value: 3.238856
         Iterations: 34
         Function evaluations: 65
-------------------------
Fort Weatherill
Min. year (2016) est. lambda: 4.0345 (support=90)
Max. year (2018) est. lambda: 4.9896 (support=60)
Modified Poisson Exact Test for ZIP - Reject H0: False (0.9632)
-------------------------
</pre>
</div>
</div>

<div class="jp-OutputArea-child">

    
    <div class="jp-OutputPrompt jp-OutputArea-prompt"></div>




<div class="jp-RenderedImage jp-OutputArea-output ">
<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAjgAAAEYCAYAAABRMYxdAAAAOXRFWHRTb2Z0d2FyZQBNYXRwbG90bGliIHZlcnNpb24zLjMuNCwgaHR0cHM6Ly9tYXRwbG90bGliLm9yZy8QVMy6AAAACXBIWXMAAAsTAAALEwEAmpwYAAAW4UlEQVR4nO3dcZBV5Znn8e+jwDLrYBTSQMcWwY3JYMUNWB3RijWlMlrsTkpcoXBS7NjFYrGbSraYOO4E88+uW6vBPxyIKWuqWFG7TGaUykyClUztjulgOWuCMwg6MS1GRzuxSdMwqDFqjGKe/eMeTIt09+2+99Lw9vdTRd1zzn3Pvc/rW1x+nvOecyIzkSRJKskpE12AJElSsxlwJElScQw4kiSpOAYcSZJUHAOOJEkqjgFHkiQVZ0o9jSLiDOBu4BNAAv8JeBZ4EJgP9AGrMvOVkT7nwx/+cM6fP3/cxUqSJA31xBNP/Etmth29Peq5D05EdAN/n5l3R8Q04F8DXwZezsyNEbEBODMzvzTS53R2duauXbvG1wNJkqSjRMQTmdl59PZRT1FFxIeA3we2AmTm25n5KrAc6K6adQPXNKtYSZKkRtQzB2cBcBC4NyL2RMTdEXEaMCczB6o2+4E5rSpSkiRpLOoJOFOAC4G/yMzFwBvAhqENsnae65jnuiJiXUTsiohdBw8ebLReSZKkUdUzybgf6M/Mx6v1b1ILOIMR0Z6ZAxHRDhw41s6ZuQXYArU5OE2oWZKkSe2dd96hv7+ft956a6JLOW6mT59OR0cHU6dOrav9qAEnM/dHxEsR8fHMfBZYCvRWf7qAjdXr9vGXLUmS6tXf38+MGTOYP38+ETHR5bRcZnLo0CH6+/tZsGBBXfvUdZk48F+Bb1RXUL0ArKF2emtbRKwFfgqsGkfNkiRpjN56661JE24AIoJZs2YxlqkudQWczHwS+MAlWNSO5kiSpONssoSbI8baX+9kLEmSilPvKSpJknSC2vTwT5r6eV+88mOjtnnppZe4/vrrGRwcJCJYt24d69ev5+WXX+a6666jr6+P+fPns23bNs4880z27t3LmjVr2L17N7feeis33XTTe5/16quvcsMNN/D0008TEdxzzz1ccsklDfXBIziSJGnMpkyZwh133EFvby87d+7krrvuore3l40bN7J06VKee+45li5dysaNGwGYOXMmd9555/uCzRHr169n2bJl7N27l6eeeoqFCxc2Xl/Dn3ACaTTB1pNYJUkStLe3097eDsCMGTNYuHAh+/btY/v27TzyyCMAdHV1cdlll3H77bcze/ZsZs+ezXe/+933fc4vfvELHn30Ue677z4Apk2bxrRp0xquzyM4kiSpIX19fezZs4clS5YwODj4XvCZO3cug4ODI+774osv0tbWxpo1a1i8eDE33HADb7zxRsM1GXAkSdK4vf7666xYsYLNmzdz+umnv++9iBj16qfDhw+ze/duPve5z7Fnzx5OO+20905rNcKAI0mSxuWdd95hxYoVrF69mmuvvRaAOXPmMDBQe1TlwMAAs2fPHvEzOjo66OjoYMmSJQCsXLmS3bt3N1ybAUeSJI1ZZrJ27VoWLlzIjTfe+N72q6++mu7ubgC6u7tZvnz5iJ8zd+5czj77bJ599lkAenp6OP/88xuur6hJxpIkTUYTcZHMY489xv33388FF1zAokWLALjtttvYsGEDq1atYuvWrZxzzjls27YNgP3799PZ2clrr73GKaecwubNm+nt7eX000/na1/7GqtXr+btt9/m3HPP5d577224PgOOJEkas0svvZTMYz9Du6en5wPb5s6dS39//zHbL1q0iF27djW1Pk9RSZKk4hhwJElScQw4kiSpOAYcSZJUHAOOJEkqjgFHkiQVx8vEJUk62e34SnM/7/KbR23y0ksvcf311zM4OEhEsG7dOtavX8/LL7/MddddR19fH/Pnz2fbtm2ceeaZ7N27lzVr1rB7925uvfXW9z1VfNOmTdx9991EBBdccAH33nsv06dPb6gLHsGRJEljNmXKFO644w56e3vZuXMnd911F729vWzcuJGlS5fy3HPPsXTp0veeKzVz5kzuvPPO9wUbgH379nHnnXeya9cunn76ad59910eeOCBhusz4EiSpDFrb2/nwgsvBGDGjBksXLiQffv2sX37drq6ugDo6uri29/+NgCzZ8/mU5/6FFOnTv3AZx0+fJhf/epXHD58mDfffJOPfOQjDddnwJEkSQ3p6+tjz549LFmyhMHBQdrb24Ha3YsHBwdH3Pess87ipptuYt68ebS3t/OhD32Iq666quGaDDiSJGncXn/9dVasWMHmzZs5/fTT3/deRBARI+7/yiuvsH37dl588UV+/vOf88Ybb/D1r3+94boM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
"
>
</div>

</div>

</div>

</div>

</div>

</body>


<br/>

## Observations
Visually, we can see that in the plots where null hypothesis is rejected, the orange histograms tend to have a more positive skew than the blue. This indicates the concentration of the frequencies around zero had increased in the later year, which is consistent with the result of the E-Test: that the parameters for the observations fit in the later years are statistically smaller. For sites that reject the null hypothesis, there seems to be a good case that there has been a population decay in the site. 

## Discussion
One thing I noticed while running these experiments, is that certain settings can produce widely different results, and even differences in passing or failing a hypothesis test. I think the takeaway is that you need to have good reasons for your testing approach, and it may be useful to do some ablation studies or analysis in the experiment's parameter bounds. The idea being that rather than having just a single test statistic, you can have a range of statistics, and run an analysis about what happens as you traverse the experiment's parameter space.  
<br/>
Another important thing to mention is that this analysis assumes independence of events. Meaning that the model assumes that the event of one kelp observation is independent from the next. This is probably a little specious. There is certainly room for development on analyzing the competition between organisms, patterns of kelp reproduction, what the ocean floor looks like, and whatever other forces that encourage density or sparsity among kelp. That said, if the model calls all of that a wash and still has predictive power, it could still be a useful model.  
<br/>
For future experiments, I think this analysis would benefit from a modeling approach that dealt with the large outlier frequencies. why do some quadrats have a much higher amount of kelp than the average? There is likely some explanation to be found by investigating the data collection methods, but an interesting approach could be a modification to the Poisson that allows for some of those high counts, maybe a "Tail-Inflated Poisson"?  
<br/>
Thanks for reading &#129305;!  
<br/>
<div style="text-align: center;">
<img src="/assets/images/kelp_stowe.jpg" width=1000>
<figcaption class="footer" style="margin-top: 24px;">Part of my initial interest in working with this dataset was looking at pictures of kelp forests... wow &#129327;. (photo credit: Andrew B. Stowe)</figcaption>
</div>

## Acknowledgements
Gratitude for the people at [KEEN](https://www.kelpecosystems.org/) who have started and maintained their project, and [Austin Rochford](https://austinrochford.com/) for sharing an implementation of a ZIP Likelihood model.

## References

{: .footer}
[1] "Chi-Square Goodness-of-Fit Test" NIST/SEMATECH e-Handbook of Statistical Methods, 2003. [http://www.itl.nist.gov/div898/handbook/](http://www.itl.nist.gov/div898/handbook/){: .footer-link} 

{: .footer}
[2] "MLE for a Poisson Distribution (Step-by-Step)" Statology, 2015. [https://www.statology.org/mle-poisson-distribution/](https://www.statology.org/mle-poisson-distribution/){: .footer-link}

{: .footer}
[3] Hughes, K. et all. "Modeling the spatial distribution of African buffalo (Syncerus caffer) in the Kruger National Park, South Africa". PLOS. September 13, 2017. [https://doi.org/10.1371/journal.pone.0182903](https://doi.org/10.1371/journal.pone.0182903){: .footer-link}

{: .footer}
[4] Liu J. et all. "A Goodness-of-fit Test for Zero-Inflated Poisson Mixed Effects Models in Tree Abundance Studies" National Library of Medicine. November 22, 2019. [https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7061334/#S4](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7061334/#S4){: .footer-link}

{: .footer}
[5] Byrnes J. et all. "Figure 1. Diagram of quadrat orientation on transect tape." KEEN Handbook v0.9.5. Kelp Ecosystem Ecology Network. September 23, 2018. [https://www.kelpecosystems.org/projects/protocols-materials/](https://www.kelpecosystems.org/projects/protocols-materials/){: .footer-link}

{: .footer}
[6] Ancelet, Sophie. (2008). Exploring the bayesian hierarchical approach for the statistical modeling of spatial structures: application in population ecology. 