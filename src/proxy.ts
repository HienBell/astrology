import { NextResponse, type NextRequest } from "next/server";

import { DEFAULT_LOCALE, LOCALES } from "@/lib/i18n/config";

/**
 * Ensures every page URL carries a locale segment. Requests without one are
 * redirected to the visitor's best match from `Accept-Language`, defaulting to
 * Vietnamese.
 */
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/${negotiateLocale(request)}${pathname}`;
  return NextResponse.redirect(url);
}

function negotiateLocale(request: NextRequest): string {
  const header = request.headers.get("accept-language");
  if (!header) return DEFAULT_LOCALE;

  // Cheap q-value parse — enough to pick between two locales.
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: tag.toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    const match = LOCALES.find((locale) => tag.startsWith(locale));
    if (match) return match;
  }
  return DEFAULT_LOCALE;
}

export const config = {
  // Everything except API routes, Next internals and static files.
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
