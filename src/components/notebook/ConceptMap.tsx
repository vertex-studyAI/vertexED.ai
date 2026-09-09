import { useId, useMemo } from 'react';
import { parseConceptMap } from '@/lib/conceptMap.mjs';

export default function ConceptMap({ source }: { source: string }) {
  const graph = useMemo(() => parseConceptMap(source), [source]);
  const id = useId().replace(/:/g, '');
  if (!graph) return <div role="status"><p>The generated diagram uses unsupported syntax. Your source is preserved below; regenerate the map to try again.</p><pre className="whitespace-pre-wrap break-words text-xs">{source}</pre></div>;
  const positions = new Map<string, { x: number; y: number }>(graph.nodes.map((node, index) => [node.id, { x: 30 + index % 3 * 240, y: 30 + Math.floor(index / 3) * 150 }]));
  return <figure className="space-y-3">
    <svg viewBox={`0 0 760 ${Math.ceil(graph.nodes.length / 3) * 150 + 30}`} className="w-full text-foreground" role="img" aria-labelledby={`${id}-title`}>
      <title id={`${id}-title`}>Concept map. A complete list of relationships follows the diagram.</title>
      <defs><marker id={`${id}-arrow`} markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8" fill="currentColor" /></marker></defs>
      {graph.edges.map((edge, index) => {
        const a = positions.get(edge.from); const b = positions.get(edge.to);
        return <line key={index} x1={a.x + 100} y1={a.y + 100} x2={b.x + 100} y2={b.y} stroke="currentColor" strokeOpacity=".5" markerEnd={`url(#${id}-arrow)`} />;
      })}
      {graph.nodes.map(node => {
        const point = positions.get(node.id);
        const words = node.label.match(/.{1,24}(?:\s|$)|.{1,24}/g) || [node.label];
        return <g key={node.id} transform={`translate(${point.x},${point.y})`}><rect width="200" height="100" rx="12" fill="hsl(var(--card))" stroke="currentColor" /><text x="100" y="24" textAnchor="middle" fill="currentColor" fontSize="13">{words.slice(0, 4).map((line, i) => <tspan key={i} x="100" dy={i ? 18 : 0}>{line}</tspan>)}</text></g>;
      })}
    </svg>
    <figcaption><p className="text-sm font-medium">Concept relationships</p><ul className="list-disc pl-5 text-sm">{graph.edges.map((edge, i) => <li key={i}>{graph.nodes.find(node => node.id === edge.from)?.label} → {edge.label || 'connects to'} → {graph.nodes.find(node => node.id === edge.to)?.label}</li>)}</ul>{!graph.edges.length && <p>{graph.nodes.map(node => node.label).join(', ')}</p>}</figcaption>
  </figure>;
}
