import { useEffect, useRef, useState } from 'react';
import { Mic, Square } from 'lucide-react';

export default function VoiceOrb({ enabled }: { enabled: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const release = useRef<() => void>(() => {});
  const generation = useRef(0);
  const [status, setStatus] = useState<'idle' | 'requesting' | 'listening' | 'error'>('idle');
  const [message, setMessage] = useState('Say an explanation aloud. The light follows your voice.');
  const stop = () => { generation.current++; release.current(); release.current = () => {}; setStatus('idle'); setMessage('Microphone off. Nothing was recorded or sent.'); };
  useEffect(() => {
    const invalidateRequest = () => { generation.current++; };
    const end = () => { if (document.hidden) stop(); };
    const observer = new IntersectionObserver(([entry]) => { if (!entry.isIntersecting) stop(); });
    if (root.current) observer.observe(root.current);
    document.addEventListener('visibilitychange', end); window.addEventListener('blur', stop);
    return () => { invalidateRequest(); release.current(); observer.disconnect(); document.removeEventListener('visibilitychange', end); window.removeEventListener('blur', stop); };
  }, []);
  useEffect(() => { if (!enabled) { generation.current++; release.current(); release.current = () => {}; setStatus('idle'); } }, [enabled]);
  const start = async () => {
    if (!navigator.mediaDevices?.getUserMedia) { setStatus('error'); setMessage('Microphone access is unavailable here. You can still practise aloud.'); return; }
    const token = ++generation.current;
    setStatus('requesting'); setMessage('Waiting for microphone permission.');
    let stream: MediaStream | undefined, context: AudioContext | undefined;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (token !== generation.current) { stream.getTracks().forEach(track => track.stop()); return; }
      context = new AudioContext(); await context.resume();
      if (token !== generation.current) { stream.getTracks().forEach(track => track.stop()); await context.close(); return; }
      const analyser = context.createAnalyser(); analyser.fftSize = 256;
      const source = context.createMediaStreamSource(stream); source.connect(analyser);
      const values = new Uint8Array(analyser.frequencyBinCount);
      let frame = 0, last = 0;
      const paint = (time: number) => {
        if (time - last > 40) {
          last = time; analyser.getByteFrequencyData(values);
          const level = Math.min(1, values.reduce((sum, value) => sum + value, 0) / values.length / 85);
          root.current?.style.setProperty('--voice-level', String(level));
          root.current?.querySelectorAll<HTMLElement>('.motion-voice-wave i').forEach((bar, i) => bar.style.setProperty('--bar', `${4 + values[i * 3] / 255 * 38}px`));
        }
        frame = requestAnimationFrame(paint);
      };
      const timeout = window.setTimeout(stop, 60_000);
      release.current = () => { cancelAnimationFrame(frame); clearTimeout(timeout); source.disconnect(); stream?.getTracks().forEach(track => track.stop()); void context?.close(); root.current?.style.removeProperty('--voice-level'); root.current?.querySelectorAll<HTMLElement>('.motion-voice-wave i').forEach(bar => bar.style.removeProperty('--bar')); };
      setStatus('listening'); setMessage('Microphone on. Audio stays on this device. Stops after one minute.');
      frame = requestAnimationFrame(paint);
    } catch {
      stream?.getTracks().forEach(track => track.stop()); void context?.close();
      if (token === generation.current) { setStatus('error'); setMessage('Microphone could not start. Check browser permission, then try again.'); }
    }
  };
  return <div className="motion-voice" ref={root} data-listening={status === 'listening'}>
    <div className="motion-voice-orb" aria-hidden="true"><i /><i /><span /></div>
    <div className="motion-voice-copy"><p className="vh-kicker">Explain it in your own words</p><h3>Give the idea a voice.</h3><p role="status">{message}</p><div className="motion-voice-wave" aria-hidden="true">{Array.from({ length: 32 }, (_, i) => <i key={i} />)}</div><button type="button" className="vh-secondary" disabled={!enabled} onClick={status === 'listening' || status === 'requesting' ? stop : start}>{status === 'listening' || status === 'requesting' ? <Square size={16} aria-hidden /> : <Mic size={16} aria-hidden />}{status === 'requesting' ? 'Cancel microphone request' : status === 'listening' ? 'Stop microphone' : 'Enable microphone'}</button><small>{enabled ? 'Visual feedback only. No recording, transcription or assessment.' : 'Enable motion to use the voice visual. No microphone is active.'}</small></div>
  </div>;
}
