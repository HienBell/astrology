/**
 * Turns a natal chart plus a day's transits into five scored life domains.
 *
 * Every influence is emitted as a `ScoreFactor` carrying an i18n key and its
 * parameters rather than prose. That keeps the engine deterministic and
 * language-agnostic: the UI renders factors directly, and the LLM layer takes
 * the same structured list as its brief. Nothing here invents text.
 */

import {
  BENEFICS,
  BHAVA_DOMAINS,
  DOMAIN_KARAKAS,
  GOCHARA_FAVOURABLE,
  GOCHARA_VEDHA,
  SPECIAL_DRISHTI,
  VEDHA_EXEMPT,
} from "./constants";
import { houseDistance } from "./chart";
import { DOMAINS, GRAHAS } from "./types";
import type {
  ActiveDasha,
  Domain,
  DomainScore,
  Graha,
  GrahaPosition,
  NatalChart,
  RashiIndex,
  SadeSatiState,
  ScoreFactor,
} from "./types";

/**
 * Converts summed factor influence into the 0–100 band.
 *
 * Tuned empirically (see `scripts/verify-distribution.mts`) so that scores over
 * a large sample of charts centre near 50 with a standard deviation around 13.
 * Lower values produce a technically valid but useless reading where every day
 * scores 48–52; higher values slam everything against the clamps.
 */
const SCORE_GAIN = 13;

/**
 * Population calibration offset.
 *
 * The factor set is structurally net-negative: malefics outnumber benefics
 * among the nine grahas, and most gochara houses are unfavourable. Left
 * uncorrected the whole population would sit in the 40s, which says nothing
 * about any individual. This offset re-centres the distribution so a score is
 * read relative to other charts rather than to an arbitrary zero.
 */
const SCORE_CENTER = 11;

function clamp01to100(value: number): number {
  return Math.max(1, Math.min(99, Math.round(value)));
}

function isBenefic(graha: Graha): boolean {
  return BENEFICS.includes(graha);
}

/** Merges two domain-relevance maps by multiplying a base map with a scalar. */
function scaleDomains(
  base: Partial<Record<Domain, number>>,
  factor: number,
): Partial<Record<Domain, number>> {
  const out: Partial<Record<Domain, number>> = {};
  for (const [domain, weight] of Object.entries(base) as [Domain, number][]) {
    out[domain] = weight * factor;
  }
  return out;
}

/** Domains a graha naturally signifies, from the karaka table. */
function karakaDomains(graha: Graha): Partial<Record<Domain, number>> {
  const out: Partial<Record<Domain, number>> = {};
  for (const domain of DOMAINS) {
    const weight = DOMAIN_KARAKAS[domain][graha];
    if (weight) out[domain] = weight;
  }
  return out;
}

/** Combines several relevance maps, keeping the strongest claim per domain. */
function unionDomains(
  ...maps: Partial<Record<Domain, number>>[]
): Partial<Record<Domain, number>> {
  const out: Partial<Record<Domain, number>> = {};
  for (const map of maps) {
    for (const [domain, weight] of Object.entries(map) as [Domain, number][]) {
      out[domain] = Math.max(out[domain] ?? 0, weight);
    }
  }
  return out;
}

function vedhaExempt(a: Graha, b: Graha): boolean {
  return VEDHA_EXEMPT.some(
    ([x, y]) => (x === a && y === b) || (x === b && y === a),
  );
}

/* -------------------------------------------------------------------------- */
/* Natal baseline                                                             */
/* -------------------------------------------------------------------------- */

/**
 * The birth chart's standing promise for each domain, before any transit.
 *
 * Without this every chart sharing a birthday would read identically. The
 * baseline is what makes one person's "career day" structurally stronger than
 * another's even under the same sky.
 */
function natalBaseline(chart: NatalChart): Record<Domain, number> {
  const baseline = {} as Record<Domain, number>;

  for (const domain of DOMAINS) {
    let total = 0;
    let weightSum = 0;

    // Strength of the domain's natural significators.
    for (const [graha, weight] of Object.entries(
      DOMAIN_KARAKAS[domain],
    ) as [Graha, number][]) {
      total += chart.planets[graha].strength * weight;
      weightSum += weight;
    }

    // Strength of whatever occupies the domain's houses.
    for (const [house, domainMap] of Object.entries(BHAVA_DOMAINS)) {
      const relevance = domainMap[domain];
      if (!relevance) continue;
      const occupants = chart.occupants[Number(house) as 1];
      for (const graha of occupants) {
        const planet = chart.planets[graha];
        const signed = isBenefic(graha)
          ? planet.strength
          : 100 - planet.strength * 0.6;
        total += signed * relevance * 0.5;
        weightSum += relevance * 0.5;
      }
    }

    baseline[domain] = weightSum > 0 ? total / weightSum : 50;
  }

  return baseline;
}

/* -------------------------------------------------------------------------- */
/* Factor collection                                                          */
/* -------------------------------------------------------------------------- */

