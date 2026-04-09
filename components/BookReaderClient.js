"use client";

import { useState } from "react";

const PAGE_COLORS = [
  "linear-gradient(135deg, #E8F5E2 0%, #F5F0E1 100%)",
  "linear-gradient(135deg, #FFF8E7 0%, #FDEBD3 100%)",
  "linear-gradient(135deg, #FDE8D0 0%, #F5E6D8 100%)",
  "linear-gradient(135deg, #E8E0F5 0%, #F0E8F8 100%)",
  "linear-gradient(135deg, #FFF4D6 0%, #FFEAB8 100%)",
  "linear-gradient(135deg, #E2F0F5 0%, #E1EFF5 100%)",
  "linear-gradient(135deg, #F5E8E2 0%, #F5E1D8 100%)",
  "linear-gradient(135deg, #E8F5EC 0%, #E1F5E8 100%)",
];

const PAGE_EMOJIS = ["📖"];

export default function BookReaderClient({ title, pages, childName, shareId, showActions, onMakeAnother }) {
  const [i, setI] = useState(0);
  const [fading, setFading] = useState(false);
  const [copied, setCopied] = useState(false);

  // pages array: [{pageNumber, text, illustrationHint}]
  // We prepend a cover page
  const allPages = [
    { isCover: true },
    ...pages,
  ];

  const total = allPages.length;
  const current = allPages[i];

  const go = (to) => {
    if (fading || to < 0 || to >= total) return;
    setFading(true);
    setTimeout(() => { setI(to); setFading(false); }, 250);
  };

  const colorIndex = i % PAGE_COLORS.length;
  const emojiIndex = i % PAGE_EMOJIS.length;

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/book/${shareId}`
    : `/book/${shareId}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: `Read ${childName}'s personalized storybook!`,
          url: shareUrl,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 py-12 text-center">
      <h2 className="font-serif text-2xl tracking-tight mb-1">
        {childName}'s book is ready
      </h2>
      <p className="text-sm text-warm-600 mb-6">
        Tap through to read it together.
      </p>

      {/* Book */}
      <div className="w-full max-w-[340px] mx-auto">
        <div
          className="rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(42,37,32,0.15),0_4px_12px_rgba(42,37,32,0.08)] cursor-pointer select-none"
          onClick={() => go(i + 1)}
        >
          <div
            className="flex flex-col items-center justify-center transition-opacity duration-300 relative overflow-hidden"
            style={{ aspectRatio: "3/4", opacity: fading ? 0 : 1 }}
          >
            {/* Background: illustration or gradient fallback */}
            {current.imageUrl ? (
              <img
                src={current.imageUrl}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div
                className="absolute inset-0"
                style={{ background: PAGE_COLORS[colorIndex] }}
              />
            )}

            {/* Content overlay */}
            <div className={`relative z-10 flex flex-col items-center justify-end h-full w-full ${current.imageUrl ? "p-0" : "p-8 justify-center"}`}>
              {current.isCover ? (
                <div className={`flex flex-col items-center justify-center flex-1 w-full ${current.imageUrl ? "bg-gradient-to-t from-black/60 via-black/20 to-transparent p-8" : ""}`}>
                  <div className={`font-serif text-[26px] leading-[1.15] tracking-tight whitespace-pre-line ${current.imageUrl ? "text-white drop-shadow-lg mt-auto" : ""}`}>
                    {title}
                  </div>
                  <div className={`text-[13px] mt-2.5 italic ${current.imageUrl ? "text-white/80" : "text-warm-600"}`}>
                    A story made just for {childName}
                  </div>
                </div>
              ) : (
                <div className={`w-full ${current.imageUrl ? "bg-gradient-to-t from-black/70 via-black/40 to-transparent p-6 pt-16" : ""}`}>
                  <div className={`text-[15px] leading-[1.7] text-center ${current.imageUrl ? "text-white drop-shadow" : "text-warm-900"}`}>
                    {current.text}
                  </div>
                  <div className={`absolute bottom-3.5 right-5 text-[11px] ${current.imageUrl ? "text-white/50" : "text-warm-500"}`}>
                    {i}/{total - 1}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-1 mt-3 flex-wrap max-w-[300px] mx-auto">
          {allPages.map((_, j) => (
            <div
              key={j}
              onClick={() => go(j)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                j === i ? "w-[14px] bg-accent" : "w-1.5 bg-warm-300"
              }`}
            />
          ))}
        </div>

        {/* Tap hint */}
        <div className="text-center mt-3 text-[13px] text-warm-500">
          {i === 0 ? `Tap to start reading →` : i < total - 1 ? "Tap →" : `✓ The End`}
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="flex gap-3 flex-wrap justify-center">
            <button
              onClick={handleShare}
              className="px-8 py-3.5 rounded-full text-[15px] font-semibold bg-accent text-cream transition-all hover:scale-[1.03]"
            >
              {copied ? "Link copied!" : "Send to family"}
            </button>
            {onMakeAnother && (
              <button
                onClick={onMakeAnother}
                className="px-8 py-3.5 rounded-full text-[15px] font-semibold bg-transparent text-ink border-2 border-warm-200 transition-all hover:scale-[1.03]"
              >
                Make another book
              </button>
            )}
          </div>
          <p className="text-xs text-warm-600">
            Read on iPad · Share the link · Treasure it forever
          </p>
        </div>
      )}

      {/* Share link (always visible on shared pages) */}
      {!showActions && shareId && (
        <div className="mt-8 flex flex-col items-center gap-3">
          <a
            href="/"
            className="px-8 py-3.5 rounded-full text-[15px] font-semibold bg-ink text-cream inline-block"
          >
            Make a book for your child →
          </a>
        </div>
      )}
    </section>
  );
}
