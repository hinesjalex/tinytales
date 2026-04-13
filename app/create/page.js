"use client";

import { useState, useRef } from "react";
import Link from "next/link";

const MAX_PAGES = 20;

function emptyPage(num) {
  return { id: crypto.randomUUID(), pageNumber: num, text: "", illustrationHint: "", imageUrl: null };
}

function initialBook() {
  return Array.from({ length: 8 }, (_, i) => emptyPage(i + 1));
}

/* ============================================================
   SETUP SCREEN — minimal: name + how to start
   ============================================================ */
function SetupScreen({ onStart }) {
  const [name, setName] = useState("");
  const [focused, setFocused] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <Link href="/" className="absolute top-5 left-6 font-display text-xl tracking-tight no-underline text-ink">
        <span className="opacity-30 font-light">tiny</span><span className="font-semibold">tales</span>
      </Link>

      <div className="text-5xl mb-6">📖</div>
      <h1 className="font-display text-[clamp(28px,6vw,40px)] font-normal leading-tight tracking-tight mb-3">
        Who is this book for?
      </h1>
      <p className="text-sm text-warm-600 mb-8 font-light">
        Enter the child's first name to get started.
      </p>
      <div className="flex gap-2.5 w-full max-w-[360px]">
        <input
          type="text"
          placeholder="e.g. Leo, Ava, Noah…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) onStart(name.trim()); }}
          maxLength={20}
          autoFocus
          className={`flex-1 px-4 py-3.5 text-[17px] rounded-xl bg-white outline-none border-2 transition-colors font-body ${focused ? "border-accent" : "border-warm-200"}`}
        />
        <button
          onClick={() => { if (name.trim()) onStart(name.trim()); }}
          className={`px-6 py-3.5 text-[15px] font-semibold rounded-xl bg-ink text-cream transition-opacity font-body ${name.trim() ? "opacity-100" : "opacity-40"}`}
        >
          Start
        </button>
      </div>

      <div className="flex gap-3 mt-10">
        {[
          { icon: "✨", label: "AI helps write", desc: "Describe your story idea" },
          { icon: "✍️", label: "Write your own", desc: "Type or paste text" },
          { icon: "📋", label: "Paste from AI", desc: "From ChatGPT, Gemini, etc." },
        ].map((opt, i) => (
          <div key={i} className="px-4 py-3 rounded-xl border border-ink/[0.06] bg-white text-center min-w-[110px]">
            <div className="text-xl mb-1">{opt.icon}</div>
            <div className="text-xs font-semibold text-ink">{opt.label}</div>
            <div className="text-[10px] text-warm-500 mt-0.5">{opt.desc}</div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-warm-400 mt-3">You'll choose how to create on the next screen</p>
    </div>
  );
}

/* ============================================================
   START MODE PICKER — AI assist or blank editor
   ============================================================ */
function StartModePicker({ name, onSelectMode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h2 className="font-display text-2xl tracking-tight mb-2">
        How would you like to start <span className="text-accent italic">{name}</span>'s book?
      </h2>
      <p className="text-sm text-warm-600 mb-8 font-light">You can always switch later.</p>

      <div className="flex flex-col gap-4 w-full max-w-[400px]">
        <button onClick={() => onSelectMode("ai")} className="flex items-start gap-4 p-5 rounded-2xl border-2 border-ink/[0.06] bg-white text-left hover:border-accent transition-colors group">
          <span className="text-3xl mt-0.5">✨</span>
          <div>
            <div className="font-semibold text-[15px] group-hover:text-accent transition-colors">Help me write a story</div>
            <div className="text-sm text-warm-600 font-light mt-1">Describe what you want and AI generates the full story. You can edit everything after.</div>
          </div>
        </button>

        <button onClick={() => onSelectMode("blank")} className="flex items-start gap-4 p-5 rounded-2xl border-2 border-ink/[0.06] bg-white text-left hover:border-accent transition-colors group">
          <span className="text-3xl mt-0.5">✍️</span>
          <div>
            <div className="font-semibold text-[15px] group-hover:text-accent transition-colors">I'll write my own</div>
            <div className="text-sm text-warm-600 font-light mt-1">Start with blank pages. Type your story or paste text from anywhere — ChatGPT, Google Docs, your imagination.</div>
          </div>
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   AI STORY GENERATOR — describe → generate → fills pages
   ============================================================ */
function AIStoryGenerator({ name, onStoryGenerated, onBack }) {
  const [age, setAge] = useState(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const PLACEHOLDERS = [
    `I want to teach ${name} about patience`,
    `A cowboy adventure on a Montana ranch`,
    `${name} is nervous about starting kindergarten`,
    `A summer baseball story with neighborhood kids`,
    `Why we share with our little sister`,
    `A space mission where ${name} saves the crew`,
  ];
  const placeholder = useRef(PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)]).current;

  const generate = async () => {
    if (!age || !description.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, age, theme: "custom", customStory: description }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Generation failed");
      }

      const result = await res.json();
      onStoryGenerated(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-[420px]">
        <button onClick={onBack} className="text-sm text-warm-500 mb-6 font-body">← Back</button>

        <h2 className="font-display text-2xl tracking-tight mb-6">Tell us about {name}'s story</h2>

        {/* Age */}
        <label className="text-xs font-semibold text-warm-500 uppercase tracking-widest mb-2 block">Age</label>
        <div className="flex flex-wrap gap-2 mb-6">
          {[2,3,4,5,6,7,8,9].map((a) => (
            <button key={a} onClick={() => setAge(a)} className={`px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all ${age === a ? "border-accent bg-accent-light text-accent" : "border-warm-200 bg-white text-ink"}`}>
              {a}
            </button>
          ))}
        </div>

        {/* Story description */}
        <label className="text-xs font-semibold text-warm-500 uppercase tracking-widest mb-2 block">What should the story be about?</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={placeholder}
          maxLength={500}
          className="w-full p-4 text-[15px] leading-relaxed rounded-xl border-2 border-warm-200 bg-white outline-none resize-y min-h-[100px] focus:border-accent transition-colors mb-6 font-body"
        />

        {error && <div className="text-sm text-red-500 mb-4">{error}</div>}

        <button
          onClick={generate}
          disabled={!age || !description.trim() || loading}
          className={`w-full py-4 rounded-xl text-base font-semibold transition-all font-body ${
            age && description.trim() && !loading ? "bg-ink text-cream" : "bg-warm-200 text-warm-500"
          }`}
        >
          {loading ? "Writing the story…" : `Generate ${name}'s story →`}
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   PAGE EDITOR — single page with text + illustration
   ============================================================ */
function PageEditor({ page, pageIndex, totalPages, onChange, onDelete, onAddAfter, onMoveUp, onMoveDown }) {
  const fileRef = useRef(null);
  const [showIllustrationOptions, setShowIllustrationOptions] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange({ ...page, imageUrl: ev.target.result });
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white rounded-2xl border border-ink/[0.06] overflow-hidden shadow-sm">
      {/* Page header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-cream/50 border-b border-ink/[0.04]">
        <span className="text-xs font-semibold text-warm-500">Page {pageIndex + 1}</span>
        <div className="flex items-center gap-1">
          {pageIndex > 0 && <button onClick={onMoveUp} className="p-1 text-warm-400 hover:text-ink text-xs">↑</button>}
          {pageIndex < totalPages - 1 && <button onClick={onMoveDown} className="p-1 text-warm-400 hover:text-ink text-xs">↓</button>}
          <button onClick={onAddAfter} className="p-1 text-warm-400 hover:text-accent text-xs" title="Add page after">+</button>
          {totalPages > 1 && <button onClick={onDelete} className="p-1 text-warm-400 hover:text-red-500 text-xs" title="Delete page">×</button>}
        </div>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Illustration zone */}
        <div className="md:w-[45%] p-4 border-b md:border-b-0 md:border-r border-ink/[0.04]">
          {page.imageUrl ? (
            <div className="relative group">
              <img src={page.imageUrl} alt="" className="w-full aspect-square object-cover rounded-xl" />
              <button onClick={() => onChange({ ...page, imageUrl: null })} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
            </div>
          ) : (
            <div className="w-full aspect-square rounded-xl border-2 border-dashed border-warm-200 flex flex-col items-center justify-center cursor-pointer bg-cream/30 hover:border-accent transition-colors" onClick={() => setShowIllustrationOptions(!showIllustrationOptions)}>
              <div className="text-3xl mb-2 opacity-40">🎨</div>
              <div className="text-xs text-warm-500 font-medium">Add illustration</div>
              <div className="text-[10px] text-warm-400 mt-0.5">Upload or generate with AI</div>
            </div>
          )}

          {showIllustrationOptions && !page.imageUrl && (
            <div className="flex gap-2 mt-3">
              <button onClick={() => fileRef.current?.click()} className="flex-1 py-2 text-xs font-semibold rounded-lg border border-warm-200 hover:border-accent transition-colors">
                📁 Upload
              </button>
              <button className="flex-1 py-2 text-xs font-semibold rounded-lg border border-warm-200 hover:border-accent transition-colors opacity-50" title="Coming after story is complete">
                ✨ Generate
              </button>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </div>

        {/* Text zone */}
        <div className="md:w-[55%] p-4">
          <textarea
            value={page.text}
            onChange={(e) => onChange({ ...page, text: e.target.value })}
            placeholder="Write this page's text…"
            className="w-full h-full min-h-[180px] text-[15px] leading-relaxed text-warm-800 bg-transparent outline-none resize-none font-body placeholder:text-warm-300"
          />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   BOOK EDITOR — all pages, toolbar, preview toggle
   ============================================================ */
function BookEditor({ name, pages, setPages, onPreview }) {
  const renumber = (pgs) => pgs.map((p, i) => ({ ...p, pageNumber: i + 1 }));

  const updatePage = (idx, updated) => {
    const next = [...pages];
    next[idx] = updated;
    setPages(next);
  };

  const deletePage = (idx) => {
    if (pages.length <= 1) return;
    setPages(renumber(pages.filter((_, i) => i !== idx)));
  };

  const addPageAfter = (idx) => {
    if (pages.length >= MAX_PAGES) return;
    const next = [...pages];
    next.splice(idx + 1, 0, emptyPage(0));
    setPages(renumber(next));
  };

  const movePage = (idx, dir) => {
    const next = [...pages];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setPages(renumber(next));
  };

  const hasContent = pages.some((p) => p.text.trim());

  return (
    <div className="min-h-screen bg-cream/50">
      {/* Toolbar */}
      <div className="sticky top-0 z-40 bg-cream/95 backdrop-blur border-b border-ink/[0.06] px-6 py-3 flex items-center justify-between">
        <div className="font-display text-lg tracking-tight">
          <span className="opacity-30 font-light">tiny</span><span className="font-semibold">tales</span>
          <span className="text-warm-400 text-sm ml-3 font-body font-light">{name}'s book · {pages.length} pages</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onPreview}
            disabled={!hasContent}
            className={`px-5 py-2 text-sm font-semibold rounded-full font-body transition-all ${
              hasContent ? "bg-accent text-cream" : "bg-warm-200 text-warm-400"
            }`}
          >
            Preview book →
          </button>
        </div>
      </div>

      {/* Pages */}
      <div className="max-w-[700px] mx-auto px-6 py-8 flex flex-col gap-4">
        {/* Bulk paste option */}
        <BulkPasteBar pages={pages} setPages={setPages} name={name} />

        {pages.map((page, idx) => (
          <PageEditor
            key={page.id}
            page={page}
            pageIndex={idx}
            totalPages={pages.length}
            onChange={(updated) => updatePage(idx, updated)}
            onDelete={() => deletePage(idx)}
            onAddAfter={() => addPageAfter(idx)}
            onMoveUp={() => movePage(idx, -1)}
            onMoveDown={() => movePage(idx, 1)}
          />
        ))}

        {pages.length < MAX_PAGES && (
          <button onClick={() => addPageAfter(pages.length - 1)} className="w-full py-4 rounded-2xl border-2 border-dashed border-warm-200 text-warm-400 text-sm font-medium hover:border-accent hover:text-accent transition-colors">
            + Add a page
          </button>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   BULK PASTE BAR — paste a full story, auto-split into pages
   ============================================================ */
function BulkPasteBar({ pages, setPages, name }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");

  const splitAndFill = () => {
    if (!text.trim()) return;

    // Split by double newlines, or fall back to paragraphs
    let chunks = text.split(/\n\n+/).map((c) => c.trim()).filter(Boolean);

    // If only one chunk, try splitting by single newlines
    if (chunks.length <= 1) {
      chunks = text.split(/\n+/).map((c) => c.trim()).filter(Boolean);
    }

    // If still one chunk and it's long, split by sentences (~2-3 per page)
    if (chunks.length <= 1 && text.length > 200) {
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      chunks = [];
      for (let i = 0; i < sentences.length; i += 2) {
        chunks.push(sentences.slice(i, i + 2).join(" ").trim());
      }
    }

    const newPages = chunks.slice(0, MAX_PAGES).map((chunk, i) => ({
      id: crypto.randomUUID(),
      pageNumber: i + 1,
      text: chunk,
      illustrationHint: "",
      imageUrl: null,
    }));

    setPages(newPages);
    setOpen(false);
    setText("");
  };

  return (
    <div className="mb-4">
      {!open ? (
        <button onClick={() => setOpen(true)} className="text-sm text-warm-500 hover:text-accent transition-colors font-body">
          📋 Paste a full story to auto-fill pages
        </button>
      ) : (
        <div className="bg-white rounded-2xl border border-ink/[0.06] p-5">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold">Paste your story</span>
            <button onClick={() => setOpen(false)} className="text-xs text-warm-400">Cancel</button>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Paste ${name}'s story here. Separate pages with blank lines, or we'll split it for you automatically…`}
            className="w-full min-h-[150px] text-[14px] leading-relaxed p-3 rounded-xl border border-warm-200 outline-none resize-y font-body focus:border-accent transition-colors"
            autoFocus
          />
          <button
            onClick={splitAndFill}
            disabled={!text.trim()}
            className={`mt-3 w-full py-3 rounded-xl text-sm font-semibold font-body transition-all ${text.trim() ? "bg-ink text-cream" : "bg-warm-200 text-warm-400"}`}
          >
            Split into pages →
          </button>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   BOOK PREVIEW — swipeable reader
   ============================================================ */
function BookPreview({ name, title, pages, onBack, onFinish }) {
  const [i, setI] = useState(0);
  const [fading, setFading] = useState(false);
  const [editTitle, setEditTitle] = useState(false);
  const [titleVal, setTitleVal] = useState(title);

  const filledPages = pages.filter((p) => p.text.trim());
  const allPages = [{ isCover: true }, ...filledPages];
  const total = allPages.length;
  const current = allPages[i];

  const go = (to) => {
    if (fading || to < 0 || to >= total) return;
    setFading(true);
    setTimeout(() => { setI(to); setFading(false); }, 250);
  };

  const PAGE_COLORS = [
    "#E8F5E2", "#FFF8E7", "#FDE8D0", "#E8E0F5", "#FFF4D6",
    "#E2F0F5", "#F5E8E2", "#E8F5EC", "#F5F0E1", "#FDEBD3",
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 bg-cream">
      {/* Top bar */}
      <div className="w-full max-w-[400px] flex justify-between items-center mb-6">
        <button onClick={onBack} className="text-sm text-warm-500 font-body">← Edit pages</button>
        <button onClick={() => onFinish(titleVal)} className="px-5 py-2 text-sm font-semibold rounded-full bg-accent text-cream font-body">
          Finish →
        </button>
      </div>

      {/* Title */}
      {editTitle ? (
        <div className="flex gap-2 items-center mb-4">
          <input value={titleVal} onChange={(e) => setTitleVal(e.target.value)} className="px-3 py-2 text-lg font-display rounded-lg border-2 border-accent bg-white outline-none" autoFocus />
          <button onClick={() => setEditTitle(false)} className="text-sm font-semibold bg-ink text-cream px-3 py-2 rounded-lg font-body">Save</button>
        </div>
      ) : (
        <div onClick={() => setEditTitle(true)} className="font-display text-xl tracking-tight mb-6 cursor-pointer hover:text-accent transition-colors group">
          {titleVal} <span className="text-warm-400 text-xs opacity-0 group-hover:opacity-100 ml-1">✎</span>
        </div>
      )}

      {/* Book */}
      <div className="w-full max-w-[340px]">
        <div className="rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(30,24,18,0.15),0_4px_12px_rgba(30,24,18,0.06)] cursor-pointer select-none" onClick={() => go(i + 1)}>
          <div className="flex flex-col items-center justify-center relative" style={{ aspectRatio: "3/4", opacity: fading ? 0 : 1, transition: "opacity 0.3s ease", overflow: "hidden" }}>
            {/* Background: image or color */}
            {current.imageUrl ? (
              <img src={current.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0" style={{ background: PAGE_COLORS[i % PAGE_COLORS.length] }} />
            )}

            {/* Content */}
            <div className={`relative z-10 flex flex-col items-center justify-center h-full w-full p-8 ${current.imageUrl ? "bg-gradient-to-t from-black/60 via-black/20 to-transparent justify-end" : ""}`}>
              {current.isCover ? (
                <>
                  <div className={`font-display text-[26px] leading-[1.15] tracking-tight text-center ${current.imageUrl ? "text-white drop-shadow-lg mt-auto" : ""}`}>
                    {titleVal}
                  </div>
                  <div className={`text-[13px] mt-2.5 italic ${current.imageUrl ? "text-white/80" : "text-warm-600"}`}>
                    A story made just for {name}
                  </div>
                </>
              ) : (
                <>
                  <div className={`text-[15px] leading-[1.7] text-center ${current.imageUrl ? "text-white drop-shadow" : "text-warm-900"}`}>
                    {current.text}
                  </div>
                  <div className={`absolute bottom-3.5 right-5 text-[11px] ${current.imageUrl ? "text-white/50" : "text-warm-500"}`}>
                    {i}/{total - 1}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-1 mt-3 flex-wrap max-w-[300px] mx-auto">
          {allPages.map((_, j) => (
            <div key={j} onClick={() => go(j)} className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${j === i ? "w-[14px] bg-accent" : "w-1.5 bg-warm-300"}`} />
          ))}
        </div>
        <div className="text-center mt-3 text-[13px] text-warm-500">
          {i === 0 ? "Tap to start →" : i < total - 1 ? "Tap →" : "✓ End"}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   FINISH SCREEN — share + print CTA
   ============================================================ */
function FinishScreen({ name, title, shareId, onMakeAnother }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/book/${shareId}` : `/book/${shareId}`;

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title, text: `Read ${name}'s storybook!`, url: shareUrl }); } catch {}
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 text-center bg-cream">
      <div className="text-5xl mb-4">🎉</div>
      <h2 className="font-display text-3xl tracking-tight mb-2">{name}'s book is ready</h2>
      <p className="text-sm text-warm-600 font-light mb-8">Share it with family or order a printed copy.</p>

      <div className="flex flex-col gap-3 w-full max-w-[320px]">
        <button onClick={handleShare} className="w-full py-4 rounded-xl text-base font-semibold bg-accent text-cream font-body">
          {copied ? "Link copied!" : "Send to family"}
        </button>
        <button className="w-full py-4 rounded-xl text-base font-semibold bg-ink text-cream font-body opacity-70 cursor-not-allowed" title="Coming soon">
          🖨️ Print hardcover — coming soon
        </button>
        <button onClick={onMakeAnother} className="text-sm text-warm-500 mt-4 font-body">
          ← Make another book
        </button>
      </div>

      <p className="text-xs text-warm-400 mt-6">
        Read on iPad · Share the link · Treasure it forever
      </p>
    </div>
  );
}

/* ============================================================
   MAIN CREATE PAGE — orchestrates the flow
   ============================================================ */
export default function CreatePage() {
  const [phase, setPhase] = useState("setup"); // setup | pick_mode | ai_gen | editor | preview | finish
  const [name, setName] = useState("");
  const [pages, setPages] = useState(initialBook());
  const [title, setTitle] = useState("");
  const [shareId, setShareId] = useState(null);

  // Setup → mode picker
  const handleStart = (childName) => {
    setName(childName);
    setTitle(`${childName}'s Story`);
    setPhase("pick_mode");
  };

  // AI story generated → fill pages and go to editor
  const handleStoryGenerated = (result) => {
    setTitle(result.title);
    const newPages = result.pages.map((p, i) => ({
      id: crypto.randomUUID(),
      pageNumber: i + 1,
      text: p.text,
      illustrationHint: p.illustrationHint || "",
      imageUrl: null,
    }));
    setPages(newPages);
    setPhase("editor");
  };

  // Finish → save book
  const handleFinish = async (finalTitle) => {
    setTitle(finalTitle);

    try {
      const res = await fetch("/api/save-book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          age: 5,
          theme: "custom",
          title: finalTitle,
          pages: pages.filter((p) => p.text.trim()),
        }),
      });

      if (res.ok) {
        const result = await res.json();
        setShareId(result.shareId);
      }
    } catch {}

    setPhase("finish");
  };

  return (
    <main className="min-h-screen font-body">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,600;0,9..144,700;1,9..144,300;1,9..144,400&family=Outfit:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Fraunces', serif; }
        .font-body { font-family: 'Outfit', sans-serif; }
      `}</style>

      {phase === "setup" && <SetupScreen onStart={handleStart} />}

      {phase === "pick_mode" && (
        <StartModePicker
          name={name}
          onSelectMode={(mode) => {
            if (mode === "ai") setPhase("ai_gen");
            else setPhase("editor");
          }}
        />
      )}

      {phase === "ai_gen" && (
        <AIStoryGenerator
          name={name}
          onStoryGenerated={handleStoryGenerated}
          onBack={() => setPhase("pick_mode")}
        />
      )}

      {phase === "editor" && (
        <BookEditor
          name={name}
          pages={pages}
          setPages={setPages}
          onPreview={() => setPhase("preview")}
        />
      )}

      {phase === "preview" && (
        <BookPreview
          name={name}
          title={title}
          pages={pages}
          onBack={() => setPhase("editor")}
          onFinish={handleFinish}
        />
      )}

      {phase === "finish" && (
        <FinishScreen
          name={name}
          title={title}
          shareId={shareId}
          onMakeAnother={() => {
            setPages(initialBook());
            setTitle("");
            setShareId(null);
            setPhase("setup");
          }}
        />
      )}
    </main>
  );
}
