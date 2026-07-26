"use client";

/**
 * North Indian (diamond) rashi chart.
 *
 * In this style the twelve house positions are fixed on the page and the rashi
 * numbers move — house 1 is always the top centre diamond. That is the opposite
 * of the South Indian style and is what most Jyotish readers expect.
 */

import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";

import { GRAHA_SHORT, RASHIS } from "@/lib/astro/constants";
import { bhavaOf } from "@/lib/astro/chart";
import { GRAHAS, type BhavaNumber, type Graha, type NatalChart, type RashiIndex } from "@/lib/astro/types";
import { formatDegree } from "@/lib/i18n/present";
import type { Dictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Centre of each house cell in the 300×300 viewBox, house 1 first. */
const HOUSE_CENTRES: Record<BhavaNumber, [number, number]> = {
  1: [150, 66],
  2: [76, 28],
  3: [28, 76],
  4: [66, 150],
  5: [28, 224],
  6: [76, 272],
  7: [150, 234],
  8: [224, 272],
  9: [272, 224],
  10: [234, 150],
  11: [272, 76],
  12: [224, 28],
};

const HOUSES = Object.keys(HOUSE_CENTRES).map(Number) as BhavaNumber[];

export function NorthIndianChart({
  chart,
  dict,
  transits,
  className,
}: {
  chart: NatalChart;
  dict: Dictionary;
  /** When given, transiting grahas are drawn alongside the natal ones. */
  transits?: Record<Graha, { rashi: RashiIndex }>;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState<BhavaNumber | null>(null);

  const ascRashi = chart.ascendant.rashi;

  return (
    <div className={cn("relative", className)}>
      <svg viewBox="0 0 300 300" className="w-full">
        {/* Frame: outer square, both diagonals, and the inner diamond. */}
        <g stroke="var(--border-strong)" strokeWidth="1" fill="none">
          <rect x="2" y="2" width="296" height="296" rx="3" />
          <path d="M2 2 L298 298 M298 2 L2 298" opacity="0.75" />
          <path d="M150 2 L298 150 L150 298 L2 150 Z" opacity="0.75" />
        </g>

        {HOUSES.map((house) => {
          const [cx, cy] = HOUSE_CENTRES[house];
          // Which rashi falls in this house, counted from the lagna.
          const rashi = ((ascRashi + house - 1) % 12) as RashiIndex;
          const natal = GRAHAS.filter((g) => chart.planets[g].bhava === house);
          const moving = transits
            ? GRAHAS.filter((g) => bhavaOf(transits[g].rashi, ascRashi) === house)
            : [];
          const isHovered = hovered === house;

          return (
            <g
              key={house}
              onMouseEnter={() => setHovered(house)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-default"
            >
              <circle cx={cx} cy={cy} r="34" fill="transparent" />

              {isHovered && (
                <circle
                  cx={cx}
                  cy={cy}
                  r="32"
                  fill="oklch(0.83 0.135 84 / 0.08)"
                  className="pointer-events-none"
                />
              )}

              {/* Rashi number — the reader's anchor in this chart style. */}
              <text
                x={cx}
                y={cy - 20}
                textAnchor="middle"
                fontSize="10"
                fill="var(--gold)"
                opacity={isHovered ? 1 : 0.62}
                className="pointer-events-none font-mono"
              >
                {rashi + 1}
              </text>

              {natal.map((graha, i) => {
                const planet = chart.planets[graha];
                return (
                  <motion.text
                    key={graha}
                    x={cx}
                    y={cy - 4 + i * 12}
                    textAnchor="middle"
                    fontSize="10.5"
                    fill="var(--foreground)"
                    className="pointer-events-none font-mono"
                    initial={reduced ? false : { opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.25 + house * 0.02 + i * 0.03 }}
                  >
                    {GRAHA_SHORT[graha]}
                    {planet.retrograde && (
                      <tspan fontSize="7" fill="var(--domain-love)" dy="-3">
                        ℞
                      </tspan>
                    )}
                  </motion.text>
                );
              })}

              {/* Transits sit below the natal stack in a dimmer colour. */}
              {moving.length > 0 && (
                <text
                  x={cx}
                  y={cy - 4 + natal.length * 12 + 2}
                  textAnchor="middle"
                  fontSize="8"
                  fill="var(--domain-money)"
                  opacity="0.8"
                  className="pointer-events-none font-mono"
                >
                  {moving.map((g) => GRAHA_SHORT[g]).join(" ")}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Detail panel: reserves its own space so hovering never reflows. */}
      <div className="mt-3 min-h-[4.5rem] rounded-xl border border-border/60 bg-secondary/20 px-4 py-3">
        {hovered ? (
          <HouseDetail chart={chart} dict={dict} house={hovered} />
        ) : (
          <p className="text-xs leading-relaxed text-muted-foreground">
            {dict.chart.legend} — {dict.chart.retrograde} ℞ ·{" "}
            <span className="text-[var(--domain-money)]">
              {dict.reading.todayTitle}
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

function HouseDetail({
  chart,
  dict,
  house,
}: {
  chart: NatalChart;
  dict: Dictionary;
  house: BhavaNumber;
}) {
  const rashi = ((chart.ascendant.rashi + house - 1) % 12) as RashiIndex;
  const occupants = chart.occupants[house];

  return (
    <div>
      <p className="text-xs">
        <span className="font-medium text-gold">
          {dict.chart.houseLabel} {house}
        </span>
        <span className="text-muted-foreground"> · {dict.bhavas[house - 1]}</span>
        <span className="text-muted-foreground">
          {" "}
          · {dict.rashis[rashi]} ({RASHIS[rashi].sanskrit})
        </span>
      </p>
      <p className="mt-1.5 text-xs text-muted-foreground">
        {occupants.length === 0
          ? dict.chart.emptyHouse
          : occupants
              .map((g) => {
                const p = chart.planets[g];
                return `${dict.grahas[g]} ${formatDegree(p.degreeInRashi)}`;
              })
              .join(" · ")}
      </p>
    </div>
  );
}
