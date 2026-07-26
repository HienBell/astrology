import type { Metadata } from "next";
import { Be_Vietnam_Pro, Cormorant_Garamond, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";

import { SiteHeader } from "@/components/layout/site-header";
import { Starfield } from "@/components/visual/starfield";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getDictionary, isLocale, LOCALES } from "@/lib/i18n";

import "../globals.css";

/** Body face — chosen for its complete Vietnamese diacritic coverage. */
const sans = Be_Vietnam_Pro({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600"],
});

/** Display face for headings — classical, and also covers Vietnamese. */
const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

/** Used for degrees, coordinates and anything tabular. */
const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dict = getDictionary(locale);

  return {
    title: dict.meta.title,
    description: dict.meta.description,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className={`dark ${sans.variable} ${display.variable} ${mono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <Starfield />
        <TooltipProvider delay={200}>
          <SiteHeader dict={dict} locale={locale} />
          <main className="flex-1">{children}</main>
          <SiteFooter dict={dict} />
        </TooltipProvider>
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}

function SiteFooter({
  dict,
}: {
  dict: ReturnType<typeof getDictionary>;
}) {
  return (
    <footer className="mt-24 border-t border-border/60 py-8">
      <div className="mx-auto max-w-6xl px-5 text-center">
        <p className="mx-auto max-w-2xl text-xs leading-relaxed text-muted-foreground">
          {dict.about.limitsBody}
        </p>
      </div>
    </footer>
  );
}