interface FactorContext {
  chart: NatalChart;
  transits: Record<Graha, GrahaPosition>;
  dasha: ActiveDasha | null;
  sadeSati: SadeSatiState;
}

/**
 * Gochara: each transiting graha judged by its house from the natal Moon,
 * with the classical vedha cancellation applied.
 */
function gocharaFactors(ctx: FactorContext): ScoreFactor[] {
  const { chart, transits } = ctx;
  const moonRashi = chart.moonRashi;
  const factors: ScoreFactor[] = [];

  // House-from-Moon occupancy, needed to test vedha.
  const houseOccupancy = new Map<number, Graha[]>();
  for (const graha of GRAHAS) {
    const house = houseDistance(moonRashi, transits[graha].rashi);
    houseOccupancy.set(house, [...(houseOccupancy.get(house) ?? []), graha]);
  }

  for (const graha of GRAHAS) {
    const transit = transits[graha];
    const houseFromMoon = houseDistance(moonRashi, transit.rashi);
    const favourable = GOCHARA_FAVOURABLE[graha].includes(houseFromMoon);

    // Vedha only obstructs an otherwise favourable transit.
    let obstructed = false;
    if (favourable) {
      const vedhaHouse = GOCHARA_VEDHA[graha][houseFromMoon];
      const blockers = (houseOccupancy.get(vedhaHouse) ?? []).filter(
        (other) => other !== graha && !vedhaExempt(graha, other),
      );
      obstructed = blockers.length > 0;
    }

    if (favourable && obstructed) {
      factors.push({
        key: "factor.gochara.obstructed",
        params: { graha, house: houseFromMoon },
        impact: 0,
        domains: scaleDomains(karakaDomains(graha), 0.4),
      });
      continue;
    }

    // Slow grahas set the season; fast ones only colour the day.
    const pace = graha === "Saturn" || graha === "Jupiter" || graha === "Rahu" || graha === "Ketu"
      ? 1.2
      : graha === "Moon"
        ? 0.7
        : 1.0;

    const impact = (favourable ? 1.4 : -1.1) * pace;

    const houseFromLagna = houseDistance(chart.ascendant.rashi, transit.rashi);
    const domains = unionDomains(
      BHAVA_DOMAINS[houseFromLagna] ?? {},
      scaleDomains(karakaDomains(graha), 0.9),
    );

    factors.push({
      key: favourable ? "factor.gochara.favourable" : "factor.gochara.adverse",
      params: { graha, house: houseFromMoon, houseFromLagna },
      impact,
      domains,
    });
  }

  return factors;
}

/**
 * Graha drishti from transiting grahas onto natal grahas. Conjunction in the
 * same rashi is treated as the closest and strongest contact.
 */
function drishtiFactors(ctx: FactorContext): ScoreFactor[] {
  const { chart, transits } = ctx;
  const factors: ScoreFactor[] = [];

  for (const moving of GRAHAS) {
    const transit = transits[moving];

    for (const natalGraha of GRAHAS) {
      const natal = chart.planets[natalGraha];
      const distance = houseDistance(transit.rashi, natal.rashi);

      const conjunct = distance === 1;
      const aspects = SPECIAL_DRISHTI[moving].includes(distance);
      if (!conjunct && !aspects) continue;

      // Closeness in degrees within the sign sharpens the contact.
      const orb = Math.abs(transit.degreeInRashi - natal.degreeInRashi);
      const tightness = conjunct ? Math.max(0.35, 1 - orb / 30) : 0.6;

      const benefic = isBenefic(moving);
      const magnitude = (conjunct ? 1.6 : 1.0) * tightness;
      const impact = (benefic ? 1 : -1) * magnitude;

      const domains = unionDomains(
        BHAVA_DOMAINS[natal.bhava] ?? {},
        scaleDomains(karakaDomains(natalGraha), 0.8),
      );

      factors.push({
        key: conjunct ? "factor.drishti.conjunction" : "factor.drishti.aspect",
        params: {
          moving,
          natal: natalGraha,
          house: natal.bhava,
          benefic: benefic ? 1 : 0,
        },
        impact,
        domains,
      });
    }
  }

  return factors;
}

/**
 * The running dasha lords. In Jyotish the dasha decides which part of the chart
 * is awake, so these carry more weight than any single transit.
 */
function dashaFactors(ctx: FactorContext): ScoreFactor[] {
  const { chart, dasha } = ctx;
  if (!dasha) return [];

  const factors: ScoreFactor[] = [];
  const levels: [Graha, number, string][] = [
    [dasha.maha.lord, 1.0, "maha"],
    [dasha.antar.lord, 0.75, "antar"],
  ];
  if (dasha.pratyantar) {
    levels.push([dasha.pratyantar.lord, 0.4, "pratyantar"]);
  }

  for (const [lord, weight, level] of levels) {
    const natal = chart.planets[lord];
    // A strong lord delivers its houses' results; a weak one withholds them.
    const impact = ((natal.strength - 50) / 50) * 2.2 * weight;

    const domains = unionDomains(
      BHAVA_DOMAINS[natal.bhava] ?? {},
      karakaDomains(lord),
    );

    factors.push({
      key: `factor.dasha.${level}`,
      params: {
        graha: lord,
        house: natal.bhava,
        dignity: natal.dignity,
        strength: natal.strength,
      },
      impact,
      domains,
    });
  }

  return factors;
}

