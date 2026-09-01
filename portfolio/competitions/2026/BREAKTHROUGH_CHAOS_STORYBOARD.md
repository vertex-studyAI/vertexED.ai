# Breakthrough Junior Challenge — Chaos Storyboard

Working title: **How Can Perfect Equations Become Unpredictable?**
Target runtime: 1:42–1:52, leaving margin below the 2:00 cap.

## Scientific claim boundary

The video explains sensitivity to initial conditions in chaotic dynamical systems. It should not imply that every deterministic system is chaotic, that chaos is randomness, or that a butterfly literally causes a particular hurricane.

## Script + visual plan

### 0:00–0:08 — Hook
Voice:
> Imagine I place two dots here. They are almost identical. Then I let both obey exactly the same equation. No randomness. Perfect mathematics.

Visual:
- black field or simple coordinate plane
- two points separated by a barely visible distance
- split-screen labels: `same rule`, `almost same start`

### 0:08–0:18 — Divergence
Voice:
> You might expect them to stay together. Instead, they fly apart. This is chaos.

Visual:
- trajectories initially overlap
- trajectories begin to separate
- freeze frame on large separation

### 0:18–0:34 — Determinism
Voice:
> A chaotic system is deterministic: if we knew its starting state with infinite precision, its future would be fixed. The problem is that we never know anything with infinite precision.

Visual:
- equation drives both trajectories
- zoom repeatedly into one starting coordinate
- measurement digits continue beyond what the instrument can resolve

### 0:34–0:55 — Lyapunov exponent
Voice:
> Suppose two starting measurements differ by a microscopic amount, Delta zero. In many chaotic systems, that separation grows approximately like Delta of t equals Delta zero times e to the lambda t.

Visual:
- show `Δ(t) ≈ Δ₀e^(λt)`
- animate Δ₀ as tiny bracket between starts
- animate e^(λt) expanding
- plot log separation vs time as approximately linear over the relevant regime

### 0:55–1:13 — Positive lambda
Voice:
> Lambda is called a Lyapunov exponent. When it is positive, nearby trajectories separate exponentially. An error of one part in a billion does not stay one part in a billion.

Visual:
- positive lambda highlighted
- numerical toy illustration only if values are mathematically consistent
- avoid suggesting universal rates across systems

### 1:13–1:31 — Chaos is not randomness
Voice:
> That is why chaos is not the same as randomness. The rules can be exact while long-range prediction becomes practically impossible because tiny uncertainty in the present grows into a large uncertainty in the future.

Visual:
- left: dice/random process
- right: deterministic map/trajectory
- labels `random input` vs `deterministic rule + sensitive initial state`

### 1:31–1:44 — Real systems
Voice:
> Weather and turbulent fluids can show this sensitivity, and chaotic behavior appears in many other nonlinear systems.

Visual:
- weather field or fluid-vortex animation
- avoid an overlong laundry list

### 1:44–1:52 — Ending
Voice:
> So the strange part is not that nature lacks rules. It is that exact rules do not always give us an exact practical forecast—because we can never measure the present perfectly.

Visual:
- return to the two initial dots
- zoom out to widely separated trajectories
- final title card

## Build checklist

- [ ] verify every mathematical statement with a physics/math teacher or reliable source
- [ ] render a real chaotic-system example rather than purely decorative divergence
- [ ] captions readable on mobile
- [ ] no copyrighted footage without permission/license
- [ ] music, if any, does not bury narration
- [ ] final spoken runtime <= 1:55
- [ ] export 1080p or better
- [ ] second export with burned-in captions
- [ ] peer review completed after submission

## Optional simulation choices

Best options for clean visuals:
1. logistic map: simple and immediately shows divergence
2. double pendulum: spectacular but harder to explain rigorously in two minutes
3. Lorenz system: iconic and visually strong, but avoid spending time introducing all three equations

Recommended: use the logistic map or Lorenz system as the actual mathematical visual, then use weather only as a real-world consequence/context example.

## Quality gate

A strong final cut should pass all of these:
- a viewer can state the central idea after one viewing
- the equation is explained rather than merely displayed
- chaos is distinguished from randomness
- one scientifically valid visualization does real explanatory work
- the final line resolves the opening paradox
- there is no unsupported claim about a specific real-world event
