"use client";

import { useState } from "react";

const PAGE_COLORS = [
  "#E8F5E2", "#FFF8E7", "#FDE8D0", "#E8E0F5", "#FFF4D6",
  "#E2F0F5", "#F5E8E2", "#E8F5EC", "#F5F0E1", "#FDEBD3",
];

export default function BookReaderClient({ title, pages, childName, shareId, showActions, onMakeAnother }) {
  const [i, setI] = useState(0);
  const [fading, setFading] = useState(false);
  const [copied, setCopied] = useState(false);

  const allPages = [{ isCover: true }, ...pages];
  const total = allPages.length;
  const current = allPages[i];

  const go = (to) => {
    if (fading || to < 0 || to >= total) return;
    setFading(true);
    setTimeout(() => { setI(to); setFading(false); }, 250);
  };

  const colorIndex = i % PAGE_COLORS.length;
  const showText = !current.isCover && current.text && current.textPosition !== "hidden";
  const hasImage = current.imageUrl;

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/book/${shareId}`
    : `/book/${shareId}`;

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title, text: `Read ${childName}'s storybook!`, url: shareUrl }); } catch {}
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 py-12 text-center">
      <h2 className="font-serif text-2xl tracking-tight mb-1">{childName}'s book is ready</h2>
      <p className="text-sm text-warm-600 mb-6">Tap through to read it together.</p>

      {/* Book */}
      <div className="w-full max-w-[340px] mx-auto">
        <div
          className="rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(30,24,18,0.15),0_4px_12px_rgba(30,24,18,0.06)] cursor-pointer select-none bg-white"
          onClick={() => go(i + 1)}
        >
          <div
            className="flex flex-col transition-opacity duration-300"
            style={{ opacity: fading ? 0 : 1 }}
          >
            {current.isCover ? (
              /* === COVER PAGE === title overlaid on illustration */
              <div className="relative" style={{ aspectRatio: "3/4" }}>
                {hasImage ? (
                  <img src={current.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0" style={{ background: PAGE_COLORS[0] }} />
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-end p-8 bg-gradient-to-t from-black/50 via-transparent to-transparent">
                  <div className="font-serif text-[26px] leading-[1.15] tracking-tight text-white drop-shadow-lg whitespace-pre-line text-center">
                    {title}
                  </div>
                  <div className="text-[13px] text-white/75 mt-2 italic">
                    A story made just for {childName}
                  </div>
                </div>
              </div>
            ) : current.textPosition === "hidden" ? (
              /* === IMAGE ONLY PAGE === parent's illustration has baked-in text — no cropping */
              <div className="relative">
                {hasImage ? (
                  <img src={current.imageUrl} alt="" className="w-full block" style={{ display: "block", width: "100%" }} />
                ) : (
                  <div className="flex items-center justify-center" style={{ aspectRatio: "3/4", background: PAGE_COLORS[colorIndex] }}>
                    <span className="text-warm-400 text-sm">Image only page</span>
                  </div>
                )}
                <div className="absolute bottom-3 right-4 text-[11px] text-warm-400 bg-white/70 px-1.5 py-0.5 rounded">
                  {i}/{total - 1}
                </div>
              </div>
            ) : (
              /* === STANDARD PAGE === illustration top, text below */
              <div>
                {hasImage ? (
                  <div style={{ position: "relative", width: "100%", paddingTop: "75%", overflow: "hidden" }}>
                    <img src={current.imageUrl} alt="" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ) : (
                  <div style={{ position: "relative", width: "100%", paddingTop: "75%", overflow: "hidden", background: PAGE_COLORS[colorIndex] }}>
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 36, opacity: 0.3 }}>🎨</span>
                    </div>
                  </div>
                )}
                <div style={{ padding: "20px 24px", background: "rgba(253,250,245,0.8)" }}>
                  <p style={{ fontSize: 14, lineHeight: 1.75, color: "rgba(30,24,18,0.85)", textAlign: "center", overflowWrap: "break-word", wordWrap: "break-word", margin: 0 }}>
                    {current.text}
                  </p>
                  <div style={{ fontSize: 11, color: "#C4B5A0", textAlign: "right", marginTop: 8 }}>
                    {i}/{total - 1}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-1 mt-3 flex-wrap max-w-[300px] mx-auto">
          {allPages.map((_, j) => (
            <div key={j} onClick={() => go(j)} className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${j === i ? "w-[14px] bg-accent" : "w-1.5 bg-warm-300"}`} />
          ))}
        </div>

        <div className="text-center mt-3 text-[13px] text-warm-500">
          {i === 0 ? "Tap to start reading →" : i < total - 1 ? "Tap →" : "✓ The End"}
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="flex gap-3 flex-wrap justify-center">
            <button onClick={handleShare} className="px-8 py-3.5 rounded-full text-[15px] font-semibold bg-accent text-cream transition-all hover:scale-[1.03]">
              {copied ? "Link copied!" : "Send to family"}
            </button>
            {onMakeAnother && (
              <button onClick={onMakeAnother} className="px-8 py-3.5 rounded-full text-[15px] font-semibold bg-transparent text-ink border-2 border-warm-200 transition-all hover:scale-[1.03]">
                Make another book
              </button>
            )}
          </div>
          <p className="text-xs text-warm-600">Read on iPad · Share the link · Treasure it forever</p>
        </div>
      )}

      {!showActions && shareId && (
        <div className="mt-8 flex flex-col items-center gap-3">
          <a href="/" className="px-8 py-3.5 rounded-full text-[15px] font-semibold bg-ink text-cream inline-block no-underline">
            Make a book for your child →
          </a>
        </div>
      )}
    </section>
  );
}
