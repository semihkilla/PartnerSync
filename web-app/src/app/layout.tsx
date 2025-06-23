import dynamic from "next/dynamic";

// Dynamically import the header so this file remains a server component and
// metadata can be exported without the `use client` directive.
const Header = dynamic(() => import("../components/Header"));
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import { useEffect } from "react";
import { onAuthChange } from "../lib/auth";
import { updatePresence } from "../lib/user";

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
  useEffect(() => onAuthChange((u) => u && updatePresence(u.uid)), []);
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-pink-200 via-pink-300 to-pink-500 text-gray-800 min-h-screen`}
      >
        <Header />
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
