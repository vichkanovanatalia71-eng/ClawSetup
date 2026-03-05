import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/layout/Providers";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "ClawSetup - OpenClaw Setup Guide",
  description:
    "Interactive step-by-step guide for installing and configuring OpenClaw with AI-powered assistance on every step.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-neu-bg text-neu-text">
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
