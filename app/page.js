"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

/* --- Intersection Observer hook --- */
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

/* --- Animated counter --- */
function Counter({ end, suffix = "", prefix = "" }) {
  const [val, setVal] = useState(0);
  const [ref, visible] = useReveal();
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = Math.ceil(end / 40);
    const t = setInterval(() => {
      start += step;
      if (start >= end) { setVal(end); clearInterval(t); }
      else setVal(start);
    }, 30);
    return () => clearInterval(t);
  }, [visible, end]);
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
}

/* --- Sample book pages --- */
const SAMPLE = [
  { isCover: true, bg: "linear-gradient(145deg, #E8F0E2 0%, #F2EDE1 100%)", emoji: "🌳", title: "Mila and the\nWhispering Forest", sub: "A story about courage" },
  { bg: "linear-gradient(145deg, #FFF8E7 0%, #FDEBD3 100%)", emoji: "🏡", text: "Mila lived in a little blue house at the edge of a very old forest. Every night, the trees whispered her name." },
  { bg: "linear-gradient(145deg, #FDE8D0 0%, #F5E6D8 100%)", emoji: "🦊", text: '"Who\'s there?" Mila called. A small fox with golden eyes stepped onto the path. "I\'ve been waiting for someone brave," the fox said.' },
  { bg: "linear-gradient(145deg, #E8E0F5 0%, #F0E8F8 100%)", emoji: "✨", text: "Deep in the forest, the oldest tree had stopped glowing. Without its light, the animals couldn't find their way home." },
  { bg: "linear-gradient(145deg, #FFF4D6 0%, #FFEAB8 100%)", emoji: "🌟", text: 'Mila placed her hand on the bark and whispered: "You are not alone." The tree blazed with golden light.' },
];

function MiniBook() {
  const [page, setPage] = useState(0);
  const [fading, setFading] = useState(false);
  const go = (p) => { if (fading || p < 0 || p >= SAMPLE.length) return; setFading(true); setTimeout(() => { setPage(p); setFading(false); }, 250); };
  const p = SAMPLE[page];
  return (
    <div className="w-full max-w-[300px]">
      <div onClick={() => go(page + 1)} className="rounded-2xl overflow-hidden shadow-[0_24px_64px_rgba(30,24,18,0.18),0_4px_12px_rgba(30,24,18,0.06)] cursor-pointer select-none">
        <div className="flex flex-col items-center justify-center relative" style={{ background: p.bg, aspectRatio: "3/4", padding: "32px 26px", opacity: fading ? 0 : 1, transition: "opacity 0.3s ease" }}>
          <div className="text-6xl mb-4">{p.emoji}</div>
          {p.isCover ? (
            <>
              <div className="font-display text-[24px] leading-[1.15] text-center whitespace-pre-line text-ink">{p.title}</div>
              <div className="text-xs text-warm-600 mt-2 italic">{p.sub}</div>
            </>
          ) : (
            <>
              <div className="text-[13px] leading-[1.75] text-warm-900 text-center">{p.text}</div>
              <div className="absolute bottom-3 right-4 text-[11px] text-warm-500">{page}/{SAMPLE.length - 1}</div>
            </>
          )}
        </div>
      </div>
      <div className="flex justify-center gap-1.5 mt-3">
        {SAMPLE.map((_, i) => <div key={i} onClick={() => go(i)} className={`h-1 rounded-full transition-all duration-300 cursor-pointer ${i === page ? "w-4 bg-accent" : "w-1.5 bg-warm-300"}`} />)}
      </div>
      <div className="text-center mt-2.5 text-xs text-warm-400">{page === 0 ? "Tap to read →" : page < SAMPLE.length - 1 ? "Tap →" : "✓ End of sample"}</div>
    </div>
  );
}

/* --- Reveal helper --- */
function reveal(vis, delay = 0) {
  return {
    opacity: vis ? 1 : 0,
    transform: vis ? "translateY(0)" : "translateY(40px)",
    transition: `opacity 0.8s ease ${delay}s, transform 0.8s ease ${delay}s`,
  };
}

