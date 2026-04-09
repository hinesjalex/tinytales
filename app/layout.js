import "./globals.css";

export const metadata = {
  title: "TinyTales — Your child is the hero of their own story",
  description:
    "Create personalized storybooks for your child in 2 minutes. Free, no account needed.",
  openGraph: {
    title: "TinyTales — Personalized storybooks for your child",
    description:
      "Your child becomes the hero of a beautiful, AI-generated storybook. Free in 2 minutes.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
