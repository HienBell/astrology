"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { cn } from "@/lib/utils";
import type { Dictionary, Locale } from "@/lib/i18n";

export function SiteHeader({
  dict,
  locale,
}: {
  dict: Dictionary;
  locale: Locale;
}) {
  const pathname = usePathname();

  const links = [
    { href: `/${locale}`, label: dict.nav.home },
    { href: `/${locale}/reading`, label: dict.nav.today },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5">
        <Link
          href={`/${locale}`}
          className="group flex items-center gap-2.5"
          aria-label={dict.meta.title}
        >
          <AstrolabeMark />
          <span className="font-heading text-xl font-semibold tracking-wide text-gradient-gold">
            Thiên Đồ
          </span>
        </Link>

        <nav className="ml-auto flex items-center gap-1">
          {links.map((link) => {
            const active =
              link.href === `/${locale}`
                ? pathname === link.href
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-accent/60 text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <LocaleSwitcher locale={locale} />
        </nav>
      </div>
    </header>
  );
}

/** Small astrolabe glyph used as the wordmark. */
function AstrolabeMark() {
  return (
    <svg
      viewBox="0 0 32 32"
      className="h-7 w-7 text-gold transition-transform duration-500 group-hover:rotate-45"
      fill="none"
      aria-hidden
    >
      <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="1" opacity="0.55" />
      <circle cx="16" cy="16" r="8.5" stroke="currentColor" strokeWidth="0.8" opacity="0.8" />
      <circle cx="16" cy="16" r="2" fill="currentColor" />
      <path d="M16 3v26M3 16h26" stroke="currentColor" strokeWidth="0.6" opacity="0.35" />
      <path
        d="M16 3.2 22.6 16 16 28.8 9.4 16Z"
        stroke="currentColor"
        strokeWidth="0.7"
        opacity="0.6"
      />
    </svg>
  );
}
