# Two follow-on experiment contracts

These are **contracts, not repositories**. Do not create implementation projects until the cheap falsifier can be run.

## Contract A — 3D-printer dimensional error-field calibration

**Question.** Can a simple per-axis + low-order spatial correction learned from calibration coupons reduce held-out dimensional error more than a global scale correction?

**Cheap falsifier.** Print a small fixed set of coupons covering X/Y position and two feature sizes. Measure dimensions with calipers (preferred) or a fixed-camera setup. Fit on 70% of coupons; evaluate on held-out coupons.

**Baselines.** (1) no correction; (2) one global scale factor; (3) independent X/Y scale factors.

**Candidate method.** Independent X/Y scale plus a regularized quadratic position-error field. No neural network.

**Primary metric.** Median absolute dimensional error in millimetres on held-out features.

**Pass rule.** Candidate reduces held-out median absolute error by >=30% versus the best baseline on two independent print batches, without worsening the 90th-percentile error by >10%.

**Stop rule.** If the best baseline is statistically indistinguishable from the candidate across two batches, archive the method; do not add ML complexity.

**Cost / compute.** Laptop/M4 trivial. Requires access to a printer, inexpensive filament, and preferably digital calipers. No GPU/API required.

**Evidence package.** Raw measurement CSV, printer/material/settings, train/test split seed, fitting code, plots, failure photos, exact metric table.

**Main confounds.** Thermal drift, filament, slicer settings, caliper error, bed leveling, geometry-dependent shrinkage.

## Contract B — acoustic micro-fault screening for small fans/motors

**Question.** Can cheap spectral features detect mild repeatable fan/motor anomalies better than an RMS-loudness heuristic under device-held-out evaluation?

**Cheap falsifier.** Record short audio clips from multiple safe low-voltage fans or motors under healthy operation and non-destructive controlled conditions (for example, different mounting/load states). Do not intentionally damage hardware.

**Baselines.** (1) RMS amplitude threshold; (2) dominant-frequency + harmonic-ratio nearest-centroid classifier.

**Candidate method.** Fixed log-power spectral bands + regularized logistic regression. No deep model.

**Primary metric.** Balanced accuracy on a leave-one-device-out split.

**Pass rule.** Candidate exceeds the stronger baseline by >=15 percentage points balanced accuracy and stays above 0.75 on every held-out device.

**Stop rule.** If performance collapses under leave-one-device-out evaluation, classify the signal as device-specific and stop before model scaling.

**Cost / compute.** Phone/laptop microphone and CPU only; optional inexpensive USB mic. M4 runtime should be minutes.

**Evidence package.** Audio manifest, device IDs, recording protocol, preprocessing hashes, split manifest, confusion matrices, per-device metrics, runtime.

**Main confounds.** Microphone position, room acoustics, RPM changes, automatic gain control, device identity leakage.
