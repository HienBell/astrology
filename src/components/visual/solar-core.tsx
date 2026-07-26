"use client";

/**
 * A genuinely burning sun, drawn by a WebGL2 fragment shader.
 *
 * The previous version rotated a static bitmap, which reads as a spinning
 * sticker: a real photosphere is a boiling field of convection cells that are
 * continuously born, sheared and dissolved. Here the surface is domain-warped
 * fBm noise sampled in spherical coordinates, so the granulation churns and
 * never repeats, the limb darkens the way a real photosphere does, and the
 * corona is filamentary rather than a uniform blur.
 *
 * Costs no network bytes, tints to the palette, and falls back to the original
 * image when WebGL2 is unavailable.
 */

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

const VERTEX_SHADER = /* glsl */ `#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`;

const FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;

uniform vec2  uResolution;
uniform float uTime;

out vec4 fragColor;

/* Radius of the photosphere in normalised units; the rest of the frame is
   left for the corona to reach into. */
const float DISC = 0.56;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
        mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
    mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
        mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
    f.z);
}

float fbm(vec3 p) {
  float amplitude = 0.5;
  float total = 0.0;
  for (int i = 0; i < 5; i++) {
    total += amplitude * noise(p);
    p *= 2.03;
    amplitude *= 0.5;
  }
  return total;
}

/* Turbulent variant — the absolute value creates the sharp creases between
   granules that plain fBm lacks. */
float turbulence(vec3 p) {
  float amplitude = 0.5;
  float total = 0.0;
  for (int i = 0; i < 5; i++) {
    total += amplitude * abs(noise(p) * 2.0 - 1.0);
    p *= 2.07;
    amplitude *= 0.5;
  }
  return total;
}

mat3 rotateY(float a) {
  float s = sin(a), c = cos(a);
  return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c);
}

/* Blackbody-ish ramp from the cool intergranular lanes through to the hottest
   granule cores. */
