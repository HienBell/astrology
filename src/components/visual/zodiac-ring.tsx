"use client";

/**
 * Slowly rotating zodiac ring used as the hero visual.
 *
 * Interactive rather than decorative: hovering a sign holds the rotation and
 * names it, which is what invites people to poke at it before they have
 * entered anything.
 */

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";

import { RASHIS } from "@/lib/astro/constants";
import { rashiElement } from "@/lib/astro/constants";
import type { RashiIndex } from "@/lib/astro/types";
import type { Dictionary } from "@/lib/i18n";

/**
 * Rounds a computed SVG coordinate.
 *
 * `Math.sin`/`Math.cos` are implementation-defined in ECMAScript, so Node and
 * the browser can disagree in the final bit — enough to make React report a
 * hydration mismatch on every ray of the ring. Rounding makes the markup
 * byte-identical on both sides.
 */
function coord(value: number): number {
  return Math.round(value * 1000) / 1000;
}

const ELEMENT_COLOR: Record<string, string> = {
  fire: "var(--domain-love)",
  earth: "var(--domain-health)",
  air: "var(--domain-money)",
  water: "var(--domain-family)",
};

export function ZodiacRing({ dict }: { dict: Dictionary }) {
  const reduced = useReducedMotion();
  const [active, setActive] = useState<RashiIndex | null>(null);

  const radius = 132;

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[380px]">
      <motion.svg
        viewBox="-160 -160 320 320"
        className="h-full w-full overflow-visible"
        animate={reduced || active !== null ? { rotate: 0 } : { rotate: 360 }}
        transition={
          reduced || active !== null
            ? { duration: 0 }
            : { duration: 180, ease: "linear", repeat: Infinity }
        }
      >
        <defs>
          <radialGradient id="ring-core" cx="50%" cy="50%">
            <stop offset="0%" stopColor="oklch(0.83 0.135 84 / 0.35)" />
            <stop offset="70%" stopColor="oklch(0.68 0.16 295 / 0.12)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        <circle r="118" fill="url(#ring-core)" />
        <circle r={radius} fill="none" stroke="var(--border-strong)" strokeWidth="0.8" />
        <circle r={radius - 26} fill="none" stroke="var(--border)" strokeWidth="0.6" />
        <circle r="52" fill="none" stroke="var(--border)" strokeWidth="0.5" />

        {RASHIS.map((rashi, index) => {
          // Sign boundaries every 30°, drawn from the top and going clockwise.
          const startAngle = index * 30 - 90;
          const midAngle = startAngle + 15;
          const rad = (midAngle * Math.PI) / 180;
          const isActive = active === index;
          const color = ELEMENT_COLOR[rashiElement(index as RashiIndex)];

          return (
            <g key={rashi.sanskrit}>
              <line
                x1={coord(Math.cos((startAngle * Math.PI) / 180) * (radius - 26))}
                y1={coord(Math.sin((startAngle * Math.PI) / 180) * (radius - 26))}
                x2={coord(Math.cos((startAngle * Math.PI) / 180) * radius)}
                y2={coord(Math.sin((startAngle * Math.PI) / 180) * radius)}
                stroke="var(--border-strong)"
                strokeWidth="0.7"
              />

              {/* Generous invisible hit area — the glyph alone is too small. */}
              <circle
                cx={coord(Math.cos(rad) * (radius - 13))}
                cy={coord(Math.sin(rad) * (radius - 13))}
                r="15"
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setActive(index as RashiIndex)}
                onMouseLeave={() => setActive(null)}
              />

              <text
                x={coord(Math.cos(rad) * (radius - 13))}
                y={coord(Math.sin(rad) * (radius - 13))}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={isActive ? 17 : 14}
                fill={isActive ? color : "var(--muted-foreground)"}
                className="pointer-events-none transition-all duration-300"
                style={{ filter: isActive ? `drop-shadow(0 0 8px ${color})` : undefined }}
              >
                {rashi.symbol}
              </text>
            </g>
          );
        })}
      </motion.svg>

      {/* Centre label sits outside the rotating group so it stays upright. */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        {active !== null ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.22 }}
          >
            <p className="font-heading text-2xl font-semibold text-foreground">
              {dict.rashis[active]}
            </p>
            <p className="mt-0.5 text-xs uppercase tracking-[0.2em] text-gold/90">
              {RASHIS[active].sanskrit}
            </p>
          </motion.div>
        ) : (
          <p className="max-w-[7rem] text-[0.7rem] leading-relaxed text-muted-foreground/70">
            {dict.hero.scrollHint}
          </p>
        )}
      </div>
    </div>
  );
}
