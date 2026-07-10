import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Download, Eraser, Pen, RotateCcw, Send } from 'lucide-react';
import {
  addTextSource,
  createNotebook,
  listNotebooks,
} from '@/lib/notebook';

type Point = { x: number; y: number; pressure: number };
type Stroke = { color: string; width: number; tool: 'pen' | 'eraser'; points: Point[] };

const STORAGE_KEY = 'vertex_sketch_pad_v1';
const COLORS = ['#e8f4ff', '#7dd3fc', '#a78bfa', '#fbbf24', '#f87171', '#34d399', '#1e293b'];

function loadStrokes(): Stroke[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Stroke[]) : [];
  } catch {
    return [];
  }
}

function saveStrokes(strokes: Stroke[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(strokes.slice(-400)));
}

function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke, dpr: number) {
  if (stroke.points.length < 2) return;
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';
  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = stroke.width * dpr;

  ctx.beginPath();
  const [first, ...rest] = stroke.points;
  ctx.moveTo(first.x * dpr, first.y * dpr);
  for (const p of rest) {
    const w = stroke.width * (0.35 + p.pressure * 0.85);
    ctx.lineWidth = w * dpr;
    ctx.lineTo(p.x * dpr, p.y * dpr);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(p.x * dpr, p.y * dpr);
  }
  ctx.restore();
}

function redraw(canvas: HTMLCanvasElement, strokes: Stroke[]) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const dpr = window.devicePixelRatio || 1;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (const stroke of strokes) drawStroke(ctx, stroke, dpr);
}

type Props = { accent?: string };

export default function SketchPad({ accent = 'hsl(266 72% 74%)' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const strokesRef = useRef<Stroke[]>(loadStrokes());
  const activeStroke = useRef<Stroke | null>(null);
  const drawing = useRef(false);

  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [color, setColor] = useState(COLORS[1]);
  const [width, setWidth] = useState(3);
  const [caption, setCaption] = useState('');
  const navigate = useNavigate();

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(280, rect.width);
    const h = Math.max(320, Math.min(480, w * 0.62));

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    redraw(canvas, strokesRef.current);
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      pressure: e.pressure > 0 ? e.pressure : 0.5,
    };
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    activeStroke.current = {
      color: tool === 'eraser' ? '#000' : color,
      width: tool === 'eraser' ? width * 4 : width,
      tool,
      points: [getPoint(e)],
    };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || !activeStroke.current) return;
    activeStroke.current.points.push(getPoint(e));
    const canvas = canvasRef.current;
    if (canvas) redraw(canvas, [...strokesRef.current, activeStroke.current]);
  };

  const endStroke = () => {
    if (!drawing.current || !activeStroke.current) return;
    drawing.current = false;
    strokesRef.current = [...strokesRef.current, activeStroke.current];
    saveStrokes(strokesRef.current);
    activeStroke.current = null;
  };

  const clearPad = () => {
    strokesRef.current = [];
    saveStrokes([]);
    const canvas = canvasRef.current;
    if (canvas) redraw(canvas, []);
  };

  const exportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `vertex-sketch-${Date.now()}.png`;
    a.click();
  };

  const sendToNotebook = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
    const title = caption.trim() || `Sketch ${new Date().toLocaleDateString()}`;
    const content = [
      `# ${title}`,
      '',
      caption.trim() ? caption.trim() : 'Hand-drawn diagram from Study Zone sketch pad (iPad / Apple Pencil friendly).',
      '',
      `![${title}](${dataUrl.length < 120_000 ? dataUrl : ''})`,
      dataUrl.length >= 120_000
        ? '_Image too large for inline storage — export PNG from Study Zone and attach manually._'
        : '',
      '',
      'Use this visual as a source for concept maps, flashcards, or rubric review.',
    ]
      .filter(Boolean)
      .join('\n');

    let nb = listNotebooks()[0];
    if (!nb) nb = createNotebook('Visual notes', 'Sketch');
    addTextSource(nb.id, title, content, 'file');
    navigate('/study-notebook');
  };

  const btnStyle = (active?: boolean): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 12px',
    borderRadius: 999,
    border: `1px solid ${active ? accent : 'hsla(199, 45%, 72%, 0.2)'}`,
    background: active ? `${accent}22` : 'hsla(216, 18%, 14%, 0.6)',
    color: 'hsl(var(--foreground))',
    fontSize: 13,
    cursor: 'pointer',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <button type="button" style={btnStyle(tool === 'pen')} onClick={() => setTool('pen')}>
          <Pen size={14} /> Pen
        </button>
        <button type="button" style={btnStyle(tool === 'eraser')} onClick={() => setTool('eraser')}>
          <Eraser size={14} /> Eraser
        </button>
        <div style={{ display: 'flex', gap: 6 }}>
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Color ${c}`}
              onClick={() => {
                setColor(c);
                setTool('pen');
              }}
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: c,
                border: color === c ? `2px solid ${accent}` : '2px solid transparent',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
        <input
          type="range"
          min={1}
          max={8}
          value={width}
          onChange={(e) => setWidth(Number(e.target.value))}
          aria-label="Stroke width"
          style={{ width: 80 }}
        />
        <button type="button" style={btnStyle()} onClick={clearPad}>
          <RotateCcw size={14} /> Clear
        </button>
        <button type="button" style={btnStyle()} onClick={exportPng}>
          <Download size={14} /> PNG
        </button>
        <button type="button" style={btnStyle()} onClick={sendToNotebook}>
          <Send size={14} /> Notebook
        </button>
      </div>

      <input
        type="text"
        placeholder="Caption (optional) — e.g. Free-body diagram for inclined plane"
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        style={{
          width: '100%',
          padding: '10px 14px',
          borderRadius: 12,
          border: '1px solid hsla(199, 45%, 72%, 0.18)',
          background: 'hsla(216, 18%, 12%, 0.5)',
          color: 'hsl(var(--foreground))',
          fontSize: 14,
        }}
      />

      <div
        ref={containerRef}
        style={{
          borderRadius: 16,
          overflow: 'hidden',
          border: `1px solid ${accent}44`,
          touchAction: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none',
        }}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endStroke}
          onPointerLeave={endStroke}
          onPointerCancel={endStroke}
          style={{ display: 'block', cursor: 'crosshair', touchAction: 'none' }}
          aria-label="Sketch canvas — use Apple Pencil or finger to draw"
        />
      </div>

      <p style={{ margin: 0, fontSize: 12, opacity: 0.65 }}>
        Optimized for iPad and Apple Pencil — pressure-sensitive strokes, auto-saved locally.{' '}
        <Link to="/study-notebook" style={{ color: accent }}>
          Open Study Notebook →
        </Link>
      </p>
    </div>
  );
}
