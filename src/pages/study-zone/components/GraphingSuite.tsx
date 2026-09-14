import React, { useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { evaluateExpression } from './calculatorCore.mjs';

type GraphMode = 'calculator' | 'threeD';

interface GraphingSuiteProps {
  accent: string;
}

const WIDTH = 720;
const HEIGHT = 460;
const PRESETS = ['x^2', 'sin(x)', '2*x+1', 'sqrt(abs(x))'];

function normalizeFunction(raw: string) {
  return raw
    .trim()
    .replace(/^\s*(?:y|f\s*\(\s*x\s*\))\s*=\s*/i, '')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/[−–—]/g, '-')
    .replace(/÷/g, '/')
    .replace(/×/g, '*');
}

function plotFunction(expression: string, range: number) {
  const normalized = normalizeFunction(expression);
  if (!normalized) throw new Error('Enter a function of x.');
  const xToPixel = (x: number) => ((x + range) / (range * 2)) * WIDTH;
  const yToPixel = (y: number) => HEIGHT - ((y + range) / (range * 2)) * HEIGHT;
  const segments: string[] = [];
  let drawing = false;
  for (let index = 0; index <= 480; index += 1) {
    const x = -range + (index / 480) * range * 2;
    let y: number;
    try {
      y = evaluateExpression(normalized, { x });
    } catch {
      drawing = false;
      continue;
    }
    if (!Number.isFinite(y) || Math.abs(y) > range * 4) {
      drawing = false;
      continue;
    }
    segments.push(`${drawing ? 'L' : 'M'}${xToPixel(x).toFixed(2)},${yToPixel(y).toFixed(2)}`);
    drawing = true;
  }
  if (!segments.length) throw new Error('That function has no visible values in this window.');
  const samples = [-range, -range / 2, 0, range / 2, range].map((x) => {
    try { return { x, y: evaluateExpression(normalized, { x }) }; } catch { return { x, y: null }; }
  });
  return { path: segments.join(' '), normalized, samples };
}

const GraphingSuite: React.FC<GraphingSuiteProps> = () => {
  const { user } = useAuth();
  return <AccountGraph key={user?.id ?? 'signed-out'} />;
};

function AccountGraph() {
  const [mode, setMode] = useState<GraphMode>('calculator');
  const [draft, setDraft] = useState('x^2');
  const [expression, setExpression] = useState('x^2');
  const [range, setRange] = useState(10);
  const plot = useMemo(() => {
    try { return { value: plotFunction(expression, range), error: '' }; }
    catch (error) { return { value: null, error: error instanceof Error ? error.message : 'Could not plot this function.' }; }
  }, [expression, range]);
  const threeDSrc = 'https://www.desmos.com/3d?embed';

  return (
    <div className="zone-stack">
      <div className="zone-pill-group">
        <button type="button" className="zone-pill" data-active={mode === 'calculator'} aria-pressed={mode === 'calculator'} onClick={() => setMode('calculator')}>2D graphing</button>
        <button type="button" className="zone-pill" data-active={mode === 'threeD'} aria-pressed={mode === 'threeD'} onClick={() => setMode('threeD')}>3D graphing</button>
      </div>

      {mode === 'calculator' ? (
        <>
          <form className="zone-graph-form" onSubmit={(event) => { event.preventDefault(); setExpression(draft); }}>
            <label>Function of x<input className="neu-input-el mt-2" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="y = x^2" maxLength={256} autoCapitalize="off" autoCorrect="off" spellCheck={false} /></label>
            <label>Window<select className="neu-input-el mt-2" value={range} onChange={(event) => setRange(Number(event.target.value))}><option value="5">-5 to 5</option><option value="10">-10 to 10</option><option value="20">-20 to 20</option></select></label>
            <button type="submit" className="btn-solid" disabled={!draft.trim()}>Plot</button>
          </form>
          <div className="zone-graph-presets" role="group" aria-label="Example functions">
            {PRESETS.map((preset) => <button key={preset} type="button" onClick={() => { setDraft(preset); setExpression(preset); }}>{preset}</button>)}
          </div>
          <div className="zone-graph-frame zone-graph-local">
            {plot.value ? (
              <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-labelledby="local-graph-title local-graph-description">
                <title id="local-graph-title">Graph of {plot.value.normalized}</title>
                <desc id="local-graph-description">A two-dimensional coordinate plot from negative {range} to positive {range} on both axes. Sample values follow the graph.</desc>
                <defs><pattern id="graph-grid" width={WIDTH / (range * 2)} height={HEIGHT / (range * 2)} patternUnits="userSpaceOnUse"><path d={`M ${WIDTH / (range * 2)} 0 L 0 0 0 ${HEIGHT / (range * 2)}`} fill="none" stroke="currentColor" strokeOpacity=".11" strokeWidth="1" /></pattern></defs>
                <rect width={WIDTH} height={HEIGHT} fill="url(#graph-grid)" />
                <line x1={WIDTH / 2} x2={WIDTH / 2} y1="0" y2={HEIGHT} className="zone-graph-axis" />
                <line x1="0" x2={WIDTH} y1={HEIGHT / 2} y2={HEIGHT / 2} className="zone-graph-axis" />
                <path d={plot.value.path} className="zone-graph-path" />
                <text x={WIDTH - 26} y={HEIGHT / 2 - 10}>x</text><text x={WIDTH / 2 + 10} y="20">y</text>
              </svg>
            ) : <div role="alert" className="zone-graph-error"><strong>Could not plot that function.</strong><span>{plot.error}</span></div>}
          </div>
          {plot.value && <details className="zone-graph-values"><summary>Read sample values</summary><table><thead><tr><th scope="col">x</th><th scope="col">y</th></tr></thead><tbody>{plot.value.samples.map((sample) => <tr key={sample.x}><td>{Number(sample.x.toFixed(2))}</td><td>{sample.y === null || !Number.isFinite(sample.y) ? 'Undefined' : Number(sample.y.toFixed(4))}</td></tr>)}</tbody></table></details>}
          <p className="zone-subtle text-[13px] m-0">This first-party plotter works offline and does not save expressions. Use explicit multiplication, such as 2*x, and functions such as sin(x), sqrt(x), abs(x), ln(x), and log(x).</p>
        </>
      ) : (
        <>
          <div className="zone-graph-frame"><iframe title="Desmos 3D Graphing" src={threeDSrc} allowFullScreen loading="lazy" /></div>
          <p className="zone-subtle text-[13px] m-0">3D graphs are temporary. If the embed is unavailable, <a href="https://www.desmos.com/3d" target="_blank" rel="noopener noreferrer" className="underline">open Desmos separately</a>.</p>
        </>
      )}
    </div>
  );
}

export default GraphingSuite;
