import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { z } from "zod";

import { DOMAINS } from "@/lib/astro/types";
import { LOCALES, type Locale } from "@/lib/i18n/config";

/**
 * Turns the engine's structured factors into prose.
 *
 * The astrology is decided entirely by `lib/astro` before this route is called.
 * The model receives only the computed factors and scores and is instructed to
 * narrate them — it never decides what the chart says. That keeps readings
 * reproducible and stops the model inventing placements.
 */

export const runtime = "nodejs";
// Interpretations are pure functions of the payload; let the platform cache.
export const revalidate = 3600;

const factorSchema = z.object({
  text: z.string(),
  impact: z.number(),
});

const domainSchema = z.object({
  score: z.number(),
  trend: z.enum(["rising", "steady", "falling"]),
  factors: z.array(factorSchema),
});

const requestSchema = z.object({
  locale: z.enum(LOCALES),
  date: z.string(),
  overall: z.number(),
  context: z.object({
    lagna: z.string(),
    moonRashi: z.string(),
    moonNakshatra: z.string(),
    mahadasha: z.string(),
    antardasha: z.string(),
    tithi: z.string(),
    sadeSati: z.string().nullable(),
  }),
  domains: z.record(z.enum(DOMAINS), domainSchema),
});

export type InterpretRequest = z.infer<typeof requestSchema>;

export interface InterpretResponse {
  overall: string;
  domains: Record<string, string>;
}

const LANGUAGE_NAME: Record<Locale, string> = {
  vi: "Vietnamese",
  en: "English",
};

/**
 * Held constant across requests so it sits in the cached prefix. Anything that
 * varies per reading belongs in the user turn, never here.
 */
function systemPrompt(locale: Locale): string {
  return `You are writing the daily reading for a Vedic astrology (Jyotish) application.

A deterministic engine has already cast the chart and computed everything. You receive:
- an overall score and five domain scores (0-100, where 50 is neutral),
- a trend for each domain,
- the specific astrological factors behind each score, each already rendered as a sentence, with a signed impact value.

Your only job is to turn that into prose. Follow these rules exactly:

INTERPRETATION
- Never invent a planetary placement, aspect, dasha, nakshatra or transit that is not in the input. If you want to mention a detail, it must appear in the factors or the context block.
- Let the score set the tone. Below 35 is genuinely difficult; 35-50 is friction; 50-65 is ordinary; 65-80 is favourable; above 80 is strong. Do not write an upbeat paragraph for a score of 30.
- Weight the factors by their impact values. The largest absolute impacts are what the paragraph should be about.
- Where a factor is negative, say so plainly and then say what it asks of the person. Jyotish treats difficulty as instruction, not punishment.

VOICE
- Write like an experienced astrologer talking to one person: warm, direct, specific. Not a horoscope column, not a fortune cookie.
- Second person. Present tense.
- Each domain paragraph: 2-3 sentences, 40-70 words. The overall paragraph: 3-4 sentences.
- Name the actual grahas where it adds meaning. Keep at most one Sanskrit term per paragraph and only if the factors used it.
- No emoji. No exclamation marks. No hedging phrases like "the stars suggest" or "it may be that".

LIMITS
- Never predict a specific event, medical outcome, financial result, or the actions of a named person.
- For health, speak about energy, rest and rhythm — never diagnosis or treatment.
- For money, speak about judgement and timing — never a specific investment or amount.

Write entirely in ${LANGUAGE_NAME[locale]}. Return only the JSON object described by the schema.`;
}

const OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    overall: { type: "string" },
    career: { type: "string" },
    love: { type: "string" },
    family: { type: "string" },
    health: { type: "string" },
    money: { type: "string" },
  },
  required: ["overall", "career", "love", "family", "health", "money"],
  additionalProperties: false,
} as const;

export async function POST(request: Request) {
  const parsed = requestSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_request", detail: parsed.error.issues },
      { status: 400 },
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    // The UI renders the structured factors on their own, so a missing key
    // degrades the experience rather than breaking it.
    return NextResponse.json(
      { error: "not_configured" },
      { status: 503 },
    );
  }

  const payload = parsed.data;
  const client = new Anthropic();

  try {
    const response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 4000,
      // The reading is a writing task over pre-computed analysis; medium effort
      // produces the same prose quality here at a fraction of the latency.
      output_config: {
        effort: "medium",
        format: { type: "json_schema", schema: OUTPUT_SCHEMA },
      },
      system: [
        {
          type: "text",
          text: systemPrompt(payload.locale),
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: JSON.stringify(
            {
              date: payload.date,
              chart: payload.context,
              overall: payload.overall,
              domains: payload.domains,
            },
            null,
            1,
          ),
        },
      ],
    });

    if (response.stop_reason === "refusal") {
      return NextResponse.json({ error: "refused" }, { status: 422 });
    }

    const text = response.content.find((b) => b.type === "text")?.text;
    if (!text) {
      return NextResponse.json({ error: "empty_response" }, { status: 502 });
    }

    const written = JSON.parse(text) as Record<string, string>;

    const result: InterpretResponse = {
      overall: written.overall,
      domains: Object.fromEntries(
        DOMAINS.map((domain) => [domain, written[domain]]),
      ),
    };

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    }
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: "upstream", status: error.status },
        { status: 502 },
      );
    }
    return NextResponse.json({ error: "unknown" }, { status: 500 });
  }
}
