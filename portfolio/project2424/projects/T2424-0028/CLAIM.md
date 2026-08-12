# Claim — T2424-0028 Residual Event Tokenization

## Falsifiable minimum claim

For every encoding produced by this implementation on the frozen deterministic fixtures, every non-token observation must reconstruct with absolute error **strictly below the configured residual threshold**, while emitted token positions reconstruct exactly.

On the clean linear-trend control with threshold `0.2`, the linear predictor must emit exactly two events and must use fewer than one tenth as many events as the zero-order-hold predictor.

Failure of either invariant falsifies the minimum implementation claim.

## What a pass supports

A pass supports only that the causal residual-triggered codec and deterministic decoder implement their declared error-bound mechanics on controlled scalar series.

## What a pass does not support

It does not establish state-of-the-art compression, byte-level rate–distortion superiority, external-dataset generalization, learned representation quality, publication novelty, production readiness, or Project 2424 certification.
