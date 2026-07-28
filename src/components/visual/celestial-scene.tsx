"use client";

import Image from "next/image";
import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";

import { SolarCore } from "@/components/visual/solar-core";
import { cn } from "@/lib/utils";

/** The sun entry is special-cased: it is drawn by a shader, not an image. */
const SUN_SRC = "/celestial/sun.webp";

export type CelestialVariant =
  "solar" | "saturn" | "neptune" | "moon" | "jupiter";

interface CelestialBody {
  src: string;
  className: string;
  delay: number;
  float: number;
  duration: number;
  glow: string;
}

const SCENES: Record<CelestialVariant, CelestialBody[]> = {
  solar: [
    {
      src: SUN_SRC,
      /* The canvas is far larger than the visible disc: only the middle
         SUN_DISC_FRACTION of it is photosphere, the rest is corona headroom.
         At these numbers the disc is roughly the height of the scene box and
         the corona spills past every edge. */
      className:
        "-left-[30%] -top-[32%] h-[164%] w-[164%] sm:-left-[26%] lg:-left-[22%]",
      delay: 0,
      float: 10,
      duration: 9,
      glow: "bg-amber-400/25",
    },
    {
      src: "/celestial/moon.webp",
      className: "right-[2%] top-[4%] h-[15%] w-[15%]",
      delay: 0.24,
      float: 16,
      duration: 7,
      glow: "bg-slate-100/15",
    },
    {
      src: "/celestial/neptune.webp",
      className: "bottom-[3%] right-[3%] h-[19%] w-[19%]",
      delay: 0.4,
      float: 13,
      duration: 8,
      glow: "bg-blue-500/20",
    },
  ],
  saturn: [
    {
      src: "/celestial/saturn.webp",
      className: "-left-[24%] top-[8%] h-[78%] w-[132%]",
      delay: 0,
      float: 13,
      duration: 10,
      glow: "bg-amber-200/15",
    },
    {
      src: "/celestial/jupiter.webp",
      className: "bottom-[1%] right-[1%] h-[29%] w-[29%]",
      delay: 0.32,
      float: 17,
      duration: 8,
      glow: "bg-orange-300/15",
    },
  ],
  neptune: [
    {
      src: "/celestial/neptune.webp",
      className: "-left-[17%] top-[3%] h-[105%] w-[105%]",
      delay: 0,
      float: 15,
      duration: 9,
      glow: "bg-blue-500/25",
    },
  ],
  moon: [
    {
      src: "/celestial/moon.webp",
      className: "-right-[12%] top-[1%] h-[108%] w-[108%]",
      delay: 0,
      float: 17,
      duration: 10,
      glow: "bg-slate-100/20",
    },
  ],
  jupiter: [
    {
      src: "/celestial/jupiter.webp",
      className: "-left-[18%] top-[1%] h-[108%] w-[108%]",
      delay: 0,
      float: 14,
      duration: 11,
      glow: "bg-orange-300/20",
    },
  ],
};

export function CelestialScene({
  variant,
  className,
  priority = false,
}: {
  variant: CelestialVariant;
  className?: string;
  priority?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: rootRef,
    offset: ["start end", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [58, -58]);
  const parallaxRotate = useTransform(scrollYProgress, [0, 1], [-1.7, 1.7]);

  return (
    <div
      ref={rootRef}
      aria-hidden
      data-celestial-scene={variant}
      className={cn(
        "relative isolate mx-auto h-[330px] w-full max-w-[660px] overflow-visible sm:h-[450px] lg:h-[600px]",
        className,
      )}
    >
      <motion.div
        className="absolute inset-0"
        style={reduced ? undefined : { y: parallaxY, rotate: parallaxRotate }}
      >
        {SCENES[variant].map((body, index) => (
          <motion.div
            key={body.src}
            className={cn("absolute", body.className)}
            initial={
              reduced
                ? false
                : { opacity: 0, scale: 0.62, y: 54, filter: "blur(14px)" }
            }
            whileInView={
              reduced
                ? undefined
                : { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }
            }
            viewport={{ once: false, amount: 0.2 }}
            transition={{
              duration: 1.05,
              delay: body.delay,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {body.src !== SUN_SRC && (
              <div
                className={cn(
                  "absolute inset-[16%] -z-10 rounded-full blur-3xl",
                  body.glow,
                )}
              />
            )}
            <motion.div
              className="relative h-full w-full"
              animate={
                reduced
                  ? undefined
                  : {
                      y: [0, -body.float, 0],
                      rotate: [0, index % 2 ? -1 : 1, 0],
                    }
              }
              transition={{
                duration: body.duration,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {body.src === SUN_SRC ? (
                /* The sun is rendered by a shader rather than an image — see
                   SolarCore for why the bitmap could not look like fire. */
                <SolarCore />
              ) : (
                <Image
                  src={body.src}
                  alt=""
                  fill
                  priority={priority && index === 0}
                  sizes="(max-width: 1024px) 90vw, 46vw"
                  className="select-none object-contain drop-shadow-[0_30px_55px_rgba(0,0,0,0.5)]"
                />
              )}
            </motion.div>
          </motion.div>
        ))}

        <Sparkles />
      </motion.div>
    </div>
  );
}

function Sparkles() {
  return (
    <>
      {[
        [14, 18, 0],
        [82, 24, 1.3],
        [73, 78, 2.7],
        [18, 72, 4.1],
      ].map(([left, top, delay], index) => (
        <span
          key={index}
          className="celestial-spark absolute size-1 rounded-full bg-white"
          style={{
            left: `${left}%`,
            top: `${top}%`,
            animationDelay: `${delay}s`,
          }}
        />
      ))}
    </>
  );
}