/** Sade Sati — Saturn's seven-and-a-half year passage over the natal Moon. */
function sadeSatiFactors(ctx: FactorContext): ScoreFactor[] {
  if (!ctx.sadeSati.active || !ctx.sadeSati.phase) return [];

  // The middle leg, with Saturn on the Moon itself, is the heaviest.
  const severity =
    ctx.sadeSati.phase === "peak" ? -2.4 : ctx.sadeSati.phase === "rising" ? -1.5 : -1.1;

  return [
    {
      key: "factor.sadeSati",
      params: { phase: ctx.sadeSati.phase },
      impact: severity,
      domains: { health: 1.0, family: 0.7, money: 0.6, career: 0.5, love: 0.4 },
    },
  ];
}

/** The transiting Moon's own condition — the day's emotional weather. */
function moonFactors(ctx: FactorContext): ScoreFactor[] {
  const moon = ctx.transits.Moon;
  const houseFromLagna = houseDistance(ctx.chart.ascendant.rashi, moon.rashi);

  return [
    {
      key: "factor.moon.nakshatra",
      params: {
        nakshatra: moon.nakshatra.index,
        lord: moon.nakshatra.lord,
        house: houseFromLagna,
      },
      impact: ((moon.strength - 50) / 50) * 1.1,
      domains: unionDomains(BHAVA_DOMAINS[houseFromLagna] ?? {}, {
        love: 0.4,
        family: 0.5,
        health: 0.4,
      }),
    },
  ];
}

export function collectFactors(ctx: FactorContext): ScoreFactor[] {
  return [
    ...dashaFactors(ctx),
    ...gocharaFactors(ctx),
    ...drishtiFactors(ctx),
    ...sadeSatiFactors(ctx),
    ...moonFactors(ctx),
  ];
}

/* -------------------------------------------------------------------------- */
/* Aggregation                                                                */
/* -------------------------------------------------------------------------- */

/** Raw (unclamped) domain scores — kept separate so trends can compare days. */
export function rawDomainScores(
  chart: NatalChart,
  factors: ScoreFactor[],
): Record<Domain, number> {
  const baseline = natalBaseline(chart);
  const out = {} as Record<Domain, number>;

  for (const domain of DOMAINS) {
    let influence = 0;
    let relevanceSum = 0;

    for (const factor of factors) {
      const relevance = factor.domains[domain];
      if (!relevance) continue;
      influence += factor.impact * relevance;
      relevanceSum += relevance;
    }

    // Normalise by how many factors spoke to this domain, so a domain touched
    // by many weak influences does not out-shout one touched by few strong ones.
    const normalised =
      relevanceSum > 0 ? influence / Math.sqrt(relevanceSum) : 0;

    // Anchor on the natal promise, then let the day move it.
    const anchor = 50 + (baseline[domain] - 50) * 0.45;
    out[domain] = anchor + normalised * SCORE_GAIN + SCORE_CENTER;
  }

  return out;
}

export interface BuildScoresArgs {
  chart: NatalChart;
  factors: ScoreFactor[];
  /** Raw scores for the following day, used only to derive the trend arrow. */
  tomorrowRaw?: Record<Domain, number>;
}

export function buildDomainScores({
  chart,
  factors,
  tomorrowRaw,
}: BuildScoresArgs): Record<Domain, DomainScore> {
  const raw = rawDomainScores(chart, factors);
  const out = {} as Record<Domain, DomainScore>;

  for (const domain of DOMAINS) {
    const relevant = factors
      .filter((f) => (f.domains[domain] ?? 0) > 0.15 && f.impact !== 0)
      .sort(
        (a, b) =>
          Math.abs(b.impact * (b.domains[domain] ?? 0)) -
          Math.abs(a.impact * (a.domains[domain] ?? 0)),
      )
      .slice(0, 6);

    let trend: DomainScore["trend"] = "steady";
    if (tomorrowRaw) {
      const delta = tomorrowRaw[domain] - raw[domain];
      if (delta > 2) trend = "rising";
      else if (delta < -2) trend = "falling";
    }

    out[domain] = {
      domain,
      score: clamp01to100(raw[domain]),
      trend,
      factors: relevant,
    };
  }

  return out;
}

/** House Saturn currently occupies counted from the natal Moon. */
export function evaluateSadeSati(
  moonRashi: RashiIndex,
  saturnRashi: RashiIndex,
): SadeSatiState {
  const house = houseDistance(moonRashi, saturnRashi);
  if (house === 12) return { active: true, phase: "rising" };
  if (house === 1) return { active: true, phase: "peak" };
  if (house === 2) return { active: true, phase: "setting" };
  return { active: false, phase: null };
}
