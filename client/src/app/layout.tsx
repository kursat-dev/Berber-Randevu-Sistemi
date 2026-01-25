import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Berber Randevu Sistemi",
  description: "Modern ve stilin adresi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${inter.className} antialiased min-h-screen flex flex-col font-sans`}
      >
        <Navbar />
        <main className="flex-1 w-full bg-background text-foreground">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
