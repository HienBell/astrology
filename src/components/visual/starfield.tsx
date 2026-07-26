"use client";

/** Fixed ambient universe. The large celestial bodies live in page sections. */

import { useMemo } from "react";
import { useReducedMotion } from "motion/react";

interface AmbientStar {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  delay: number;
  duration: number;
}

function seededRandom(seed: number): () => number {
  let value = seed;
  return () => {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;
    let result = Math.imul(value ^ (value >>> 15), 1 | value);
    result =
      (result + Math.imul(result ^ (result >>> 7), 61 | result)) ^ result;
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function buildStars(count: number, seed: number): AmbientStar[] {
  const random = seededRandom(seed);
  return Array.from({ length: count }, () => ({
    x: random() * 100,
    y: random() * 100,
    radius: random() < 0.88 ? 0.045 + random() * 0.05 : 0.1 + random() * 0.08,
    opacity: 0.16 + random() * 0.5,
    delay: random() * 8,
    duration: 3 + random() * 5,
  }));
}

export function Starfield({ density = 155 }: { density?: number }) {
  const reduced = useReducedMotion();
  const stars = useMemo(() => buildStars(density, 20260726), [density]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="universe-nebula absolute inset-0" />
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {stars.map((star, index) => (
          <circle
            key={index}
            cx={star.x}
            cy={star.y}
            r={star.radius}
            fill="white"
            opacity={star.opacity}
            style={
              reduced
                ? undefined
                : {
                    animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
                  }
            }
          />
        ))}
      </svg>
      <div className="universe-vignette absolute inset-0" />
    </div>
  );
}
