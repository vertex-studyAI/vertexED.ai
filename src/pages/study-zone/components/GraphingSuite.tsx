import React, { useEffect, useRef, useState } from "react";
import { useAuth } from '@/contexts/AuthContext';
import { loadDesmos, type DesmosCalculator } from '@/lib/desmos';

type GraphMode = "calculator" | "threeD";

interface GraphingSuiteProps {
	accent: string;
}

const GraphingSuite: React.FC<GraphingSuiteProps> = () => {
  const { user } = useAuth();
  return <AccountGraph key={user?.id ?? 'signed-out'} />;
};

function AccountGraph() {
	const [mode, setMode] = useState<GraphMode>("calculator");
  const [status, setStatus] = useState<'loading' | 'ready' | 'fallback'>('loading');
  const [expression, setExpression] = useState('');
  const [attempt, setAttempt] = useState(0);
  const mount = useRef<HTMLDivElement>(null);
  const calculator = useRef<DesmosCalculator | null>(null);
  const key = import.meta.env.VITE_DESMOS_API_KEY as string | undefined;
  const useApi = mode === 'calculator' && Boolean(key);
  useEffect(() => {
    if (!useApi || !key || !mount.current) return;
    let cancelled = false;
    setStatus('loading');
    void loadDesmos(key).then(api => {
      if (cancelled || !mount.current) return;
      calculator.current = api.GraphingCalculator(mount.current, { capExpressionSize: true, expressions: true, autosize: true });
      setStatus('ready');
    }).catch(() => { if (!cancelled) setStatus('fallback'); });
    return () => { cancelled = true; calculator.current?.destroy(); calculator.current = null; };
  }, [useApi, key, attempt]);

	const src = mode === "calculator" ? "https://www.desmos.com/calculator?embed" : "https://www.desmos.com/3d?embed";
	const title = mode === "calculator" ? "Desmos Graphing Calculator" : "Desmos 3D Graphing";

	return (
		<div className="zone-stack">
			<div className="zone-pill-group">
				<button
					type="button"
					className="zone-pill"
					data-active={mode === "calculator"}
					aria-pressed={mode === "calculator"}
					onClick={() => setMode("calculator")}
				>
					Graphing Calculator
				</button>
				<button
					type="button"
					className="zone-pill"
					data-active={mode === "threeD"}
					aria-pressed={mode === "threeD"}
					onClick={() => setMode("threeD")}
				>
					3D Graphing
				</button>
			</div>

      {useApi && <form className="flex flex-wrap items-end gap-3" onSubmit={event => { event.preventDefault(); if (status === 'ready' && expression.trim()) calculator.current?.setExpression({ id: 'student-expression', latex: expression.trim(), color: '#2563eb' }); }}>
        <label className="flex-1 min-w-0 text-sm">Expression in LaTeX<input className="neu-input-el mt-2" value={expression} onChange={event => setExpression(event.target.value)} placeholder="y=x^2" maxLength={500} /></label>
        <button className="btn-solid" disabled={status !== 'ready' || !expression.trim()}>Plot expression</button>
      </form>}
      {useApi && status === 'loading' && <p role="status">Loading Desmos…</p>}
      {useApi && status === 'fallback' && <p role="status">The API did not load. The standard embed is available below. <button type="button" className="underline" onClick={() => setAttempt(value => value + 1)}>Retry API</button></p>}
			<div className="zone-graph-frame">
        {useApi && <div ref={mount} style={{ width: '100%', height: 560, display: status === 'fallback' ? 'none' : 'block' }} />}
				{(!useApi || status === 'fallback') && <iframe key={mode} title={title} src={src} allowFullScreen loading="lazy" />}
			</div>

			<p className="zone-subtle text-[13px] m-0">
				Graphs are temporary. Export anything you need to keep before switching tools. If the embed is unavailable, <a href={src.replace('?embed', '')} target="_blank" rel="noopener noreferrer" className="underline">open Desmos separately</a>.
			</p>
		</div>
	);
}

export default GraphingSuite;
