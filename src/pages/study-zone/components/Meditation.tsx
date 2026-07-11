import React, { useEffect, useMemo, useState } from "react";

interface MeditationProps {
  accent: string;
}

const controlGridStyle: React.CSSProperties = {
  display: "grid",
  gap: "16px",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
};

const breathIndicatorStyle = (accent: string): React.CSSProperties => ({
  width: "260px",
  height: "260px",
  borderRadius: "50%",
  background: `radial-gradient(circle at 30% 30%, ${accent} 0%, ${accent}b3 45%, ${accent}33 70%, transparent 100%)`,
});

const Meditation: React.FC<MeditationProps> = ({ accent }) => {
  const [totalMinutes, setTotalMinutes] = useState(5);
  const [breaths, setBreaths] = useState(10);
  const [isRunning, setIsRunning] = useState(false);
  const [isInhale, setIsInhale] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [sessionKey, setSessionKey] = useState(0);

  const cycleDuration = useMemo(() => {
    if (!isRunning || breaths <= 0 || totalMinutes <= 0) {
      return 0;
    }
    return (totalMinutes * 60 * 1000) / breaths / 2;
  }, [isRunning, totalMinutes, breaths]);

  useEffect(() => {
    if (!isRunning || cycleDuration <= 0) {
      return () => undefined;
    }

    const intervalId = window.setInterval(() => {
      setElapsed((prev) => prev + cycleDuration);
      setIsInhale((prev) => !prev);
    }, cycleDuration);

    return () => window.clearInterval(intervalId);
  }, [isRunning, cycleDuration, sessionKey]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }
    const sessionDuration = totalMinutes * 60 * 1000;
    if (elapsed >= sessionDuration) {
      setIsRunning(false);
      setElapsed(0);
      setIsInhale(true);
    }
  }, [elapsed, isRunning, totalMinutes]);

  const remainingBreaths = useMemo(() => {
    if (!isRunning || cycleDuration <= 0) {
      return breaths;
    }
    const totalCycles = breaths * 2;
    const consumed = Math.floor(elapsed / cycleDuration);
    const remaining = Math.max(totalCycles - consumed, 0);
    return Math.ceil(remaining / 2);
  }, [breaths, cycleDuration, elapsed, isRunning]);

  const beginSession = () => {
    setElapsed(0);
    setIsInhale(true);
    setSessionKey((key) => key + 1);
    setIsRunning(true);
  };

  const restartSession = () => {
    setElapsed(0);
    setIsInhale(true);
    setSessionKey((key) => key + 1);
  };

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      {!isRunning ? (
        <div style={{ display: "grid", gap: "20px" }}>
          <div style={controlGridStyle}>
            <label style={{ display: "grid", gap: "8px" }}>
              <span className="form-label">Total time (minutes)</span>
              <input
                type="number"
                min={1}
                value={totalMinutes}
                onChange={(event) => setTotalMinutes(Math.max(Number(event.target.value) || 1, 1))}
                className="form-control w-full"
              />
            </label>
            <label className="grid gap-2">
              <span className="form-label">Breaths</span>
              <input
                type="number"
                min={1}
                value={breaths}
                onChange={(event) => setBreaths(Math.max(Number(event.target.value) || 1, 1))}
                className="form-control w-full"
              />
            </label>
          </div>
          <p className="zone-subtle">
            We guide each inhale and exhale evenly so your session lasts {totalMinutes} minute{totalMinutes === 1 ? "" : "s"}. You'll breathe {breaths} times in total.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button type="button" onClick={beginSession} className="zone-btn-primary">
              Begin session
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "20px", justifyItems: "center" }}>
          <div style={{ position: "relative", width: "260px", height: "260px" }}>
            <div
              key={sessionKey}
              style={{
                ...breathIndicatorStyle(accent),
                animation: `${isInhale ? "inhale" : "exhale"} ${cycleDuration}ms ease-in-out infinite` as const,
              }}
            />
            <style>{`
              @keyframes inhale {
                0% { transform: scale(0.75); opacity: 0.4; }
                100% { transform: scale(1); opacity: 1; }
              }
              @keyframes exhale {
                0% { transform: scale(1); opacity: 1; }
                100% { transform: scale(0.75); opacity: 0.35; }
              }
            `}</style>
          </div>
          <div style={{ textAlign: "center", display: "grid", gap: "8px" }}>
            <span className="text-lg font-semibold text-foreground">{isInhale ? "Inhale" : "Exhale"}</span>
            <p className="zone-subtle">Remaining breaths: {remainingBreaths}</p>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button type="button" onClick={() => setIsRunning(false)} className="zone-btn-ghost !px-4">
              End session
            </button>
            <button type="button" onClick={restartSession} className="zone-btn-ghost !px-4">
              Restart
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Meditation;
