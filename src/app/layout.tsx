import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/layout/Providers";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";

export const metadata: Metadata = {
  title: {
    default: "ClawSetup — OpenClaw Setup Guide",
    template: "%s — ClawSetup",
  },
  description:
    "Interactive step-by-step guide for installing and configuring OpenClaw with AI-powered assistance on every step. From zero to a fully running AI agent.",
  keywords: ["OpenClaw", "AI agent", "setup guide", "Google Cloud", "VM setup", "tutorial"],
  authors: [{ name: "ClawSetup" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "ClawSetup",
    title: "ClawSetup — Set Up OpenClaw Without the Pain",
    description:
      "Interactive step-by-step guide with AI assistance on every step. From zero to a fully running OpenClaw agent.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClawSetup — OpenClaw Setup Guide",
    description:
      "Interactive step-by-step guide with AI assistance on every step.",
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://clawsetup.com"),
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="font-sans antialiased bg-neu-bg text-neu-text">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
