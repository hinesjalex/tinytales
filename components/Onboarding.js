"use client";

import { useState, useMemo } from "react";

const AGES = [2, 3, 4, 5, 6, 7, 8, 9];

const PLACEHOLDERS = (name) => [
  `I want to teach ${name} about patience`,
  `A cowboy adventure on a Montana ranch`,
  `${name} is nervous about starting kindergarten`,
  `A summer baseball story with neighborhood kids`,
  `Why we share with our little sister`,
  `A space mission where ${name} saves the crew`,
  `${name} learns why it's important to listen`,
  `An underwater treasure hunt with friendly dolphins`,
];

const THEMES = [
  { id: "courage", emoji: "🦁", label: "Being brave", fill: "A story about facing fears and finding inner strength" },
  { id: "kindness", emoji: "💛", label: "Kindness", fill: "A story about helping others and making friends" },
  { id: "newsibling", emoji: "👶", label: "New sibling", fill: "A story about welcoming a new baby brother or sister" },
  { id: "firstday", emoji: "🎒", label: "First day", fill: "A story about starting school or trying something new" },
  { id: "adventure", emoji: "🗺️", label: "Big adventure", fill: "A story about exploring the unknown and discovering something magical" },
];

function StepBar({ current, total }) {
  return (
    <div className="flex gap-2 mb-8 justify-center">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1 rounded-full flex-1 max-w-[60px] transition-all duration-300 ${
            i < current ? "bg-accent/40" : i === current ? "bg-accent" : "bg-warm-200"
          }`}
        />
      ))}
    </div>
  );
}

export default function Onboarding({ name, data, setData, onComplete, onBack }) {
  const [step, setStep] = useState(0);
  const placeholder = useMemo(() => {
    const opts = PLACEHOLDERS(name);
    return opts[Math.floor(Math.random() * opts.length)];
  }, [name]);

  const handleNext = () => {
    if (step === 0 && data.age) {
      setStep(1);
    } else if (step === 1 && data.customStory?.trim()) {
      onComplete({ ...data, theme: "custom" });
    }
  };

  const handleBack = () => {
    if (step === 0) onBack();
    else setStep(step - 1);
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="w-full max-w-[380px]">
        <StepBar current={step} total={2} />

        {step === 0 && (
          <>
            <h2 className="font-serif text-[26px] tracking-tight mb-1.5">
              How old is {name}?
            </h2>
            <p className="text-sm text-warm-600 mb-7">
              We'll match the story to their reading level.
            </p>
            <div className="flex flex-wrap gap-2.5 justify-center mb-6">
              {AGES.map((a) => (
                <button
                  key={a}
                  onClick={() => setData((d) => ({ ...d, age: a }))}
                  className={`px-[18px] py-2.5 rounded-[10px] text-[15px] font-medium border-2 transition-all ${
                    data.age === a
                      ? "border-accent bg-accent-light text-accent"
                      : "border-warm-200 bg-white text-ink"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2 className="font-serif text-[26px] tracking-tight mb-1.5">
              What should {name}'s story be about?
            </h2>
            <p className="text-sm text-warm-600 mb-5">
              Describe any story — a lesson, an adventure, a situation your family is navigating.
            </p>
            <textarea
              className="w-full p-4 text-[15px] leading-relaxed rounded-xl border-2 border-warm-200 bg-white outline-none resize-y min-h-[100px] focus:border-accent transition-colors mb-5"
              placeholder={placeholder}
              value={data.customStory || ""}
              onChange={(e) => setData((d) => ({ ...d, customStory: e.target.value }))}
              maxLength={500}
              autoFocus
            />
            <div className="text-xs text-warm-500 mb-3 text-left">Or pick an idea to get started:</div>
            <div className="flex flex-wrap gap-2 mb-6">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setData((d) => ({ ...d, customStory: t.fill }))}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] border transition-all ${
                    data.customStory === t.fill
                      ? "border-accent bg-accent-light text-accent font-medium"
                      : "border-warm-200 bg-white text-warm-700"
                  }`}
                >
                  <span>{t.emoji}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </>
        )}

        <button
          onClick={handleNext}
          className={`w-full py-4 rounded-[14px] text-base font-semibold transition-all ${
            (step === 0 && data.age) || (step === 1 && data.customStory?.trim())
              ? "bg-ink text-cream"
              : "bg-warm-200 text-warm-500 cursor-default"
          }`}
        >
          {step === 1 ? `Create ${name}'s book →` : "Continue"}
        </button>

        <button
          onClick={handleBack}
          className="mt-3 text-sm text-warm-600 bg-transparent border-none cursor-pointer"
        >
          ← Back
        </button>
      </div>
    </section>
  );
}
