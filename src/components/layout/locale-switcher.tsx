"use client";

import { usePathname, useRouter } from "next/navigation";
import { Languages } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/lib/i18n/config";

/**
 * Swaps the locale segment in place so the visitor stays on the same page.
 * With only two locales a toggle beats a dropdown.
 */
export function LocaleSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const router = useRouter();

  const next = LOCALES[(LOCALES.indexOf(locale) + 1) % LOCALES.length];

  function switchLocale() {
    const segments = pathname.split("/");
    segments[1] = next;
    router.push(segments.join("/") || `/${next}`);
  }

  return (
    <Tooltip>
      {/* Base UI composes via `render`, not Radix's `asChild`. */}
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            onClick={switchLocale}
            className="ml-1 gap-1.5 rounded-full text-muted-foreground hover:text-foreground"
            aria-label={LOCALE_LABELS[next]}
          >
            <Languages className="size-4" />
            <span className="text-xs font-medium uppercase">{next}</span>
          </Button>
        }
      />
      <TooltipContent>{LOCALE_LABELS[next]}</TooltipContent>
    </Tooltip>
  );
}
