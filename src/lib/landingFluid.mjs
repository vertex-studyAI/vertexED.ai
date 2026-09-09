/** Decorative 2D dye field: semi-Lagrangian advection and pressure projection.
 * Bounded CPU grid, not a scientific solver. No external source is vendored. */
export function createFluid(width = 96, height = 64) {
  const w = Math.min(128, Math.max(16, Math.round(Number(width) || 96)));
  const h = Math.min(96, Math.max(16, Math.round(Number(height) || 64)));
  const fields = Array.from({ length: 10 }, () => new Float32Array(w * h));
  let [u, v, dye, nextU, nextV, nextDye, pressure, nextPressure, divergence, curl] = fields;
  const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
  const at = (x, y) => clamp(y, 0, h - 1) * w + clamp(x, 0, w - 1);
  const sample = (field, x, y) => {
    x = clamp(x, 0, w - 1); y = clamp(y, 0, h - 1);
    const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
    return (field[at(ix, iy)] * (1 - fx) + field[at(ix + 1, iy)] * fx) * (1 - fy)
      + (field[at(ix, iy + 1)] * (1 - fx) + field[at(ix + 1, iy + 1)] * fx) * fy;
  };
  return {
    width: w, height: h,
    get dye() { return dye; },
    clear() { fields.forEach(field => field.fill(0)); },
    splat(x, y, dx, dy) {
      if (![x, y, dx, dy].every(Number.isFinite)) return;
      const px = clamp(x, 0, 1) * (w - 1), py = clamp(y, 0, 1) * (h - 1);
      for (let j = Math.max(1, Math.floor(py - 5)); j < Math.min(h - 1, py + 5); j++) {
        for (let i = Math.max(1, Math.floor(px - 5)); i < Math.min(w - 1, px + 5); i++) {
          const k = at(i, j), falloff = Math.exp(-((i - px) ** 2 + (j - py) ** 2) / 5);
          u[k] = clamp(u[k] + dx * w * falloff * 2, -60, 60);
          v[k] = clamp(v[k] + dy * h * falloff * 2, -60, 60);
          dye[k] = Math.min(1.5, dye[k] + falloff * .7);
        }
      }
    },
    step(seconds) {
      const dt = clamp(Number(seconds) || 0, 0, .05);
      if (!dt) return;
      const drag = Math.exp(-dt * 1.8), fade = Math.exp(-dt * 1.25);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const k = at(x, y), px = x - u[k] * dt, py = y - v[k] * dt;
        nextU[k] = sample(u, px, py) * drag; nextV[k] = sample(v, px, py) * drag;
      }
      [u, nextU] = [nextU, u]; [v, nextV] = [nextV, v]; pressure.fill(0);
      // Restore small curls lost to advection; bounded force keeps fast input stable.
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        curl[at(x, y)] = .5 * (v[at(x + 1, y)] - v[at(x - 1, y)] - u[at(x, y + 1)] + u[at(x, y - 1)]);
      }
      for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
        const k = at(x, y);
        const gx = Math.abs(curl[at(x + 1, y)]) - Math.abs(curl[at(x - 1, y)]);
        const gy = Math.abs(curl[at(x, y + 1)]) - Math.abs(curl[at(x, y - 1)]);
        const length = Math.hypot(gx, gy) + .0001;
        u[k] = clamp(u[k] + gy / length * curl[k] * dt * 6, -60, 60);
        v[k] = clamp(v[k] - gx / length * curl[k] * dt * 6, -60, 60);
      }
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        divergence[at(x, y)] = -.5 * (u[at(x + 1, y)] - u[at(x - 1, y)] + v[at(x, y + 1)] - v[at(x, y - 1)]);
      }
      for (let pass = 0; pass < 8; pass++) {
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
          nextPressure[at(x, y)] = (divergence[at(x, y)] + pressure[at(x - 1, y)] + pressure[at(x + 1, y)] + pressure[at(x, y - 1)] + pressure[at(x, y + 1)]) * .25;
        }
        [pressure, nextPressure] = [nextPressure, pressure];
      }
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const k = at(x, y);
        u[k] -= .5 * (pressure[at(x + 1, y)] - pressure[at(x - 1, y)]);
        v[k] -= .5 * (pressure[at(x, y + 1)] - pressure[at(x, y - 1)]);
        if (x === 0 || x === w - 1) u[k] = 0;
        if (y === 0 || y === h - 1) v[k] = 0;
        nextDye[k] = sample(dye, x - u[k] * dt, y - v[k] * dt) * fade;
      }
      [dye, nextDye] = [nextDye, dye];
    },
  };
}
