/**
 * Gallery page at /<locale>/gallery.
 *
 * A cross-project showcase: every project's gallery screenshots flattened into
 * one animated masonry, filterable by device. Server component — fetches the
 * shots and renders the home-style header plus the client `GalleryMasonry`
 * (wrapped in Suspense for its `useSearchParams` filter state).
 */
import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { isLocale } from "@/i18n/config";
import { t } from "@/i18n/messages";
import { altMetadata } from "@/lib/seo";
import { getGalleryShots } from "@/lib/gallery";
import { GalleryMasonry } from "@/components/gallery/GalleryMasonry";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const title = t(locale, "galleryEyebrow");
  const description = t(locale, "galleryDesc");

  return {
    title,
    description,
    ...altMetadata(locale, "/gallery"),
    openGraph: {
      title,
      description,
      url: altMetadata(locale, "/gallery").alternates?.canonical as string,
      siteName: "fousa.be",
      locale: locale === "nl" ? "nl_BE" : "en_US",
      type: "website",
    },
    twitter: { card: "summary", title, description },
  };
}

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const shots = await getGalleryShots(locale);
  const projectCount = new Set(shots.map((s) => s.slug)).size;

  return (
    <main id="main" className="px-5 md:px-11">
      <header className="pt-12 pb-7 md:pt-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-faint">
          {t(locale, "galleryEyebrow")}
        </p>
        <h1 className="mt-4 font-display text-[40px] font-bold leading-[1.02] tracking-[-0.025em] text-ink md:text-[46px]">
          {t(locale, "galleryTitle")}
          <span className="text-accent">.</span>
        </h1>
        <p className="mt-[18px] max-w-[560px] text-[16px] leading-[1.6] text-text">
          {t(locale, "galleryDesc")}
        </p>
        <p className="mt-[18px] font-mono text-[12px] tracking-[0.04em] text-muted">
          {t(locale, "galleryMeta")
            .replace("{screens}", String(shots.length))
            .replace("{projects}", String(projectCount))}
        </p>
      </header>

      <Suspense>
        <GalleryMasonry shots={shots} locale={locale} />
      </Suspense>
    </main>
  );
}
