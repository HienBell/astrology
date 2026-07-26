"use client";

/**
 * Shared motion vocabulary.
 *
 * Every animated element in the app composes one of these rather than defining
 * its own transition. That is what makes the whole site feel like one piece:
 * the same easing, the same distances, the same stagger rhythm everywhere.
 */

import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Matches --ease-out-soft in globals.css. */
export const EASE_OUT_SOFT = [0.16, 1, 0.3, 1] as const;

export const DURATION = {
  fast: 0.18,
  base: 0.32,
  slow: 0.64,
} as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.slow, ease: EASE_OUT_SOFT },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DURATION.slow } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION.slow, ease: EASE_OUT_SOFT },
  },
};

/** Parent variant that walks its children in sequence. */
export function staggerParent(stagger = 0.08, delay = 0): Variants {
  return {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren: delay },
    },
  };
}

interface RevealProps extends ComponentPropsWithoutRef<typeof motion.div> {
  children: ReactNode;
  /** Animate the first time it scrolls into view instead of on mount. */
  inView?: boolean;
  delay?: number;
}

/**
 * The default entrance for any block of content. Honours the OS reduced-motion
 * setting by rendering the final state immediately.
 */
export function Reveal({
  children,
  inView = false,
  delay = 0,
  className,
  ...rest
}: RevealProps) {
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      variants={fadeUp}
      initial="hidden"
      {...(inView
        ? { whileInView: "visible", viewport: { once: true, margin: "-80px" } }
        : { animate: "visible" })}
      transition={{ duration: DURATION.slow, ease: EASE_OUT_SOFT, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

interface StaggerProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  inView?: boolean;
}

/** Wrap a list; each direct `StaggerItem` child enters in turn. */
export function Stagger({
  children,
  className,
  stagger = 0.08,
  delay = 0,
  inView = false,
}: StaggerProps) {
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      variants={staggerParent(stagger, delay)}
      initial="hidden"
      {...(inView
        ? { whileInView: "visible", viewport: { once: true, margin: "-60px" } }
        : { animate: "visible" })}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  variant = fadeUp,
}: {
  children: ReactNode;
  className?: string;
  variant?: Variants;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div className={className} variants={variant}>
      {children}
    </motion.div>
  );
}

/**
 * Lifts a card slightly on hover. Used on every interactive panel so the
 * affordance is identical across the app.
 */
export function HoverLift({
  children,
  className,
  ...rest
}: ComponentPropsWithoutRef<typeof motion.div>) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={cn(className)}
      whileHover={reduced ? undefined : { y: -4 }}
      transition={{ duration: DURATION.base, ease: EASE_OUT_SOFT }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
