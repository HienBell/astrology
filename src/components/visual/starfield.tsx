"use client";

/**
 * Fixed ambient universe behind the whole page.
 *
 * Canvas rather than SVG because two of the effects need per-frame drawing that
 * CSS cannot express: the diffraction spikes on a flaring star, and meteors
 * whose tails fade along their own length.
 *
 * The layer is `fixed`, so scrolling never moves it — content slides past a
 * stationary sky.
 */

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

interface Star {
  /** Fractions of the viewport, so a resize never reshuffles the sky. */
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  twinklePhase: number;
  twinkleSpeed: number;
  /** 0–1 flare envelope; only ever non-zero for the currently flaring star. */
  flare: number;
}

interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  life: number;
  maxLife: number;
  width: number;
}

function seededRandom(seed: number): () => number {
  let value = seed;
  return () => {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;
    let result = Math.imul(value ^ (value >>> 15), 1 | value);
    result = (result + Math.imul(result ^ (result >>> 7), 61 | result)) ^ result;
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function buildStars(count: number, seed: number): Star[] {
  const random = seededRandom(seed);
  return Array.from({ length: count }, () => ({
    x: random(),
    y: random(),
    // Most stars are pinpricks; a minority are large enough to notice.
    radius: random() < 0.88 ? 0.5 + random() * 0.5 : 1.0 + random() * 0.9,
    baseAlpha: 0.16 + random() * 0.5,
    twinklePhase: random() * Math.PI * 2,
    twinkleSpeed: 0.25 + random() * 0.5,
    flare: 0,
  }));
}

/** Seconds between flares and between meteors — randomised within the range. */
const FLARE_GAP: [number, number] = [1.6, 4.4];
const METEOR_GAP: [number, number] = [3.5, 9.5];

const FLARE_DURATION = 1.9;

export function Starfield({ density = 170 }: { density?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const stars = buildStars(density, 20260726);
    const meteors: Meteor[] = [];
    const random = seededRandom(0x5eed1);

    let width = 0;
    let height = 0;
    let dpr = 1;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drawStar(star: Star, time: number) {
      const x = star.x * width;
      const y = star.y * height;

      const twinkle =
        0.72 + 0.28 * Math.sin(time * star.twinkleSpeed + star.twinklePhase);

      // The flare envelope rises fast and falls slowly, like a real scintillation.
      const flare = star.flare;
      const alpha = Math.min(1, star.baseAlpha * twinkle + flare * 0.9);
      const radius = star.radius * (1 + flare * 1.6);

      ctx!.globalAlpha = alpha;
      ctx!.fillStyle = "#ffffff";
      ctx!.beginPath();
      ctx!.arc(x, y, radius, 0, Math.PI * 2);
      ctx!.fill();

      if (flare <= 0.01) return;

      // Soft halo.
      const halo = ctx!.createRadialGradient(x, y, 0, x, y, radius * 9);
      halo.addColorStop(0, `rgba(255,255,255,${0.5 * flare})`);
      halo.addColorStop(0.4, `rgba(198,220,255,${0.16 * flare})`);
      halo.addColorStop(1, "rgba(198,220,255,0)");
      ctx!.globalAlpha = 1;
      ctx!.fillStyle = halo;
      ctx!.beginPath();
      ctx!.arc(x, y, radius * 9, 0, Math.PI * 2);
      ctx!.fill();

      // Diffraction spikes — the vertical/horizontal cross the eye reads as
      // "this star is bright", and the reason this layer is canvas.
      const spike = radius * 16 * flare;
      const spikeGradient = ctx!.createLinearGradient(x - spike, y, x + spike, y);
      spikeGradient.addColorStop(0, "rgba(255,255,255,0)");
      spikeGradient.addColorStop(0.5, `rgba(255,255,255,${0.55 * flare})`);
      spikeGradient.addColorStop(1, "rgba(255,255,255,0)");

      ctx!.strokeStyle = spikeGradient;
      ctx!.lineWidth = Math.max(0.6, radius * 0.5);
      ctx!.beginPath();
      ctx!.moveTo(x - spike, y);
      ctx!.lineTo(x + spike, y);
      ctx!.stroke();

      const vertical = ctx!.createLinearGradient(x, y - spike, x, y + spike);
      vertical.addColorStop(0, "rgba(255,255,255,0)");
      vertical.addColorStop(0.5, `rgba(255,255,255,${0.45 * flare})`);
      vertical.addColorStop(1, "rgba(255,255,255,0)");
      ctx!.strokeStyle = vertical;
      ctx!.beginPath();
      ctx!.moveTo(x, y - spike * 0.72);
      ctx!.lineTo(x, y + spike * 0.72);
      ctx!.stroke();
    }

    function spawnMeteor() {
      // Enter from the top or the right, always travelling down-left, which is
      // how a shower radiant reads on a wide screen.
      const fromTop = random() < 0.65;
      const speed = 480 + random() * 520;
      // Shallow angle so the streak stays long and graceful. 150–175° points
      // left and slightly down in canvas space, where y grows downward.
      const angle = (Math.PI / 180) * (150 + random() * 25);

      meteors.push({
        x: fromTop ? random() * width * 1.15 : width + 40,
        y: fromTop ? -40 : random() * height * 0.55,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        length: 110 + random() * 190,
        life: 0,
        maxLife: 0.9 + random() * 0.7,
        width: 0.9 + random() * 1.1,
      });
    }

    function drawMeteor(meteor: Meteor) {
      const progress = meteor.life / meteor.maxLife;
      // Fade in quickly, hold, then fade out.
      const alpha =
        progress < 0.15
          ? progress / 0.15
          : progress > 0.65
            ? 1 - (progress - 0.65) / 0.35
            : 1;

      const speed = Math.hypot(meteor.vx, meteor.vy) || 1;
      const tailX = meteor.x - (meteor.vx / speed) * meteor.length;
      const tailY = meteor.y - (meteor.vy / speed) * meteor.length;

      const trail = ctx!.createLinearGradient(meteor.x, meteor.y, tailX, tailY);
      trail.addColorStop(0, `rgba(255,255,255,${0.92 * alpha})`);
      trail.addColorStop(0.25, `rgba(214,232,255,${0.42 * alpha})`);
      trail.addColorStop(1, "rgba(190,214,255,0)");

      ctx!.globalAlpha = 1;
      ctx!.strokeStyle = trail;
      ctx!.lineWidth = meteor.width;
      ctx!.lineCap = "round";
      ctx!.beginPath();
      ctx!.moveTo(meteor.x, meteor.y);
      ctx!.lineTo(tailX, tailY);
      ctx!.stroke();

      // Bright head.
      const head = ctx!.createRadialGradient(
        meteor.x,
        meteor.y,
        0,
        meteor.x,
        meteor.y,
        meteor.width * 5,
      );
      head.addColorStop(0, `rgba(255,255,255,${0.95 * alpha})`);
      head.addColorStop(1, "rgba(255,255,255,0)");
      ctx!.fillStyle = head;
      ctx!.beginPath();
      ctx!.arc(meteor.x, meteor.y, meteor.width * 5, 0, Math.PI * 2);
      ctx!.fill();
    }

    function paint(time: number) {
      ctx!.clearRect(0, 0, width, height);
      for (const star of stars) drawStar(star, time);
      ctx!.globalAlpha = 1;
      for (const meteor of meteors) drawMeteor(meteor);
    }

    resize();
    window.addEventListener("resize", resize);

    if (reduced) {
      // Motionless sky: stars only, no flares and no meteors.
      paint(0);
      return () => window.removeEventListener("resize", resize);
    }

    let frame = 0;
    let running = true;
    let last = performance.now();
    let elapsed = 0;
    let nextFlare = FLARE_GAP[0];
    let nextMeteor = 2.2;
    let flaring: Star | null = null;
    let flareAge = 0;

    function loop(now: number) {
      if (!running) return;

      // Clamp dt so a backgrounded tab does not fast-forward the whole sky.
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      elapsed += dt;

      // --- flaring star ---
      if (flaring) {
        flareAge += dt;
        const p = flareAge / FLARE_DURATION;
        if (p >= 1) {
          flaring.flare = 0;
          flaring = null;
        } else {
          // Sharp attack, long decay.
          flaring.flare =
            p < 0.18
              ? p / 0.18
              : Math.pow(1 - (p - 0.18) / 0.82, 2.2);
        }
      } else if (elapsed >= nextFlare) {
        // Prefer the larger stars — a pinprick flaring looks like a glitch.
        const candidates = stars.filter((s) => s.radius > 0.8);
        const pool = candidates.length > 0 ? candidates : stars;
        flaring = pool[Math.floor(random() * pool.length)];
        flareAge = 0;
        nextFlare =
          elapsed + FLARE_GAP[0] + random() * (FLARE_GAP[1] - FLARE_GAP[0]);
      }

      // --- meteors ---
      if (elapsed >= nextMeteor) {
        spawnMeteor();
        nextMeteor =
          elapsed + METEOR_GAP[0] + random() * (METEOR_GAP[1] - METEOR_GAP[0]);
      }

      for (let i = meteors.length - 1; i >= 0; i--) {
        const meteor = meteors[i];
        meteor.x += meteor.vx * dt;
        meteor.y += meteor.vy * dt;
        meteor.life += dt;
        if (
          meteor.life >= meteor.maxLife ||
          meteor.x < -meteor.length - 60 ||
          meteor.y > height + meteor.length + 60
        ) {
          meteors.splice(i, 1);
        }
      }

      paint(elapsed);
      frame = requestAnimationFrame(loop);
    }

    function onVisibilityChange() {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(frame);
      } else if (!running) {
        running = true;
        last = performance.now();
        frame = requestAnimationFrame(loop);
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    frame = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [density, reduced]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="universe-nebula absolute inset-0" />
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div className="universe-vignette absolute inset-0" />
    </div>
  );
}
