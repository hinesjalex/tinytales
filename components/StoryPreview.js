"use client";

import { useState } from "react";

const PAGE_COLORS = [
  "#E8F5E2", "#FFF8E7", "#FDE8D0", "#E8E0F5", "#FFF4D6",
  "#E2F0F5", "#F5E8E2", "#E8F5EC", "#F5F0E1", "#FDEBD3",
  "#F0E8F8", "#FFEAB8", "#E1EFF5", "#F5E1D8", "#E1F5E8",
  "#F5F0E1", "#FDE8D0",
];

export default function StoryPreview({
  title,
  pages,
  childName,
  onApprove,
  onRegenerate,
  onUpdatePage,
  onUpdateTitle,
  loading,
}) {
  const [editingPage, setEditingPage] = useState(null);
  const [editText, setEditText] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleText, setTitleText] = useState(title);

  const startEditPage = (idx) => {
    setEditingPage(idx);
    setEditText(pages[idx].text);
  };

  const saveEditPage = (idx) => {
    onUpdatePage(idx, editText);
    setEditingPage(null);
  };

  const startEditTitle = () => {
    setEditingTitle(true);
    setTitleText(title);
  };

  const saveEditTitle = () => {
    onUpdateTitle(titleText);
    setEditingTitle(false);
  };

  return (
    <section className="min-h-screen flex flex-col items-center px-6 py-12">
      <div className="w-full max-w-[480px]">
        <div className="text-center mb-8">
          <div className="text-xs text-warm-400 font-semibold uppercase tracking-widest mb-2">
            Story Preview
          </div>
          <h2 className="font-serif text-2xl tracking-tight mb-2">
            Here's {childName}'s story
          </h2>
          <p className="text-sm text-warm-600 leading-relaxed">
            Read through it. Tap any page to edit the text, or regenerate for a
            completely new story.
          </p>
        </div>

        {/* Title */}
        <div className="mb-4">
          {editingTitle ? (
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={titleText}
                onChange={(e) => setTitleText(e.target.value)}
                className="flex-1 px-3 py-2 text-lg font-serif rounded-lg border-2 border-accent bg-white outline-none"
                autoFocus
              />
              <button
                onClick={saveEditTitle}
                className="px-3 py-2 text-sm font-semibold bg-ink text-cream rounded-lg"
              >
                Save
              </button>
            </div>
          ) : (
            <div
              className="font-serif text-xl tracking-tight text-center cursor-pointer hover:text-accent transition-colors group"
              onClick={startEditTitle}
            >
              {title}
              <span className="text-xs text-warm-400 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                ✎
              </span>
            </div>
          )}
        </div>

        {/* Pages */}
        <div className="flex flex-col gap-3">
          {pages.map((page, idx) => (
            <div
              key={idx}
              className="rounded-xl overflow-hidden shadow-sm border border-warm-200"
            >
              {/* Page header */}
              <div
                className="px-4 py-2 flex items-center justify-between"
                style={{ background: PAGE_COLORS[idx % PAGE_COLORS.length] }}
              >
                <span className="text-xs font-semibold text-warm-700">
                  Page {page.pageNumber}
                </span>
                {editingPage !== idx && (
                  <button
                    onClick={() => startEditPage(idx)}
                    className="text-xs text-warm-500 hover:text-accent transition-colors"
                  >
                    ✎ Edit
                  </button>
                )}
              </div>

              {/* Page content */}
              <div className="px-4 py-3 bg-white">
                {editingPage === idx ? (
                  <div>
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full p-2 text-[14px] leading-relaxed rounded-lg border-2 border-accent bg-white outline-none resize-y min-h-[80px]"
                      autoFocus
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => saveEditPage(idx)}
                        className="px-3 py-1.5 text-xs font-semibold bg-ink text-cream rounded-lg"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingPage(null)}
                        className="px-3 py-1.5 text-xs text-warm-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-[14px] leading-relaxed text-warm-800">
                    {page.text}
                  </p>
                )}
              </div>

              {/* Illustration hint (subtle) */}
              <div className="px-4 py-2 bg-warm-100/50 border-t border-warm-200">
                <p className="text-[11px] text-warm-400 italic">
                  🎨 {page.illustrationHint}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <button
            onClick={onApprove}
            disabled={loading}
            className={`w-full py-4 rounded-xl text-base font-semibold transition-all ${
              loading
                ? "bg-warm-200 text-warm-500"
                : "bg-accent text-cream hover:scale-[1.02]"
            }`}
          >
            {loading ? "Working…" : "Story looks great → Preview illustrations"}
          </button>

          <button
            onClick={onRegenerate}
            disabled={loading}
            className="text-sm text-warm-500 underline"
          >
            Regenerate a completely new story
          </button>
        </div>
      </div>
    </section>
  );
}
