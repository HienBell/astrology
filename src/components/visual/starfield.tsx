"use client";

/**
 * Background starfield.
 *
 * Rendered once at the root and fixed behind everything. Stars are generated
 * from a seeded PRNG so the sky is identical between the server and client
 * render — a random field would hydrate-mismatch and flash on load.
 */

import { useMemo } from "react";
import { useReducedMotion } from "motion/react";

/** Mulberry32 — small, fast, and deterministic from a single integer seed. */
function seededRandom(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Star {
  x: number;
  y: number;
  r: number;
  o: number;
  delay: number;
  duration: number;
}

function buildStars(count: number, seed: number): Star[] {
  const rand = seededRandom(seed);
  return Array.from({ length: count }, () => ({
    x: rand() * 100,
    y: rand() * 100,
    // Most stars are faint pinpricks; a few are bright enough to notice.
    r: rand() < 0.86 ? 0.5 + rand() * 0.5 : 1 + rand() * 0.9,
    o: 0.2 + rand() * 0.6,
    delay: rand() * 8,
    duration: 3 + rand() * 5,
  }));
}

export function Starfield({ density = 160 }: { density?: number }) {
  const reduced = useReducedMotion();

  // Two layers at different scales give a cheap sense of depth when they drift.
  const near = useMemo(() => buildStars(density, 20260726), [density]);
  const far = useMemo(
    () => buildStars(Math.round(density * 1.4), 991995),
    [density],
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <StarLayer
        stars={far}
        opacity={0.5}
        drift={reduced ? undefined : "drift 200s linear infinite alternate"}
        twinkle={!reduced}
      />
      <StarLayer
        stars={near}
        opacity={0.85}
        drift={reduced ? undefined : "drift 120s linear infinite alternate"}
        twinkle={!reduced}
      />
    </div>
  );
}

function StarLayer({
  stars,
  opacity,
  drift,
  twinkle,
}: {
  stars: Star[];
  opacity: number;
  drift?: string;
  twinkle: boolean;
}) {
  return (
    <svg
      className="absolute inset-0 h-[130%] w-[130%]"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ opacity, animation: drift }}
    >
      {stars.map((star, i) => (
        <circle
          key={i}
          cx={star.x}
          cy={star.y}
          r={star.r * 0.08}
          fill="white"
          opacity={star.o}
          style={
            twinkle
              ? {
                  animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
                }
              : undefined
          }
        />
      ))}
    </svg>
  );
}
