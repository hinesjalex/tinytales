"use client";

import { useState, useEffect, useRef } from "react";
import NameGate from "@/components/NameGate";
import SampleBook from "@/components/SampleBook";
import Onboarding from "@/components/Onboarding";
import GeneratingScreen from "@/components/GeneratingScreen";
import BookReaderClient from "@/components/BookReaderClient";

import ErrorMessage from "@/components/ErrorMessage";

export default function Home() {
  const [name, setName] = useState(null);
  const [phase, setPhase] = useState("gate"); // gate | sample | onboarding | generating | error | done
  const [bookDone, setBookDone] = useState(false);
  const [data, setData] = useState({ age: null, theme: null, customStory: "" });
  const [book, setBook] = useState(null);
  const [error, setError] = useState(null);
  const [visible, setVisible] = useState(false);
  const [lastGenerateData, setLastGenerateData] = useState(null);

  const sampleRef = useRef(null);
  const onboardRef = useRef(null);
  const genRef = useRef(null);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const handleName = (n) => {
    setName(n);
    setPhase("sample");
    setTimeout(() => {
      sampleRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  const startOnboarding = () => {
    setPhase("onboarding");
    setTimeout(() => {
      onboardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleGenerate = async (finalData) => {
    setPhase("generating");
    setError(null);
    setBook(null);
    setLastGenerateData(finalData);
    setTimeout(() => {
      genRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 180000); // 3 min timeout

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          age: finalData.age,
          theme: finalData.theme,
          customStory: finalData.customStory,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        let errorMsg = "Generation failed";
        try {
          const err = await res.json();
          errorMsg = err.error || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }

      const result = await res.json();
      setBook(result);
    } catch (err) {
      if (err.name === "AbortError") {
        setError("This is taking longer than expected. Please try again.");
      } else if (!navigator.onLine) {
        setError("You appear to be offline. Check your connection and try again.");
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
      setPhase("error");
    }
  };

  const handleRetry = () => {
    if (lastGenerateData) {
      handleGenerate(lastGenerateData);
    } else {
      setPhase("onboarding");
    }
  };

  const handleGenerationDone = () => {
    if (book) setPhase("done");
  };

  return (
    <main className="min-h-screen">
      {/* Logo */}
      <div className="fixed top-5 left-6 z-50 font-serif text-xl tracking-tight">
        <span className="opacity-35">tiny</span>tales
      </div>

      {/* Phase: Name Gate */}
      {phase === "gate" && (
        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(16px)",
            transition: "all 0.7s ease",
          }}
        >
          <NameGate onSubmit={handleName} />
        </div>
      )}

      {/* Phase: Sample Book */}
      {phase === "sample" && name && (
        <div ref={sampleRef} className="animate-fade-up">
          <section className="min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center">
            <h2 className="font-serif text-2xl tracking-tight mb-1">
              A taste of{" "}
              <span className="text-accent italic">{name}</span>'s story
            </h2>
            <p className="text-sm text-warm-600 mb-6">
              Tap through — this is what the book feels like.
            </p>
            <SampleBook name={name} onFinished={() => setBookDone(true)} />
            <button
              onClick={startOnboarding}
              className={`mt-8 px-9 py-4 rounded-full text-base font-semibold transition-all duration-300 ${
                bookDone
                  ? "bg-accent text-cream scale-[1.03] shadow-lg shadow-accent/30"
                  : "bg-ink text-cream"
              }`}
            >
              {bookDone
                ? `Create ${name}'s real book →`
                : `Make a book for ${name} →`}
            </button>
            <p className="text-xs text-warm-600 mt-3">
              Free · 2 minutes · Read on iPad or send to grandma
            </p>
          </section>
        </div>
      )}

      {/* Phase: Onboarding */}
      {phase === "onboarding" && name && (
        <div ref={onboardRef} className="animate-fade-up">
          <Onboarding
            name={name}
            data={data}
            setData={setData}
            onComplete={handleGenerate}
            onBack={() => setPhase("sample")}
          />
        </div>
      )}

      {/* Phase: Generating */}
      {phase === "generating" && name && (
        <div ref={genRef} className="animate-fade-up">
          <GeneratingScreen
            name={name}
            bookReady={!!book}
            onDone={handleGenerationDone}
          />
        </div>
      )}

      {/* Phase: Error */}
      {phase === "error" && name && (
        <div className="animate-fade-up">
          <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
            <ErrorMessage message={error} onRetry={handleRetry} />
            <button
              onClick={() => setPhase("onboarding")}
              className="mt-4 text-sm text-warm-600 bg-transparent border-none cursor-pointer"
            >
              ← Change story details
            </button>
          </section>
        </div>
      )}

      {/* Phase: Done */}
      {phase === "done" && book && (
        <div className="animate-fade-up">
          <BookReaderClient
            title={book.title}
            pages={book.pages}
            childName={book.childName}
            shareId={book.shareId}
            showActions
            onMakeAnother={() => {
              setBook(null);
              setBookDone(false);
              setData({ age: null, theme: null, customStory: "" });
              setPhase("gate");
              setName(null);
            }}
          />
          {/* Regenerate option */}
          <div className="text-center pb-16">
            <button
              onClick={() => {
                if (lastGenerateData) handleGenerate(lastGenerateData);
              }}
              className="text-sm text-warm-500 underline cursor-pointer bg-transparent border-none"
            >
              Not quite right? Try a different version
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="fixed bottom-4 right-6 z-50">
        <a href="/privacy" className="text-[11px] text-warm-400 hover:text-warm-600 transition-colors">
          Privacy
        </a>
      </footer>
    </main>
  );
}
