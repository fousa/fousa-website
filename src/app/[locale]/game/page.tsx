/**
 * Game page at /<locale>/game.
 *
 * The hidden "Glide" mini-game, reached from the header's "take off" easter
 * egg. Server component — validates the locale and renders the full-screen
 * client `GlidePlay`. Kept out of the sitemap and `noindex`'d so it stays a
 * stumbled-upon thing, not a search result.
 */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale } from "@/i18n/config";
import { t } from "@/i18n/messages";
import { GlidePlay } from "@/components/glide/GlidePlay";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  return {
    title: t(locale, "playGame"),
    robots: { index: false, follow: false },
  };
}

export default async function GamePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <GlidePlay locale={locale} />;
}
