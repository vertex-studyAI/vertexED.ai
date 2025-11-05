import React, { useEffect, useMemo, useState } from "react";
import {
  fieldLabelStyle,
  ghostButtonStyle,
  inputFieldStyle,
  primaryButtonStyle,
  subtleTextStyle,
} from "../styles";

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
  const [cycleDuration, setCycleDuration] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!isRunning) {
      return;
    }
    const duration = (totalMinutes * 60 * 1000) / breaths / 2;
    setCycleDuration(duration);
  }, [isRunning, totalMinutes, breaths]);

  useEffect(() => {
    if (!isRunning || cycleDuration <= 0) {
      return () => undefined;
    }

    let anchor = Date.now();
    const intervalId = setInterval(() => {
      const now = Date.now();
      const delta = now - anchor;
      anchor = now;
      setElapsed((prev) => prev + delta);
      setIsInhale((prev) => !prev);
    }, cycleDuration);

    return () => clearInterval(intervalId);
  }, [isRunning, cycleDuration]);

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
    if (!isRunning) {
      return breaths;
    }
    const totalCycles = breaths * 2;
    const consumed = Math.floor(elapsed / cycleDuration);
    const remaining = Math.max(totalCycles - consumed, 0);
    return Math.ceil(remaining / 2);
  }, [breaths, cycleDuration, elapsed, isRunning]);

  return (
    <div style={{ display: "grid", gap: "24px" }}>
      {!isRunning ? (
        <div style={{ display: "grid", gap: "20px" }}>
          <div style={controlGridStyle}>
            <label style={{ display: "grid", gap: "8px" }}>
              <span style={fieldLabelStyle}>Total time (minutes)</span>
              <input
                type="number"
                min={1}
                value={totalMinutes}
                onChange={(event) => setTotalMinutes(Math.max(Number(event.target.value) || 1, 1))}
                style={{ ...inputFieldStyle, width: "100%" }}
              />
            </label>
            <label style={{ display: "grid", gap: "8px" }}>
              <span style={fieldLabelStyle}>Breaths</span>
              <input
                type="number"
                min={1}
                value={breaths}
                onChange={(event) => setBreaths(Math.max(Number(event.target.value) || 1, 1))}
                style={{ ...inputFieldStyle, width: "100%" }}
              />
            </label>
          </div>
          <p style={subtleTextStyle}>
            We guide each inhale and exhale evenly so your session lasts {totalMinutes} minute{totalMinutes === 1 ? "" : "s"}. You’ll breathe {breaths} times in total.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => {
                setElapsed(0);
                setIsInhale(true);
                setIsRunning(true);
              }}
              style={primaryButtonStyle(accent)}
            >
              Begin session
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "20px", justifyItems: "center" }}>
          <div style={{ position: "relative", width: "260px", height: "260px" }}>
            <div
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
            <span style={{ fontWeight: 600, fontSize: "18px", color: "hsl(var(--foreground))" }}>{isInhale ? "Inhale" : "Exhale"}</span>
            <p style={subtleTextStyle}>Remaining breaths: {remainingBreaths}</p>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button type="button" onClick={() => setIsRunning(false)} style={{ ...ghostButtonStyle, paddingInline: "18px" }}>
              End session
            </button>
            <button
              type="button"
              onClick={() => {
                setElapsed(0);
                setIsInhale(true);
              }}
              style={{ ...ghostButtonStyle, paddingInline: "18px" }}
            >
              Restart
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Meditation;
