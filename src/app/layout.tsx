/**
 * Root layout — fonts, metadata, viewport, and the no-flash dark-mode script.
 * The three font families (Space Grotesk, Inter, Space Mono) are loaded here
 * and exposed as CSS variables for Tailwind's font-display / font-sans / font-mono.
 *
 * `preload: false` on every family: the fonts are consumed only through CSS
 * variables (never via next/font's own className), so Next can't know which
 * file the first paint needs and would emit `<link rel=preload>` tags for files
 * the browser doesn't use in time — the "preloaded but not used" console
 * warnings. With `display: "swap"` the swap-in stays graceful without them.
 */
import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, Space_Mono } from "next/font/google";
import { headers } from "next/headers";
import { isLocale, defaultLocale } from "@/i18n/config";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
  preload: false,
});
const sans = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: false,
});
const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-space-mono",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fousa.be"),
  title: {
    default: "fousa.be — Freelance iOS & web developer",
    template: "%s · fousa.be",
  },
  description:
    "Freelance iOS & web developer. 65 projects, 20 years — logged.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32" },
      { url: "/favicon-16.png", sizes: "16x16" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    url: "https://fousa.be",
  },
  twitter: {
    card: "summary_large_image",
    title: "fousa.be — Freelance iOS & web developer",
    description: "Freelance iOS & web developer. 65 projects, 20 years — logged.",
  },
};

export const viewport: Viewport = { themeColor: "#0c0c0d" };

/** Pre-paint script: reads localStorage theme and sets .dark before first render. */
const noFlash = `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':matchMedia('(prefers-color-scheme:dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "";
  const segment = pathname.split("/")[1] ?? "";
  const lang = isLocale(segment) ? segment : defaultLocale;

  return (
    <html
      lang={lang}
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlash }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
