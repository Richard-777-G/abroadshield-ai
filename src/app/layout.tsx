import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AbroadShield AI — One Agent. Four Phases. The Whole Journey.",
  description:
    "AbroadShield AI is an agentic AI that walks a student through the entire journey abroad — Pre-Departure, Arrival, Studying & Part-Time, and Job Success — with one continuous memory, proactive nudges, and real task execution.",
  keywords: [
    "AbroadShield",
    "study abroad",
    "agentic AI",
    "visa assistant",
    "international student",
    "Pre-Departure",
    "Job Success",
  ],
  authors: [{ name: "AbroadShield AI" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "AbroadShield AI — One Agent. Four Phases. The Whole Journey.",
    description:
      "The one relationship every student going abroad can count on for the entire journey.",
    siteName: "AbroadShield AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AbroadShield AI",
    description: "One AI. One memory. Four phases, start to finish.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
