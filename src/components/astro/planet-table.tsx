"use client";

import { motion, useReducedMotion } from "motion/react";

import { fadeUp, staggerParent } from "@/components/motion/primitives";
import { GRAHA_GLYPHS } from "@/lib/astro/constants";
import { GRAHAS, type NatalChart } from "@/lib/astro/types";
import {
  dignityName,
  formatDegree,
  nakshatraName,
  rashiName,
} from "@/lib/i18n/present";
import type { Dictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Dignity is the single most-scanned column, so it carries the colour. */
const DIGNITY_TONE: Record<string, string> = {
  exalted: "text-[var(--band-excellent)]",
  moolatrikona: "text-[var(--band-good)]",
  own: "text-[var(--band-good)]",
  friend: "text-foreground/80",
  neutral: "text-muted-foreground",
  enemy: "text-[var(--band-below)]",
  debilitated: "text-[var(--band-low)]",
};

export function PlanetTable({
  chart,
  dict,
}: {
  chart: NatalChart;
  dict: Dictionary;
}) {
  const reduced = useReducedMotion();

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[38rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border/70">
            {[
              dict.chart.tableGraha,
              dict.chart.tableSign,
              dict.chart.tableDegree,
              dict.chart.tableHouse,
              dict.chart.tableNakshatra,
              dict.chart.tableDignity,
              dict.chart.tableStrength,
            ].map((heading, i) => (
              <th
                key={heading}
                className={cn(
                  "label-eyebrow py-2.5 font-medium",
                  i === 0 ? "text-left" : "text-left",
                  i >= 5 && "text-right",
                )}
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>

        {/* Motion is applied to the table elements themselves — wrapping rows in
            a <div> would put invalid markup between <table> and <tbody>. */}
        <motion.tbody
          variants={staggerParent(0.04)}
          initial={reduced ? false : "hidden"}
          animate="visible"
        >
          {GRAHAS.map((graha) => {
            const p = chart.planets[graha];
            return (
              <motion.tr
                key={graha}
                variants={fadeUp}
                className="border-b border-border/40 transition-colors last:border-0 hover:bg-accent/25"
              >
                <td className="whitespace-nowrap py-2.5">
                  <span className="mr-2 text-base text-gold/85">
                    {GRAHA_GLYPHS[graha]}
                  </span>
                  {dict.grahas[graha]}
                  {p.retrograde && (
                    <span
                      className="ml-1.5 text-xs text-[var(--domain-love)]"
                      title={dict.chart.retrograde}
                    >
                      ℞
                    </span>
                  )}
                  {p.combust && (
                    <span
                      className="ml-1 text-xs text-[var(--band-below)]"
                      title={dict.chart.combust}
                    >
                      ☌
                    </span>
                  )}
                </td>
                <td className="py-2.5 text-muted-foreground">
                  {rashiName(dict, p.rashi)}
                </td>
                <td className="py-2.5 font-mono text-xs text-muted-foreground">
                  {formatDegree(p.degreeInRashi)}
                </td>
                <td className="py-2.5 font-mono text-xs text-muted-foreground">
                  {p.bhava}
                </td>
                <td className="py-2.5 text-xs text-muted-foreground">
                  {nakshatraName(p.nakshatra.index)}
                  <span className="ml-1 opacity-60">·{p.nakshatra.pada}</span>
                </td>
                <td
                  className={cn(
                    "py-2.5 text-right text-xs",
                    DIGNITY_TONE[p.dignity],
                  )}
                >
                  {dignityName(dict, p.dignity)}
                </td>
                <td className="py-2.5 text-right">
                  <StrengthBar value={p.strength} />
                </td>
              </motion.tr>
            );
          })}
        </motion.tbody>
      </table>
    </div>
  );
}

function StrengthBar({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="h-1 w-14 overflow-hidden rounded-full bg-muted/60">
        <span
          className="block h-full rounded-full bg-gold/80"
          style={{ width: `${value}%` }}
        />
      </span>
      <span className="w-6 text-right font-mono text-xs text-muted-foreground">
        {value}
      </span>
    </span>
  );
}
