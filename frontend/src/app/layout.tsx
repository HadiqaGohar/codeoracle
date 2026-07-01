import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ClientLayout from "@/components/ClientLayout";
import { ThemeProvider } from "@/components/ThemeProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export const metadata: Metadata = {
  title: {
    default: "CodeOracle | AI Repository Analyzer",
    template: "%s | CodeOracle",
  },
  description:
    "Free AI-powered GitHub repository analyzer. Paste any repo URL and get instant code explanation, bug detection, security analysis, architecture diagrams, and more using Google Gemini AI.",
  keywords: [
    "github",
    "repository",
    "analyzer",
    "AI",
    "code analysis",
    "bug detection",
    "security",
    "gemini",
    "code review",
    "open source",
  ],
  authors: [{ name: "Hadiqa Gohar" }],
  creator: "Hadiqa Gohar",
  publisher: "CodeOracle",
  metadataBase: new URL("https://codeoracle.vercel.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://codeoracle.vercel.app",
    siteName: "CodeOracle",
    title: "CodeOracle | AI Repository Analyzer",
    description:
      "Free AI-powered GitHub repository analyzer. Paste any repo URL and get instant code explanation, bug detection, security analysis, architecture diagrams, and more.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CodeOracle - AI Repository Analyzer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CodeOracle | AI Repository Analyzer",
    description:
      "Free AI-powered GitHub repository analyzer. Instant code explanation, bug detection, security analysis, and more.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-full flex flex-col bg-black text-zinc-100">
        <ThemeProvider>
          <ClientLayout>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
