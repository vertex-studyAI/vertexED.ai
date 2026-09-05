import { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play, Square } from 'lucide-react';

type Props = {
  script: string;
  className?: string;
};

/** Strip markdown bold markers for cleaner TTS */
function scriptToSpeech(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/^#+\s/gm, '')
    .replace(/```[\s\S]*?```/g, '')
    .trim();
}

export default function NotebookTtsPlayer({ script, className }: Props) {
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stop = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setPlaying(false);
    setPaused(false);
    utteranceRef.current = null;
  }, []);

  useEffect(() => () => stop(), [stop]);

  const play = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const clean = scriptToSpeech(script);
    if (!clean) return;

    if (paused && utteranceRef.current) {
      window.speechSynthesis.resume();
      setPaused(false);
      setPlaying(true);
      return;
    }

    stop();
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onend = () => {
      if (utteranceRef.current !== utterance) return;
      setPlaying(false);
      setPaused(false);
      utteranceRef.current = null;
    };
    utterance.onerror = () => {
      if (utteranceRef.current !== utterance) return;
      setPlaying(false);
      setPaused(false);
      utteranceRef.current = null;
    };
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setPlaying(true);
  };

  const pause = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.pause();
    setPaused(true);
    setPlaying(false);
  };

  if (typeof window !== 'undefined' && !window.speechSynthesis) {
    return null;
  }

  return (
    <div className={`notebook-tts flex flex-wrap items-center gap-2 ${className ?? ''}`}>
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Listen</span>
      {!playing ? (
        <button type="button" onClick={play} className="btn-glass text-xs inline-flex items-center gap-1.5 px-3 py-1.5">
          <Play className="h-3.5 w-3.5" aria-hidden />
          {paused ? 'Resume' : 'Play overview'}
        </button>
      ) : (
        <button type="button" onClick={pause} className="btn-glass text-xs inline-flex items-center gap-1.5 px-3 py-1.5">
          <Pause className="h-3.5 w-3.5" aria-hidden />
          Pause
        </button>
      )}
      {(playing || paused) && (
        <button type="button" onClick={stop} className="btn-glass text-xs inline-flex items-center gap-1 p-1.5" aria-label="Stop">
          <Square className="h-3 w-3" aria-hidden />
        </button>
      )}
    </div>
  );
}
