import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Radio Sehati",
  description: "Streaming Radio Sehati",
  manifest: "/manifest.json",
  themeColor: "#f59e0b",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#f59e0b" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>

      <body>{children}</body>
    </html>
  );
}