"use client";

export default function IllustrationPreview({
  coverUrl,
  title,
  childName,
  pageCount,
  onApprove,
  onReject,
  loading,
}) {
  const estimatedCost = (pageCount * 0.04).toFixed(2);
  const estimatedTime = Math.ceil(pageCount * 8);

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="w-full max-w-[400px]">
        <div className="text-xs text-warm-400 font-semibold uppercase tracking-widest mb-2">
          Illustration Preview
        </div>
        <h2 className="font-serif text-2xl tracking-tight mb-2">
          Here's the style for {childName}'s book
        </h2>
        <p className="text-sm text-warm-600 mb-6 leading-relaxed">
          This is how the cover will look. All pages will be illustrated in this
          same style with the same character.
        </p>

        {/* Cover preview */}
        <div className="rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(42,37,32,0.12)] mb-6">
          {coverUrl ? (
            <div className="relative" style={{ aspectRatio: "3/4" }}>
              <img
                src={coverUrl}
                alt={`Cover illustration for ${title}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-6 pt-16">
                <div className="font-serif text-xl text-white drop-shadow-lg">
                  {title}
                </div>
                <div className="text-xs text-white/70 mt-1 italic">
                  A story made just for {childName}
                </div>
              </div>
            </div>
          ) : (
            <div
              className="flex items-center justify-center bg-warm-100"
              style={{ aspectRatio: "3/4" }}
            >
              <p className="text-warm-400 text-sm">Loading preview…</p>
            </div>
          )}
        </div>

        <p className="text-xs text-warm-500 mb-6">
          Generating all {pageCount} pages will take about{" "}
          {estimatedTime > 60
            ? `${Math.ceil(estimatedTime / 60)} minutes`
            : `${estimatedTime} seconds`}
          .
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onApprove}
            disabled={loading}
            className={`w-full py-4 rounded-xl text-base font-semibold transition-all ${
              loading
                ? "bg-warm-200 text-warm-500"
                : "bg-accent text-cream hover:scale-[1.02]"
            }`}
          >
            {loading
              ? "Generating illustrations…"
              : `Love it → Illustrate all ${pageCount} pages`}
          </button>

          <button
            onClick={onReject}
            disabled={loading}
            className="text-sm text-warm-500 underline"
          >
            Try a different style
          </button>
        </div>
      </div>
    </section>
  );
}
