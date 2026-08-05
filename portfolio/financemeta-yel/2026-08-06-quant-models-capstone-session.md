# FinanceMeta x YEL — Quant Models and Capstone Launch

**Date:** 6 August 2026  
**Time:** 19:00–19:45 IST  
**Format:** Live, discussion-first, no slides required  
**Outcome:** Students should leave able to connect a financial question to a model, explain the model's assumptions, and define a small reproducible capstone.

## Session structure

### 0:00–0:05 — Fast recap

Ask three questions:

1. What makes a time series different from ordinary tabular data?
2. Why does correlation not prove a trading relationship?
3. What must be recorded before a result can be called reproducible?

Use the answers to reinforce ordering, leakage prevention, and honest evaluation.

### 0:05–0:12 — The modeling map

Frame quantitative finance as five linked jobs:

1. **Describe:** returns, volatility, drawdowns, correlations.
2. **Forecast:** expected return, volatility, rates, or regimes.
3. **Price:** value an asset under explicit assumptions.
4. **Allocate:** choose exposures under risk constraints.
5. **Test:** compare the model against a baseline without leakage.

The key rule is: choose the smallest model that can answer the question.

### 0:12–0:27 — Ten models in one connected story

#### 1. Simple and log returns

\[
R_t = \frac{P_t-P_{t-1}}{P_{t-1}}, \qquad
r_t = \ln\left(\frac{P_t}{P_{t-1}}\right)
\]

Use simple returns for intuitive percentage change and log returns when adding returns across time.

#### 2. Moving averages

\[
MA_t^{(n)} = \frac{1}{n}\sum_{i=0}^{n-1} P_{t-i}
\]

A smoothing tool and baseline signal, not proof of predictability.

#### 3. Linear factor model / CAPM

\[
R_i-R_f = \alpha_i + \beta_i(R_m-R_f)+\varepsilon_i
\]

Separates market exposure from unexplained residual performance. Discuss why a positive historical alpha may disappear out of sample.

#### 4. Mean–variance portfolio optimization

\[
\min_w \; w^\top \Sigma w
\quad \text{subject to} \quad
w^\top \mu \ge \mu^\*, \quad \mathbf{1}^\top w=1
\]

Shows the tradeoff between expected return and covariance-driven risk. Emphasize estimation error.

#### 5. Sharpe ratio

\[
S = \frac{\mathbb{E}[R_p-R_f]}{\sigma_p}
\]

A risk-adjusted summary, not a complete measure of downside or tail risk.

#### 6. AR(1)

\[
x_t = c + \phi x_{t-1}+\varepsilon_t
\]

A basic model for persistence and mean reversion. If \(|\phi|<1\), shocks decay over time.

#### 7. GARCH(1,1)

\[
\sigma_t^2 = \omega+\alpha\varepsilon_{t-1}^2+\beta\sigma_{t-1}^2
\]

Models volatility clustering: large moves tend to be followed by large moves, even when direction is unpredictable.

#### 8. Geometric Brownian motion

\[
dS_t = \mu S_t\,dt+\sigma S_t\,dW_t
\]

A continuous-time price model behind classical option pricing. Explain that constant volatility and log-normal returns are simplifying assumptions.

#### 9. Black–Scholes

\[
C=S_0N(d_1)-Ke^{-rT}N(d_2)
\]

Connect price, strike, time, rate, and volatility. The model is useful because its assumptions are explicit, not because markets perfectly satisfy them.

#### 10. Heath–Jarrow–Morton framework

\[
df(t,T)=\alpha(t,T)\,dt+\sigma(t,T)\,dW_t
\]

Models the full forward-rate curve. Under no-arbitrage, the drift is constrained by the volatility structure. Use HJM to show how a framework can model an entire curve rather than one scalar rate.

### 0:27–0:34 — Model selection exercise

Give students four questions and ask which model is the best starting point:

1. Does volatility cluster after market shocks?  
   **Start:** GARCH against rolling-volatility and constant-volatility baselines.

2. Is a stock's excess return mostly explained by the market?  
   **Start:** CAPM/factor regression with rolling out-of-sample evaluation.

3. How should a small ETF portfolio balance risk and return?  
   **Start:** equal weight baseline, then constrained mean–variance optimization.

4. How does a change in the yield curve affect bond or rate exposure?  
   **Start:** yield-curve descriptive analysis, then a simplified short-rate or HJM-style model.

Require every answer to state the target, inputs, assumptions, baseline, and failure condition.

### 0:34–0:42 — Capstone launch

Each team completes this contract:

**Question**  
One precise, falsifiable financial question.

**Dataset**  
Source, assets, frequency, date range, missing-data policy, and licensing constraints.

**Baseline**  
A naive strategy or model that the proposed method must beat.

**Method**  
One primary model and at most one meaningful extension.

**Evaluation**  
Walk-forward or time-based split; no random shuffling for ordered market data.

**Metrics**  
Choose task-appropriate metrics such as MAE/RMSE for forecasts, log loss for probabilities, and Sharpe/max drawdown/turnover for strategies.

**Costs and constraints**  
Include transaction costs, slippage assumptions, liquidity filters, and position limits where relevant.

**Reproducibility**  
Fixed environment, deterministic seeds where possible, versioned data manifest, one command to rerun, and saved outputs.

**Truth boundary**  
Separate observed facts, modeling assumptions, results, and interpretation. No personalized financial advice.

### 0:42–0:45 — Exit ticket

Every student submits three lines:

1. My capstone question is…
2. My baseline is…
3. My model would be considered unsuccessful if…

## Recommended capstone options

### A. Volatility forecasting

Compare rolling standard deviation, EWMA, and GARCH on one liquid index or ETF. Evaluate one-day-ahead volatility forecasts with a walk-forward split.

### B. Factor stability

Estimate rolling market beta and test whether beta changes materially across calm and stressed periods. Keep conclusions descriptive unless prediction is rigorously evaluated.

### C. Portfolio robustness

Compare equal weighting, minimum variance, and constrained mean–variance portfolios. Stress-test covariance estimation and report turnover and drawdown.

### D. Yield-curve dynamics

Use public government yield data to analyze level, slope, and curvature. Build a simple principal-component baseline before attempting a richer rate model.

### E. Signal decay

Test whether a moving-average or momentum signal survives costs, delayed execution, and multiple time periods. The main result may honestly be that the signal does not survive.

## Homework due next session

Submit a one-page capstone specification containing the nine contract fields above, plus a repository skeleton:

```text
project/
  README.md
  data/README.md
  src/
  tests/
  configs/
  outputs/
  requirements.txt
```

The README must include one command for setup, one command for the baseline, and one command for the full experiment.
