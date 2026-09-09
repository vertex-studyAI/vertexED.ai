/** Parse a deliberately small diagram language. Labels stay text, never HTML. */
export function parseConceptMap(source) {
  const nodes = new Map();
  const edges = [];
  const text = String(source).replace(/```(?:mermaid)?/g, '').trim();
  if (text.length > 20_000) return null;
  const lines = text.split(/[\n;]/).map(line => line.trim()).filter(Boolean);
  if (!/^(flowchart|graph)\s+(TD|TB|LR)$/.test(lines.shift() || '')) return null;
  const node = '([A-Za-z][A-Za-z0-9_]*)(?:\\["?([^\\]"\\n]+)"?\\])?';
  const declaration = new RegExp(`^${node}$`);
  const link = new RegExp(`^${node}\\s*-->\\s*(?:\\|([^|]+)\\|\\s*)?${node}$`);
  const add = (id, label) => nodes.set(id, { id, label: String(label || nodes.get(id)?.label || id).slice(0, 160) });
  for (const line of lines) {
    if (line.startsWith('%%')) continue;
    const edge = line.match(link);
    if (edge) { add(edge[1], edge[2]); add(edge[4], edge[5]); edges.push({ from: edge[1], to: edge[4], label: (edge[3] || '').slice(0, 80) }); }
    else {
      const item = line.match(declaration);
      if (!item) return null;
      add(item[1], item[2]);
    }
    if (nodes.size > 20 || edges.length > 40) return null;
  }
  return nodes.size ? { nodes: [...nodes.values()], edges } : null;
}
