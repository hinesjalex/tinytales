"use client";

import { useState, useRef, useEffect } from "react";

export default function NameGate({ onSubmit }) {
  const [name, setName] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = () => {
    if (name.trim()) onSubmit(name.trim());
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="text-6xl mb-6">📖</div>
      <h1 className="font-serif text-[clamp(32px,7vw,48px)] font-normal leading-[1.1] tracking-tight mb-3">
        What's your child's <span className="italic text-accent">first name</span>?
      </h1>
      <p className="text-base text-warm-600 mb-8 leading-relaxed">
        We'll create a sample story — just for them.
      </p>
      <div className="flex gap-2.5 w-full max-w-[360px]">
        <input
          ref={inputRef}
          type="text"
          placeholder="e.g. Leo, Ava, Noah…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          maxLength={20}
          className={`flex-1 px-4 py-3.5 text-[17px] rounded-xl bg-white outline-none border-2 transition-colors ${
            focused ? "border-accent" : "border-warm-200"
          }`}
        />
        <button
          onClick={submit}
          className={`px-6 py-3.5 text-[15px] font-semibold rounded-xl bg-ink text-cream transition-opacity ${
            name.trim() ? "opacity-100" : "opacity-40"
          }`}
        >
          Go
        </button>
      </div>
      <p className="text-xs text-warm-400 mt-3.5">
        No account needed · completely free
      </p>
    </section>
  );
}
