import { useEffect, useRef, useState } from 'react';
import { fragmentShader, vertexShader } from './motionShaders';

export default function ShaderCanvas({ mode, enabled, strength = 1, pulse = 0 }: { mode: number; enabled: boolean; strength?: number; pulse?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [fallback, setFallback] = useState(false);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power', preserveDrawingBuffer: true });
    if (!gl) { setFallback(true); return; }
    const shaders: WebGLShader[] = [];
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      shaders.push(shader); gl.shaderSource(shader, source); gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error('Visual shader unavailable');
      return shader;
    };
    const program = gl.createProgram()!;
    let buffer: WebGLBuffer | null = null;
    try {
      gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexShader));
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentShader));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Visual shader unavailable');
      gl.useProgram(program); buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, 'position');
      gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      setFallback(false);
    } catch {
      shaders.forEach(shader => gl.deleteShader(shader)); gl.deleteProgram(program);
      setFallback(true); return;
    }
    const uniform = (name: string) => gl.getUniformLocation(program, name);
    const texture = gl.createTexture(); gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(uniform('artwork'), 0);
    const artwork = new Image();
    const locations = { resolution: uniform('resolution'), pointer: uniform('pointer'), time: uniform('time'), mode: uniform('mode'), strength: uniform('strength') };
    let frame = 0, visible = false, until = 0, last = 0, phase = 0;
    let mouse = [.5, .5];
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const hiddenEffects = matchMedia('(forced-colors: active), (prefers-reduced-transparency: reduce)');
    const paint = () => {
      if (gl.isContextLost()) return;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(locations.resolution, canvas.width, canvas.height); gl.uniform2f(locations.pointer, mouse[0], mouse[1]);
      gl.uniform1f(locations.time, phase); gl.uniform1f(locations.mode, mode); gl.uniform1f(locations.strength, strength);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    artwork.onload = () => { gl.bindTexture(gl.TEXTURE_2D, texture); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, artwork); paint(); };
    if (mode === 16) artwork.src = '/notes.png';
    const stop = () => { cancelAnimationFrame(frame); frame = 0; canvas.dataset.animating = 'false'; };
    const draw = (now: number) => {
      frame = 0;
      if (!visible || document.hidden || !enabled || reduced.matches || hiddenEffects.matches || now > until) { stop(); return; }
      if (now - last >= 40) { phase += Math.min(80, now - last) / 1000; last = now; paint(); }
      canvas.dataset.animating = 'true'; frame = requestAnimationFrame(draw);
    };
    const wake = () => {
      if (!enabled || reduced.matches || hiddenEffects.matches || !visible || document.hidden) return;
      until = performance.now() + 2800; last = performance.now(); if (!frame) frame = requestAnimationFrame(draw);
    };
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const scale = Math.min(1.25, 900 / Math.max(1, rect.width));
      canvas.width = Math.max(1, Math.round(rect.width * scale)); canvas.height = Math.max(1, Math.round(rect.height * scale)); paint();
    };
    const move = (event: PointerEvent) => {
      if (!enabled || reduced.matches || event.pointerType !== 'mouse') return;
      const rect = canvas.getBoundingClientRect(); mouse = [(event.clientX - rect.left) / rect.width, 1 - (event.clientY - rect.top) / rect.height]; wake();
    };
    const preference = () => { stop(); mouse = [.5, .5]; phase = 0; paint(); };
    const visibility = () => { if (document.hidden) stop(); };
    const lost = (event: Event) => { event.preventDefault(); stop(); setFallback(true); };
    const restored = () => setFallback(true); // Keep the readable static fallback until the next appearance selection.
    const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) wake(); else stop(); });
    const resizeObserver = new ResizeObserver(resize);
    intersection.observe(canvas); resizeObserver.observe(canvas); resize();
    canvas.addEventListener('pointermove', move); canvas.addEventListener('pointerleave', stop);
    canvas.addEventListener('webglcontextlost', lost); canvas.addEventListener('webglcontextrestored', restored);
    document.addEventListener('visibilitychange', visibility); window.addEventListener('blur', stop);
    reduced.addEventListener('change', preference); hiddenEffects.addEventListener('change', preference);
    return () => {
      stop(); intersection.disconnect(); resizeObserver.disconnect();
      canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerleave', stop);
      canvas.removeEventListener('webglcontextlost', lost); canvas.removeEventListener('webglcontextrestored', restored);
      document.removeEventListener('visibilitychange', visibility); window.removeEventListener('blur', stop);
      reduced.removeEventListener('change', preference); hiddenEffects.removeEventListener('change', preference);
      artwork.onload = null; gl.deleteTexture(texture); gl.deleteBuffer(buffer); shaders.forEach(shader => gl.deleteShader(shader)); gl.deleteProgram(program);
    };
  }, [mode, enabled, strength, pulse]);
  return <div className="motion-shader" data-fallback={fallback}><div className="motion-shader-fallback" aria-hidden="true" /><canvas ref={ref} aria-hidden="true" data-mode={mode} /></div>;
}
