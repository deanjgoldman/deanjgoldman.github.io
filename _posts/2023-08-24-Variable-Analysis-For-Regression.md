---
layout: post_notebook
title: Variable Analysis for Improving a Regression Model
author: Dean Goldman
subtext: I take a look at a textbook dataset of NFL statistics, and produce an analysis of variables that argue for feature transformation that provides a better suit to the stated problem than the original variables.
---

The Table B1 dataset published in Introduction to Linear Regression Analysis, Montgomery, D.C., Peck, E.A., and Vining, C.G. (2001) has 28 observations on National Football League 1976 Team Performance. These observations include statistics of the number of games won, rushing yards, passing yards, opponent's rushing yards, opponent's passing yards, punting, field goals, turnovers, and penalties. The stated problem is to predict the number of games won in a 14 game season, using some set of the given variables. A conventional approach may be to compare coefficients for each variable, and perhaps use some criterion for variable selection. One of the issues with this strategy is that it overlooks some of the zero-sum game dynamics that make up what football is. More rushing and passing yards might not reliably predict more games won _if_ it coincides with a relatively higher number of yards made by opposing teams. Likewise, a low number of offensive yards could be associated with a high number of wins, if that team happened to keep their opponents yardage sufficiently low.   

# References
