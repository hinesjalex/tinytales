"use client";

import { useState, useEffect } from "react";

const BG = [
  "linear-gradient(135deg, #E8F5E2 0%, #F5F0E1 100%)",
  "linear-gradient(135deg, #FFF8E7 0%, #FDEBD3 100%)",
  "linear-gradient(135deg, #FDE8D0 0%, #F5E6D8 100%)",
  "linear-gradient(135deg, #E8E0F5 0%, #F0E8F8 100%)",
  "linear-gradient(135deg, #FFF4D6 0%, #FFEAB8 100%)",
];

const EMOJIS = ["🌳", "🏡", "🦊", "✨", "🌟"];

function buildPages(name) {
  return [
    { isCover: true, title: `${name} and the\nWhispering Forest`, subtitle: `A story about courage, made just for ${name}` },
    { text: `${name} lived in a little blue house at the edge of a very old forest. Every night, when the wind blew just right, the trees seemed to whisper: "${name}… ${name}…"` },
    { text: `"Who's there?" ${name} called out one morning. A small fox with golden eyes stepped onto the path. "I've been waiting for someone brave," the fox said. "Will you help us, ${name}?"` },
    { text: `Deep in the forest, the oldest tree had stopped glowing. Without its light, the animals couldn't find their way home. ${name} took a deep breath. "Show me," ${name} said.` },
    { text: `${name} placed a small hand on the bark and whispered the kindest thing imaginable: "You are not alone." The tree shimmered, then blazed with golden light. The whole forest cheered ${name}'s name.` },
  ];
}

export default function SampleBook({ name, onFinished }) {
  const pages = buildPages(name);
  const [i, setI] = useState(0);
  const [fading, setFading] = useState(false);
  const done = i === pages.length - 1;

  const go = (to) => {
    if (fading || to < 0 || to >= pages.length) return;
    setFading(true);
    setTimeout(() => { setI(to); setFading(false); }, 250);
  };

  useEffect(() => {
    if (done && onFinished) onFinished();
  }, [done]);

  const p = pages[i];

  return (
    <div className="w-full max-w-[340px] mx-auto">
      <div
        className="rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(42,37,32,0.15),0_4px_12px_rgba(42,37,32,0.08)] cursor-pointer select-none"
        onClick={() => go(i + 1)}
      >
        <div
          className="flex flex-col items-center justify-center p-8 transition-opacity duration-300"
          style={{ background: BG[i], aspectRatio: "3/4", opacity: fading ? 0 : 1 }}
        >
          <div className="text-7xl mb-5">{EMOJIS[i]}</div>
          {p.isCover ? (
            <>
              <div className="font-serif text-[28px] leading-[1.15] tracking-tight text-center whitespace-pre-line">
                {p.title}
              </div>
              <div className="text-[13px] text-warm-600 mt-2.5 italic">{p.subtitle}</div>
            </>
          ) : (
            <>
              <div className="text-[15px] leading-[1.7] text-warm-900 text-center">{p.text}</div>
              <div className="absolute bottom-3.5 right-5 text-[11px] text-warm-500">
                {i}/{pages.length - 1}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="text-center mt-3.5 text-[13px] text-warm-500">
        {i === 0 ? `Tap to read ${name}'s story →` : !done ? "Tap →" : "✓ End of sample"}
      </div>

      <div className="flex justify-center gap-1.5 mt-3">
        {pages.map((_, j) => (
          <div
            key={j}
            onClick={(e) => { e.stopPropagation(); go(j); }}
            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
              j === i ? "w-[18px] bg-accent" : "w-1.5 bg-warm-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
