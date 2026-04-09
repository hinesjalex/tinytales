import { getBook } from "@/lib/supabase";
import BookReaderClient from "@/components/BookReaderClient";

export async function generateMetadata({ params }) {
  const book = await getBook(params.id);

  if (!book) {
    return { title: "Book not found — TinyTales" };
  }

  return {
    title: `${book.title} — TinyTales`,
    description: `A personalized storybook made just for ${book.child_name}. Read it now!`,
    openGraph: {
      title: `${book.title}`,
      description: `${book.child_name}'s personalized storybook — made with TinyTales`,
      type: "article",
    },
  };
}

export default async function SharedBookPage({ params }) {
  const book = await getBook(params.id);

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center px-6">
          <div className="text-5xl mb-4">📖</div>
          <h1 className="font-serif text-2xl mb-2">Book not found</h1>
          <p className="text-warm-600 text-sm mb-6">
            This link may have expired or the book may have been removed.
          </p>
          <a
            href="/"
            className="inline-block bg-ink text-cream px-6 py-3 rounded-full text-sm font-semibold"
          >
            Make your own book →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <BookReaderClient
        title={book.title}
        pages={book.pages}
        childName={book.child_name}
        shareId={book.share_id}
      />
    </div>
  );
}
