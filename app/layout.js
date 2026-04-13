import "./globals.css";

export const metadata = {
  title: "TinyTales — Turn your child's story into a real book",
  description:
    "Create personalized storybooks for your child. Write it yourself or let AI help. Illustrate it your way. Print a hardcover in minutes.",
  openGraph: {
    title: "TinyTales — Turn your child's story into a real book",
    description:
      "Write, illustrate, and print personalized storybooks for your child. In minutes, not months.",
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
