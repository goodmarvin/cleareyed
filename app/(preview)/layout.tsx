import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://cleareyed.vercel.app"),
  title: "Clear-Eyed - Mental Model Decision Making",
  description:
    "Make better decisions by applying proven mental models to your specific scenarios. Get structured insights and actionable advice powered by AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
