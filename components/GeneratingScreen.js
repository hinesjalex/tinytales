"use client";

import { useState, useEffect, useRef } from "react";

export default function GeneratingScreen({ name, steps, speed = 0.5, bookReady, onDone }) {
  const [pct, setPct] = useState(0);
  const doneTriggered = useRef(false);

  useEffect(() => {
    const t = setInterval(() => {
      setPct((p) => {
        if (bookReady && p >= 100) {
          clearInterval(t);
          if (!doneTriggered.current) {
            doneTriggered.current = true;
            setTimeout(onDone, 500);
          }
          return 100;
        }
        if (bookReady) return Math.min(p + 4, 100);
        if (p >= 85) return 85;
        return p + speed;
      });
    }, 100);

    return () => clearInterval(t);
  }, [bookReady]);

  const stepIndex = Math.min(
    Math.floor((pct / 85) * steps.length),
    steps.length - 1
  );

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="text-6xl mb-6">✨</div>
      <h2 className="font-serif text-[28px] tracking-tight mb-2">
        Creating {name}'s book
      </h2>
      <p className="text-[15px] text-warm-600 mb-8 leading-relaxed">
        This is the fun part.
      </p>
      <div className="w-full max-w-[280px] h-1 rounded-full bg-warm-200 overflow-hidden">
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-400 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-warm-500 mt-3">{steps[stepIndex]}</p>
    </section>
  );
}
