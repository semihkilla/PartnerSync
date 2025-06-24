import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import PresenceWatcher from "../components/PresenceWatcher"; // <-- NEU

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LouVibe",
  description: "Created for l'amour",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white min-h-screen`}
      >
        <Header />
        <PresenceWatcher /> {/* <- Hier einfügen */}
        <main className="pt-24 flex min-h-screen justify-center items-center p-4">
          {children}
        </main>
        <button className="fab" aria-label="Love">
          💖
        </button>
      </body>
    </html>
  );
}