import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/navbar";
import { AIChatbot } from "@/components/chat/ai-chatbot";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Samarpan | Enterprise NGO Ecosystem",
  description: "Global humanitarian impact platform driven by AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <Providers>
          <Navbar />
          <main className="flex-1 w-full">{children}</main>
          <AIChatbot />
        </Providers>
      </body>
    </html>
  );
}
