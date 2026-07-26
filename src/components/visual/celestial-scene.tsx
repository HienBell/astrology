"use client";

import Image from "next/image";
import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";

import { cn } from "@/lib/utils";

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
      src: "/celestial/sun.webp",
      className:
        "-left-[12%] top-[3%] h-[94%] w-[94%] sm:-left-[8%] lg:-left-[9%]",
      delay: 0,
      float: 10,
      duration: 9,
      glow: "bg-amber-400/25",
    },
    {
      src: "/celestial/moon.webp",
      className: "right-[1%] top-[7%] h-[24%] w-[24%]",
      delay: 0.24,
      float: 16,
      duration: 7,
      glow: "bg-slate-100/15",
    },
    {
      src: "/celestial/neptune.webp",
      className: "bottom-[2%] right-[4%] h-[30%] w-[30%]",
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
        "relative isolate mx-auto h-[310px] w-full max-w-[620px] overflow-visible sm:h-[420px] lg:h-[560px]",
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
            <div
              className={cn(
                "absolute inset-[16%] -z-10 rounded-full blur-3xl",
                body.glow,
              )}
            />
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
              {body.src === "/celestial/sun.webp" && <SolarEnergy />}
              <Image
                src={body.src}
                alt=""
                fill
                priority={priority && index === 0}
                sizes="(max-width: 1024px) 90vw, 46vw"
                className={cn(
                  "select-none object-contain drop-shadow-[0_30px_55px_rgba(0,0,0,0.5)]",
                  body.src === "/celestial/sun.webp" && "solar-surface",
                )}
              />
              {body.src === "/celestial/sun.webp" && <SolarFlares />}
            </motion.div>
          </motion.div>
        ))}

        <Sparkles />
      </motion.div>
    </div>
  );
}

const SOLAR_FLARES = [
  { left: 50, top: 7, angle: "0deg", delay: "-0.4s" },
  { left: 79, top: 18, angle: "42deg", delay: "-2.8s" },
  { left: 93, top: 49, angle: "88deg", delay: "-1.1s" },
  { left: 81, top: 80, angle: "136deg", delay: "-3.6s" },
  { left: 50, top: 93, angle: "180deg", delay: "-2s" },
  { left: 19, top: 80, angle: "224deg", delay: "-4.2s" },
  { left: 7, top: 50, angle: "270deg", delay: "-1.8s" },
  { left: 20, top: 18, angle: "318deg", delay: "-3.1s" },
] as const;

function SolarEnergy() {
  return (
    <div className="pointer-events-none absolute inset-[4%] z-0 rounded-full">
      <div className="solar-radiance absolute inset-[-6%] rounded-full" />
    </div>
  );
}

function SolarFlares() {
  return (
    <div className="pointer-events-none absolute inset-[5%] z-2 rounded-full">
      {SOLAR_FLARES.map((flare, index) => (
        <span
          key={index}
          className="solar-flare absolute"
          style={
            {
              left: `${flare.left}%`,
              top: `${flare.top}%`,
              "--flare-angle": flare.angle,
              animationDelay: flare.delay,
            } as React.CSSProperties
          }
        />
      ))}
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
