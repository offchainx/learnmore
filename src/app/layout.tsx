import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Learn More Platform",
  description: "A comprehensive online education platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased"
      >
        {children}
      </body>
    </html>
  );
}
