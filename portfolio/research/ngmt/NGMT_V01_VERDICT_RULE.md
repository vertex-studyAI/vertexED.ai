# NGMT v0.1 Verdict Arithmetic

**Committed before implementation or execution.**

For each training seed `s`, define:

`A_arm(s) = mean(MSE_arm(s,c))`

across exactly these five adverse conditions:

`student_t`, `two_mode`, `regime_switch`, `outlier_bursts`, `nonstationary_mixture`.

Then define paired seed-level effects:

- `R_B3_B2(s) = (A_B2(s) - A_B3(s)) / A_B2(s)`;
- `R_B3_B1(s) = (A_B1(s) - A_B3(s)) / A_B1(s)`;
- `G_clean(s) = (MSE_B3(s,gaussian_clean) - MSE_B2(s,gaussian_clean)) / MSE_B2(s,gaussian_clean)`.

The frozen gate uses arithmetic means over exactly the three training seeds `[11,23,37]`:

- `mean_s R_B3_B2(s) >= 0.05`;
- `mean_s R_B3_B1(s) >= 0.03`;
- `mean_s G_clean(s) <= 0.02`;
- no B3 run divergent/failed;
- trainable parameter counts exactly equal across B0–B3;
- B1–B3 runtime memory capacity exactly `18` scalar state values per sequence.

No weighting by condition, seed, sample variance, favorable subset or post-result metric is allowed.

The aggregate report must also retain sample SD and `n=3` for the three seed-level paired effects. With `n=3`, no statistical-significance claim is permitted.
