import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "../components/Header";
import PresenceWatcher from "../components/PresenceWatcher";
import FloatingMenu from "../components/FloatingMenu";
import UserCheck from "../components/UserCheck"; // <--- NEU

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
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-main text-gray-800 dark:text-white min-h-screen`}
      >
        <Header />
        <PresenceWatcher />
        <main className="pt-24 flex min-h-screen justify-center items-center p-4">
          {/* UserCheck schützt alles – wenn du Home offen lassen willst, dann UserCheck auf den geschützten Seiten verwenden */}
          <UserCheck>
            {children}
          </UserCheck>
        </main>
        <FloatingMenu />
      </body>
    </html>
  );
}