export default function LandingPage() {
  const [loaded, setLoaded] = useState(false);
  const [heroRef, heroVis] = useReveal(0.1);
  const [stepsRef, stepsVis] = useReveal();
  const [bookRef, bookVis] = useReveal();
  const [ctaRef, ctaVis] = useReveal();

  useEffect(() => { setTimeout(() => setLoaded(true), 200); }, []);

  return (
    <div className="font-sans text-ink bg-cream min-h-screen overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,300;1,9..144,400&family=Outfit:wght@300;400;500;600&display=swap');
        ::selection { background: #C4703F; color: #FAF7F2; }
        @keyframes float { 0%, 100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-12px) rotate(-1deg); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .font-display { font-family: 'Fraunces', serif; }
        .font-body { font-family: 'Outfit', sans-serif; }
        .cta-primary::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent); background-size: 200% 100%; animation: shimmer 3s infinite; border-radius: inherit; }
      `}</style>

      {/* Grain */}
      <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.03]" style={{ background: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 py-5" style={{ background: "linear-gradient(180deg, rgba(250,247,242,0.95) 0%, rgba(250,247,242,0) 100%)" }}>
        <div className="font-display text-[22px] tracking-tight">
          <span className="opacity-30 font-light">tiny</span><span className="font-semibold">tales</span>
        </div>
        <Link href="/create" className="px-7 py-2.5 text-[13px] font-semibold font-body bg-ink text-cream rounded-full tracking-wide no-underline">
          Create a book
        </Link>
      </nav>

      {/* === HERO === */}
      <section ref={heroRef} className="min-h-screen flex items-center justify-center px-8 pt-28 pb-20 relative">
        {/* Decorative glows */}
        <div className="absolute top-[10%] right-[-5%] w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(196,112,63,0.06) 0%, transparent 70%)" }} />
        <div className="absolute bottom-[15%] left-[-8%] w-[300px] h-[300px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(196,112,63,0.04) 0%, transparent 70%)" }} />

        <div className="flex flex-col items-center max-w-[900px] w-full gap-12">
          {/* Badge */}
          <div style={reveal(heroVis, 0)} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-ink/[0.08] text-xs font-medium text-warm-600 tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
            Now creating personalized books
          </div>

          {/* Headline */}
          <h1 style={reveal(heroVis, 0.1)} className="font-display text-[clamp(40px,7vw,72px)] font-normal leading-[1.05] tracking-[-0.04em] text-center max-w-[750px]">
            Turn your child's story into a{" "}
            <span className="italic text-accent font-light relative">
              real book
              <svg className="absolute -bottom-1 left-0 w-full h-2" viewBox="0 0 200 8" fill="none">
                <path d="M2 6C50 2 150 2 198 6" stroke="#C4703F" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
              </svg>
            </span>
          </h1>

          {/* Subhead */}
          <p style={reveal(heroVis, 0.2)} className="text-[clamp(16px,2.5vw,20px)] leading-relaxed text-warm-600 text-center max-w-[520px] font-light">
            Write it yourself or let AI help. Illustrate it your way. Hold a printed hardcover in your hands — in minutes, not months.
          </p>

          {/* CTA */}
          <div style={reveal(heroVis, 0.3)} className="flex flex-col items-center gap-3">
            <Link href="/create" className="cta-primary relative px-12 py-[18px] text-base font-semibold font-body bg-ink text-cream rounded-full no-underline tracking-wide">
              Create your book →
            </Link>
            <span className="text-[13px] text-warm-400">Free to start · No account needed</span>
          </div>

          {/* 3D Book */}
          <div style={{ ...reveal(heroVis, 0.4), perspective: 1200 }}>
            <div className="w-[260px] h-[340px] relative" style={{ transformStyle: "preserve-3d", animation: "float 6s ease-in-out infinite" }}>
              <div className="absolute bottom-[-20px] left-[10%] right-[10%] h-10 blur-xl" style={{ background: "radial-gradient(ellipse, rgba(30,24,18,0.12) 0%, transparent 70%)" }} />
              <div className="absolute inset-0 rounded" style={{ background: "linear-gradient(135deg, #8B6F54, #6B5540)", transform: "translateZ(-16px)", boxShadow: "-4px 4px 16px rgba(30,24,18,0.2)" }} />
              <div className="absolute top-0 bottom-0 left-[-8px] w-4 rounded-l" style={{ background: "linear-gradient(90deg, #7B6348, #8B7358)", transformOrigin: "right center", transform: "rotateY(-90deg)" }} />
              <div className="absolute inset-0 rounded-r-lg flex flex-col items-center justify-center p-6" style={{ background: "linear-gradient(145deg, #F5EDE2 0%, #EDE5D8 100%)", boxShadow: "4px 6px 24px rgba(30,24,18,0.15), inset 0 1px 0 rgba(255,255,255,0.5)", border: "1px solid rgba(30,24,18,0.06)" }}>
                <div className="text-5xl mb-3">🌳</div>
                <div className="font-display text-lg leading-tight text-center text-ink tracking-tight">Your Child's Name<br />and the Whispering Forest</div>
                <div className="text-[10px] text-warm-400 mt-2 italic">A TinyTales Book</div>
                <div className="w-10 h-px mt-4" style={{ background: "linear-gradient(90deg, transparent, #C4A56B, transparent)" }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === HOW IT WORKS === */}
      <section ref={stepsRef} className="py-20 px-8 flex flex-col items-center">
        <div style={reveal(stepsVis)} className="text-[11px] font-semibold tracking-[0.15em] uppercase text-warm-400 mb-4">How it works</div>
        <h2 style={reveal(stepsVis, 0.1)} className="font-display text-[clamp(28px,4vw,40px)] font-normal tracking-tight text-center mb-14 max-w-[500px]">
          Three steps to a book they'll treasure forever
        </h2>

        <div className="flex gap-8 max-w-[900px] w-full flex-wrap justify-center">
          {[
            { num: "01", icon: "✍️", title: "Write the story", desc: "Type it yourself, paste from ChatGPT, or let our AI write it for you. Edit every word until it's perfect." },
            { num: "02", icon: "🎨", title: "Add illustrations", desc: "Generate watercolor illustrations with AI, or upload your own artwork. Mix and match however you like." },
            { num: "03", icon: "📖", title: "Print your book", desc: "Preview your finished book, then order a beautiful hardcover delivered to your door. Gift-ready." },
          ].map((step, i) => (
            <div key={i} style={reveal(stepsVis, 0.15 + i * 0.12)} className="flex-1 min-w-[260px] max-w-[280px] p-8 rounded-2xl bg-white border border-ink/[0.05] shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-[11px] font-semibold text-accent tracking-wide">{step.num}</span>
                <span className="text-[28px]">{step.icon}</span>
              </div>
              <h3 className="font-display text-xl font-normal tracking-tight mb-2">{step.title}</h3>
              <p className="text-sm leading-relaxed text-warm-600 font-light">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* === SAMPLE BOOK === */}
      <section ref={bookRef} className="py-16 px-8 flex flex-col items-center" style={{ background: "linear-gradient(180deg, transparent 0%, rgba(237,229,216,0.3) 50%, transparent 100%)" }}>
        <div style={reveal(bookVis)} className="text-[11px] font-semibold tracking-[0.15em] uppercase text-warm-400 mb-4">See it in action</div>
        <h2 style={reveal(bookVis, 0.1)} className="font-display text-[clamp(26px,4vw,36px)] font-normal tracking-tight text-center mb-3 max-w-[500px]">
          A sample story — made in 2 minutes
        </h2>
        <p style={reveal(bookVis, 0.15)} className="text-[15px] text-warm-600 text-center mb-10 font-light">
          Tap through to see what a TinyTales book feels like.
        </p>
        <div style={reveal(bookVis, 0.2)}>
          <MiniBook />
        </div>
      </section>

      {/* === STATS === */}
      <section className="py-12 px-8 flex justify-center gap-12 flex-wrap border-t border-b border-ink/[0.06]">
        {[
          { value: 2, suffix: " min", label: "Average creation time" },
          { value: 10, suffix: "+", label: "Pages per book" },
          { value: 39, suffix: ".99", label: "Per printed book", prefix: "$" },
        ].map((s, i) => (
          <div key={i} className="text-center min-w-[140px]">
            <div className="font-display text-4xl font-light tracking-tight text-ink">
              <Counter end={s.value} suffix={s.suffix} prefix={s.prefix || ""} />
            </div>
            <div className="text-xs text-warm-400 mt-1 font-medium tracking-wide">{s.label}</div>
          </div>
        ))}
      </section>

      {/* === USE CASES === */}
      <section className="py-20 px-8 flex flex-col items-center">
        <div className="text-[11px] font-semibold tracking-[0.15em] uppercase text-warm-400 mb-4">Made for moments that matter</div>
        <h2 className="font-display text-[clamp(26px,4vw,36px)] font-normal tracking-tight text-center mb-10 max-w-[480px]">
          A birthday gift they'll never forget
        </h2>
        <div className="flex gap-3 flex-wrap justify-center max-w-[700px]">
          {["🎂 Birthday gift", "👶 New baby", "🎄 Holiday present", "🎓 Graduation", "📚 Bedtime stories", "💛 Just because"].map((item, i) => (
            <div key={i} className="px-5 py-2.5 rounded-full border border-ink/[0.08] text-sm text-warm-700 bg-white">{item}</div>
          ))}
        </div>
      </section>

      {/* === FINAL CTA === */}
      <section ref={ctaRef} className="py-20 pb-28 px-8 flex flex-col items-center text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(196,112,63,0.05) 0%, transparent 60%)" }} />
        <h2 style={reveal(ctaVis)} className="font-display text-[clamp(32px,5vw,48px)] font-normal tracking-tight max-w-[550px] leading-[1.1] mb-4">
          Every child deserves to be the{" "}
          <span className="italic text-accent">main character</span>
        </h2>
        <p style={reveal(ctaVis, 0.1)} className="text-base text-warm-600 mb-8 font-light">
          Create a book they'll ask you to read again and again.
        </p>
        <Link href="/create" style={reveal(ctaVis, 0.2)} className="cta-primary relative px-12 py-[18px] text-base font-semibold font-body bg-ink text-cream rounded-full no-underline">
          Start creating →
        </Link>
      </section>

      {/* Footer */}
      <footer className="px-8 py-6 border-t border-ink/[0.06] flex justify-between items-center text-xs text-warm-400">
        <div className="font-display text-base">
          <span className="opacity-30">tiny</span>tales
        </div>
        <div className="flex gap-6">
          <Link href="/privacy" className="text-warm-400 no-underline hover:text-warm-600 transition-colors">Privacy</Link>
          <span>© 2026</span>
        </div>
      </footer>
    </div>
  );
}
