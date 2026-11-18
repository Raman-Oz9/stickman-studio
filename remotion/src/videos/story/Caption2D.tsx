import React from "react";

export interface CaptionWord {
  w: string;
  t0: number;
  t1: number;
}

export interface Caption2DProps {
  words: CaptionWord[];
  frame: number;
  fps: number;
}

export const Caption2D: React.FC<Caption2DProps> = ({ words, frame, fps }) => {
  if (!words || words.length === 0) {
    return null;
  }

  const t = frame / fps;

  let activeIdx = 0;
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (t >= word.t0 && t <= word.t1) {
      activeIdx = i;
      break;
    }
    if (t < word.t0) {
      activeIdx = i > 0 && (word.t0 - t > t - words[i - 1].t1) ? i - 1 : i;
      break;
    }
    activeIdx = i;
  }

  const startIdx = Math.max(0, Math.min(words.length - 1, activeIdx - 1));
  const endIdx = Math.max(startIdx, Math.min(words.length - 1, startIdx + 2));
  const displayedWords = words.slice(startIdx, endIdx + 1);

  return (
    <div
      style={{
        position: "absolute",
        left: 60,
        right: 60,
        bottom: 210,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        gap: "18px",
        textAlign: "center",
        fontFamily: "Arial Black, Impact, 'Liberation Sans', sans-serif",
        fontWeight: 900,
        fontSize: 64,
        lineHeight: 1.1,
        pointerEvents: "none",
        zIndex: 100,
      }}
    >
      {displayedWords.map((word, idx) => {
        const absoluteIdx = startIdx + idx;
        const isActive = absoluteIdx === activeIdx && t >= word.t0 - 0.1 && t <= word.t1 + 0.1;

        return (
          <span
            key={absoluteIdx}
            style={{
              color: isActive ? "#ffd700" : "#ffffff",
              WebkitTextStroke: "10px #1a1020",
              paintOrder: "stroke fill",
              textShadow: "0 8px 0 rgba(0,0,0,0.4)",
              transform: isActive ? "scale(1.08)" : "scale(1)",
              transition: "transform 0.1s ease",
              display: "inline-block",
            }}
          >
            {word.w}
          </span>
        );
      })}
    </div>
  );
};
