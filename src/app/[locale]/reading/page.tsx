import { notFound } from "next/navigation";

import { ReadingView } from "@/components/reading/reading-view";
import { getDictionary, isLocale } from "@/lib/i18n";

/**
 * The reading is computed on the client from the locally stored profile, so
 * this page only resolves the locale and hands over the dictionary.
 */
export default async function ReadingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <ReadingView dict={getDictionary(locale)} locale={locale} />;
}
