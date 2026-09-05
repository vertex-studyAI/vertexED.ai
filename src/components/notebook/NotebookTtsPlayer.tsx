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
  const [speechSupported, setSpeechSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const previousScriptRef = useRef(script);

  useEffect(() => {
    setSpeechSupported(
      typeof window !== 'undefined' &&
        Boolean(window.speechSynthesis) &&
        typeof SpeechSynthesisUtterance === 'function',
    );
  }, []);

  const stop = useCallback(() => {
    const activeUtterance = utteranceRef.current;
    if (activeUtterance && typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // The browser speech queue is shared state. Even if its cancellation
        // API fails, never leave this player's local ownership/UI state stale.
      }
    }
    setPlaying(false);
    setPaused(false);
    utteranceRef.current = null;
  }, []);

  // Cleanup must not call the stateful stop() helper after unmount. Only cancel
  // the global speech queue when this player still owns an active utterance.
  // Browser speech implementations can throw during teardown; local ownership
  // must still be released so stale callbacks cannot retain this player.
  useEffect(
    () => () => {
      if (!utteranceRef.current) return;
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // Unmount cleanup is best-effort for the shared browser queue. Never
          // let a provider exception prevent local utterance ownership cleanup.
        }
      }
      utteranceRef.current = null;
    },
    [],
  );

  // Generated notebook content can be replaced in-place. Never keep speaking or
  // resume an utterance that belongs to the previous generated script. An idle
  // player does not call the global cancel() API and therefore cannot interrupt
  // speech started elsewhere in the application.
  useEffect(() => {
    if (previousScriptRef.current === script) return;
    previousScriptRef.current = script;
    if (utteranceRef.current) stop();
  }, [script, stop]);

  const play = () => {
    if (
      typeof window === 'undefined' ||
      !window.speechSynthesis ||
      typeof SpeechSynthesisUtterance !== 'function'
    ) {
      return;
    }
    const clean = scriptToSpeech(script);
    if (!clean) return;

    if (paused && utteranceRef.current) {
      try {
        window.speechSynthesis.resume();
        setPaused(false);
        setPlaying(true);
      } catch {
        stop();
      }
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
    try {
      window.speechSynthesis.speak(utterance);
      setPlaying(true);
    } catch {
      if (utteranceRef.current === utterance) {
        utteranceRef.current = null;
        setPlaying(false);
        setPaused(false);
      }
    }
  };

  const pause = () => {
    if (
      typeof window === 'undefined' ||
      !window.speechSynthesis ||
      !utteranceRef.current
    ) {
      return;
    }
    try {
      window.speechSynthesis.pause();
      setPaused(true);
      setPlaying(false);
    } catch {
      // A failed pause must not strand local state as if playback were still
      // controllable. Stop only this player's owned utterance and fail closed.
      stop();
    }
  };

  // Render the same empty tree on the server and during the first client render;
  // capability detection happens after mount, avoiding an unsupported-browser
  // hydration mismatch.
  if (!speechSupported) return null;

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
