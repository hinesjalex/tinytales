"use client";

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="w-full max-w-[380px] mx-auto mt-6 p-5 rounded-2xl bg-red-50 border border-red-100 text-center">
      <div className="text-2xl mb-2">😔</div>
      <p className="text-sm text-red-800 mb-3 leading-relaxed">
        {message || "Something went wrong. Please try again."}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2.5 rounded-full text-sm font-semibold bg-ink text-cream transition-all hover:scale-[1.03]"
        >
          Try again
        </button>
      )}
    </div>
  );
}