vec3 plasmaRamp(float h) {
  h = clamp(h, 0.0, 1.0);
  vec3 deep   = vec3(0.35, 0.045, 0.005);
  vec3 ember  = vec3(0.92, 0.24,  0.03);
  vec3 flame  = vec3(1.00, 0.58,  0.10);
  vec3 gold   = vec3(1.00, 0.85,  0.42);
  vec3 white  = vec3(1.00, 0.98,  0.90);

  vec3 c = mix(deep,  ember, smoothstep(0.00, 0.30, h));
  c      = mix(c,     flame, smoothstep(0.28, 0.55, h));
  c      = mix(c,     gold,  smoothstep(0.52, 0.78, h));
  c      = mix(c,     white, smoothstep(0.80, 1.00, h));
  return c;
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution) / min(uResolution.x, uResolution.y);
  float r = length(uv);
  float t = uTime;

  vec3 colour = vec3(0.0);

  /* ---------------- Photosphere ---------------- */
  if (r < DISC) {
    float rn = r / DISC;
    // Reconstruct the sphere's front hemisphere so the noise wraps around a
    // ball rather than sliding across a flat disc.
    float z = sqrt(max(0.0, 1.0 - rn * rn));
    vec3 sphere = vec3(uv / DISC, z);

    vec3 p = rotateY(t * 0.055) * sphere;

    // Domain warp: displacing the sample point by another noise field is what
    // makes the cells shear and swirl instead of merely fading in place.
    vec3 warp = vec3(
      fbm(p * 2.6 + vec3(0.0, 0.0, t * 0.14)),
      fbm(p * 2.6 + vec3(5.2, 1.3, t * 0.11)),
      fbm(p * 2.6 + vec3(9.1, 4.7, -t * 0.09))
    );

    float granules = turbulence(p * 6.2 + warp * 2.6 + vec3(0.0, 0.0, t * 0.22));
    float coarse   = fbm(p * 2.1 + warp * 1.2 - vec3(0.0, 0.0, t * 0.06));

    float heat = granules * 0.72 + coarse * 0.5;

    // Supergranulation: slow, large bright regions drifting under the surface.
    heat += 0.22 * fbm(p * 1.15 + vec3(0.0, 0.0, t * 0.03));

    // Limb darkening — the classic photosphere falloff toward the edge.
    float mu = z;
    heat *= 0.42 + 0.72 * pow(mu, 0.55);

    colour = plasmaRamp(heat);

    // Soften the silhouette so the disc never shows a hard vector edge.
    colour *= smoothstep(1.0, 0.955, rn);
  }

  /* ---------------- Corona and prominences ---------------- */
  float rn = r / DISC;
  if (rn > 0.86) {
    float angle = atan(uv.y, uv.x);

    // Sample the filament field on a ring so it is continuous across the
    // angle wrap at ±pi.
    vec3 ring = vec3(cos(angle), sin(angle), 0.0) * 2.4;

    float filaments = fbm(ring * 1.7 + vec3(0.0, 0.0, t * 0.13));
    filaments = pow(filaments, 1.7);

    // Streaks stretch outward, so include radius in the sample.
    float streaks = fbm(ring * 3.1 + vec3(0.0, 0.0, rn * 1.6 - t * 0.2));

    // Slow falloff so the corona actually reaches into the frame rather
    // than hugging the limb.
    float falloff = exp(-(rn - 0.86) * 2.25);
    float halo = falloff * (0.34 + 1.30 * filaments * (0.45 + 0.85 * streaks));

    // Prominences: a few loops that swell and subside on their own clocks.
    float loops = 0.0;
    for (int i = 0; i < 3; i++) {
      float fi = float(i);
      float seed = fi * 21.7;
      // Each loop wanders slowly around the limb.
      float centre = sin(t * (0.07 + fi * 0.019) + seed) * 3.14159;
      float d = abs(atan(sin(angle - centre), cos(angle - centre)));
      float width = 0.20 + 0.10 * sin(t * 0.23 + seed);
      float arc = exp(-d * d / (width * width));
      // Eruption envelope — quiet, then a surge, then decay.
      float pulse = pow(max(0.0, sin(t * (0.19 + fi * 0.041) + seed)), 5.0);
      // A stronger surge throws the loop further out.
      float reach = exp(-(rn - 0.9) * (5.2 - 2.6 * pulse));
      loops += arc * pulse * reach;
    }

    float total = halo + loops * 1.05;
    vec3 coronaColour = mix(
      vec3(1.00, 0.45, 0.08),
      vec3(1.00, 0.86, 0.52),
      clamp(total * 0.9, 0.0, 1.0)
    );

    // Additive so the corona reads as emitted light over the page background.
    colour += coronaColour * total * smoothstep(0.86, 1.0, rn);
  }

  // Gentle bloom lift near the limb where the eye expects glare.
  colour += vec3(1.0, 0.62, 0.22) * exp(-abs(rn - 1.0) * 7.0) * 0.22;

  float alpha = clamp(max(max(colour.r, colour.g), colour.b), 0.0, 1.0);
  fragColor = vec4(colour, alpha);
}`;

function compile(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/** Upper bound on the backing store. The sun is a soft object, so upscaling a
 *  smaller buffer is invisible and keeps integrated GPUs at 60fps. */
const MAX_BUFFER = 680;

export function SolarCore({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: false,
      powerPreference: "low-power",
    });

    if (!gl) {
      setFailed(true);
      return;
    }

    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    const program = gl.createProgram();

    if (!vertex || !fragment || !program) {
      setFailed(true);
      return;
    }

    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setFailed(true);
      return;
    }

    gl.useProgram(program);

    // Fullscreen triangle pair.
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );

    const positionLocation = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const resolutionLocation = gl.getUniformLocation(program, "uResolution");
    const timeLocation = gl.getUniformLocation(program, "uTime");

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    let width = 0;
    let height = 0;

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const scale = Math.min(
        1,
        MAX_BUFFER / (Math.max(rect.width, rect.height) * dpr),
      );

      const next = {
        w: Math.max(1, Math.round(rect.width * dpr * scale)),
        h: Math.max(1, Math.round(rect.height * dpr * scale)),
      };

      if (next.w === width && next.h === height) return;
      width = next.w;
      height = next.h;
      canvas!.width = width;
      canvas!.height = height;
      gl!.viewport(0, 0, width, height);
      gl!.uniform2f(resolutionLocation, width, height);
    }

    function draw(seconds: number) {
      gl!.uniform1f(timeLocation, seconds);
      gl!.clearColor(0, 0, 0, 0);
      gl!.clear(gl!.COLOR_BUFFER_BIT);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
    }

    const observer = new ResizeObserver(() => {
      resize();
      // Repaint immediately so a resize never shows an empty frame.
      if (reduced) draw(12);
    });
    observer.observe(canvas);
    resize();

    if (reduced) {
      // A single representative frame — still detailed, but motionless.
      draw(12);
      return () => {
        observer.disconnect();
        gl.deleteProgram(program);
      };
    }

    let frame = 0;
    let running = true;
    const start = performance.now();

    function loop(now: number) {
      if (!running) return;
      draw((now - start) / 1000);
      frame = requestAnimationFrame(loop);
    }

    // Only burn GPU time while the sun is actually on screen.
    const visibility = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true;
          frame = requestAnimationFrame(loop);
        } else if (!entry.isIntersecting && running) {
          running = false;
          cancelAnimationFrame(frame);
        }
      },
      { rootMargin: "150px" },
    );
    visibility.observe(canvas);

    function onVisibilityChange() {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(frame);
      } else if (!running) {
        running = true;
        frame = requestAnimationFrame(loop);
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    frame = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      visibility.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      gl.deleteBuffer(buffer);
    };
  }, [reduced]);

  if (failed) {
    // No WebGL2 — keep the original artwork rather than an empty hole.
    return (
      <Image
        src="/celestial/sun.webp"
        alt=""
        fill
        sizes="(max-width: 1024px) 90vw, 46vw"
        className={cn("solar-surface select-none object-contain", className)}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={cn("absolute inset-0 h-full w-full", className)}
    />
  );
}
