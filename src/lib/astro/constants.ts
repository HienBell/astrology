/**
 * Reference tables for Jyotish. Names are kept in Sanskrit transliteration with
 * the Western equivalent alongside — the UI shows both, which is how most Vedic
 * software presents it and it helps users bridge from what they already know.
 */

import type { Domain, Graha, RashiIndex } from "./types";

export const RASHIS = [
  { sanskrit: "Mesha", western: "Aries", symbol: "♈", lord: "Mars" },
  { sanskrit: "Vrishabha", western: "Taurus", symbol: "♉", lord: "Venus" },
  { sanskrit: "Mithuna", western: "Gemini", symbol: "♊", lord: "Mercury" },
  { sanskrit: "Karka", western: "Cancer", symbol: "♋", lord: "Moon" },
  { sanskrit: "Simha", western: "Leo", symbol: "♌", lord: "Sun" },
  { sanskrit: "Kanya", western: "Virgo", symbol: "♍", lord: "Mercury" },
  { sanskrit: "Tula", western: "Libra", symbol: "♎", lord: "Venus" },
  { sanskrit: "Vrischika", western: "Scorpio", symbol: "♏", lord: "Mars" },
  { sanskrit: "Dhanu", western: "Sagittarius", symbol: "♐", lord: "Jupiter" },
  { sanskrit: "Makara", western: "Capricorn", symbol: "♑", lord: "Saturn" },
  { sanskrit: "Kumbha", western: "Aquarius", symbol: "♒", lord: "Saturn" },
  { sanskrit: "Meena", western: "Pisces", symbol: "♓", lord: "Jupiter" },
] as const satisfies readonly {
  sanskrit: string;
  western: string;
  symbol: string;
  lord: Graha;
}[];

export const ELEMENTS = ["fire", "earth", "air", "water"] as const;
export type Element = (typeof ELEMENTS)[number];

/** Tattva of a rashi — Aries is fire, then the cycle repeats every four signs. */
export function rashiElement(rashi: RashiIndex): Element {
  return ELEMENTS[rashi % 4];
}

export const MODALITIES = ["movable", "fixed", "dual"] as const;
export type Modality = (typeof MODALITIES)[number];

/** Chara / sthira / dvisvabhava, repeating from Aries. */
export function rashiModality(rashi: RashiIndex): Modality {
  return MODALITIES[rashi % 3];
}

export const GRAHA_GLYPHS: Record<Graha, string> = {
  Sun: "☉",
  Moon: "☾",
  Mars: "♂",
  Mercury: "☿",
  Jupiter: "♃",
  Venus: "♀",
  Saturn: "♄",
  Rahu: "☊",
  Ketu: "☋",
};

/** Two-letter tokens used inside the compact North-Indian chart cells. */
export const GRAHA_SHORT: Record<Graha, string> = {
  Sun: "Su",
  Moon: "Mo",
  Mars: "Ma",
  Mercury: "Me",
  Jupiter: "Ju",
  Venus: "Ve",
  Saturn: "Sa",
  Rahu: "Ra",
  Ketu: "Ke",
};

/**
 * The 27 nakshatras. Lords cycle Ketu→Venus→Sun→Moon→Mars→Rahu→Jupiter→Saturn→
 * Mercury three times, which is what drives the Vimshottari dasha sequence.
 */
export const NAKSHATRAS = [
  "Ashwini",
  "Bharani",
  "Krittika",
  "Rohini",
  "Mrigashira",
  "Ardra",
  "Punarvasu",
  "Pushya",
  "Ashlesha",
  "Magha",
  "Purva Phalguni",
  "Uttara Phalguni",
  "Hasta",
  "Chitra",
  "Swati",
  "Vishakha",
  "Anuradha",
  "Jyeshtha",
  "Mula",
  "Purva Ashadha",
  "Uttara Ashadha",
  "Shravana",
  "Dhanishta",
  "Shatabhisha",
  "Purva Bhadrapada",
  "Uttara Bhadrapada",
  "Revati",
] as const;

/** Vimshottari order — also the nakshatra lord cycle. */
export const VIMSHOTTARI_ORDER: Graha[] = [
  "Ketu",
  "Venus",
  "Sun",
  "Moon",
  "Mars",
  "Rahu",
  "Jupiter",
  "Saturn",
  "Mercury",
];

/** Mahadasha lengths in years; they sum to the 120-year Vimshottari cycle. */
export const VIMSHOTTARI_YEARS: Record<Graha, number> = {
  Ketu: 7,
  Venus: 20,
  Sun: 6,
  Moon: 10,
  Mars: 7,
  Rahu: 18,
  Jupiter: 16,
  Saturn: 19,
  Mercury: 17,
};

export const VIMSHOTTARI_TOTAL_YEARS = 120;

/** Sidereal year in days — the unit Vimshottari periods are measured in. */
export const SIDEREAL_YEAR_DAYS = 365.256_36;

export const NAKSHATRA_ARC = 360 / 27; // 13°20'
export const PADA_ARC = NAKSHATRA_ARC / 4; // 3°20'

export function nakshatraLord(index: number): Graha {
  return VIMSHOTTARI_ORDER[index % 9];
}

/** Rashis a graha rules. Used for dignity and for bhava lordship. */
export const OWN_RASHIS: Record<Graha, RashiIndex[]> = {
  Sun: [4],
  Moon: [3],
  Mars: [0, 7],
  Mercury: [2, 5],
  Jupiter: [8, 11],
  Venus: [1, 6],
  Saturn: [9, 10],
  // The shadowy grahas own no sign; they take on the character of their host.
  Rahu: [],
  Ketu: [],
};

/** Deep exaltation point: rashi plus the exact degree within it. */
export const EXALTATION: Record<Graha, { rashi: RashiIndex; degree: number } | null> = {
  Sun: { rashi: 0, degree: 10 },
  Moon: { rashi: 1, degree: 3 },
  Mars: { rashi: 9, degree: 28 },
  Mercury: { rashi: 5, degree: 15 },
  Jupiter: { rashi: 3, degree: 5 },
  Venus: { rashi: 11, degree: 27 },
  Saturn: { rashi: 6, degree: 20 },
  Rahu: { rashi: 1, degree: 20 },
  Ketu: { rashi: 7, degree: 20 },
};

/** Moolatrikona spans — stronger than own sign, weaker than exaltation. */
export const MOOLATRIKONA: Record<Graha, { rashi: RashiIndex; from: number; to: number } | null> = {
  Sun: { rashi: 4, from: 0, to: 20 },
  Moon: { rashi: 1, from: 4, to: 30 },
  Mars: { rashi: 0, from: 0, to: 12 },
  Mercury: { rashi: 5, from: 16, to: 20 },
  Jupiter: { rashi: 8, from: 0, to: 10 },
  Venus: { rashi: 6, from: 0, to: 15 },
  Saturn: { rashi: 10, from: 0, to: 20 },
  Rahu: null,
  Ketu: null,
};

/** Naisargika (natural) friendships between grahas. */
export const NATURAL_FRIENDS: Record<Graha, Graha[]> = {
  Sun: ["Moon", "Mars", "Jupiter"],
  Moon: ["Sun", "Mercury"],
  Mars: ["Sun", "Moon", "Jupiter"],
  Mercury: ["Sun", "Venus"],
  Jupiter: ["Sun", "Moon", "Mars"],
  Venus: ["Mercury", "Saturn"],
  Saturn: ["Mercury", "Venus"],
  Rahu: ["Venus", "Saturn", "Mercury"],
  Ketu: ["Mars", "Venus", "Saturn"],
};

export const NATURAL_ENEMIES: Record<Graha, Graha[]> = {
  Sun: ["Venus", "Saturn"],
  Moon: [],
  Mars: ["Mercury"],
  Mercury: ["Moon"],
  Jupiter: ["Mercury", "Venus"],
  Venus: ["Sun", "Moon"],
  Saturn: ["Sun", "Moon", "Mars"],
  Rahu: ["Sun", "Moon", "Mars"],
  Ketu: ["Sun", "Moon"],
};

/** Natural benefics; Mercury is conditional but treated as mild benefic here. */
export const BENEFICS: Graha[] = ["Jupiter", "Venus", "Mercury", "Moon"];
export const MALEFICS: Graha[] = ["Saturn", "Mars", "Sun", "Rahu", "Ketu"];

/**
 * Orb (in degrees from the Sun) inside which a graha is burnt up by solar rays
 * and loses its capacity to give results.
 */
export const COMBUSTION_ORB: Record<Graha, number> = {
  Sun: 0,
  Moon: 12,
  Mars: 17,
  Mercury: 14,
  Jupiter: 11,
  Venus: 10,
  Saturn: 15,
  Rahu: 0,
  Ketu: 0,
};

/**
 * Graha drishti (Vedic aspects), expressed as house-distances counted forward
 * from the graha's own position. Every graha sees the 7th; Mars, Jupiter and
 * Saturn have their special additional sights.
 */
export const SPECIAL_DRISHTI: Record<Graha, number[]> = {
  Sun: [7],
  Moon: [7],
  Mars: [4, 7, 8],
  Mercury: [7],
  Jupiter: [5, 7, 9],
  Venus: [7],
  Saturn: [3, 7, 10],
  Rahu: [5, 7, 9],
  Ketu: [5, 7, 9],
};

/**
 * Gochara: houses counted from the natal Moon in which each transiting graha
 * gives favourable results. Straight from the classical Phaladeepika table.
 */
export const GOCHARA_FAVOURABLE: Record<Graha, number[]> = {
  Sun: [3, 6, 10, 11],
  Moon: [1, 3, 6, 7, 10, 11],
  Mars: [3, 6, 11],
  Mercury: [2, 4, 6, 8, 10, 11],
  Jupiter: [2, 5, 7, 9, 11],
  Venus: [1, 2, 3, 4, 5, 8, 9, 11, 12],
  Saturn: [3, 6, 11],
  Rahu: [3, 6, 10, 11],
  Ketu: [3, 6, 11],
};

/**
 * Vedha (obstruction) points, paired positionally with GOCHARA_FAVOURABLE.
 * A favourable transit is cancelled when another graha occupies its vedha house.
 */
export const GOCHARA_VEDHA: Record<Graha, Record<number, number>> = {
  Sun: { 3: 9, 6: 12, 10: 4, 11: 5 },
  Moon: { 1: 5, 3: 9, 6: 12, 7: 2, 10: 4, 11: 8 },
  Mars: { 3: 12, 6: 9, 11: 5 },
  Mercury: { 2: 5, 4: 3, 6: 9, 8: 1, 10: 7, 11: 12 },
  Jupiter: { 2: 12, 5: 4, 7: 3, 9: 10, 11: 8 },
  Venus: { 1: 8, 2: 7, 3: 1, 4: 10, 5: 9, 8: 5, 9: 11, 11: 3, 12: 6 },
  Saturn: { 3: 12, 6: 9, 11: 5 },
  Rahu: { 3: 12, 6: 9, 10: 4, 11: 5 },
  Ketu: { 3: 12, 6: 9, 11: 5 },
};

/**
 * Pairs exempt from causing vedha to each other, per classical texts.
 * Sun/Saturn are father and son; Moon/Mercury are mother and son.
 */
export const VEDHA_EXEMPT: [Graha, Graha][] = [
  ["Sun", "Saturn"],
  ["Moon", "Mercury"],
];

/**
 * Bhava significations mapped onto the five life domains, with a weight for how
 * central that house is to the domain. This table is the bridge between the
 * chart and the reading, so it is deliberately explicit and easy to tune.
 */
export const BHAVA_DOMAINS: Record<number, Partial<Record<Domain, number>>> = {
  1: { health: 1.0, career: 0.3, love: 0.2 },
  2: { money: 1.0, family: 0.6, career: 0.2 },
  3: { career: 0.4, family: 0.3, health: 0.2 },
  4: { family: 1.0, health: 0.3, money: 0.3 },
  5: { love: 0.8, money: 0.4, family: 0.4 },
  6: { health: 0.9, career: 0.5, money: 0.2 },
  7: { love: 1.0, career: 0.3 },
  8: { health: 0.8, money: 0.4, love: 0.3 },
  9: { money: 0.5, family: 0.4, career: 0.4 },
  10: { career: 1.0, money: 0.4 },
  11: { money: 0.9, career: 0.5, love: 0.2 },
  12: { health: 0.6, money: 0.4, love: 0.3 },
};

/** Karakas — the natural significator of each domain, weighted for scoring. */
export const DOMAIN_KARAKAS: Record<Domain, Partial<Record<Graha, number>>> = {
  career: { Sun: 1.0, Saturn: 0.8, Mercury: 0.6, Mars: 0.5 },
  love: { Venus: 1.0, Moon: 0.6, Jupiter: 0.4 },
  family: { Moon: 1.0, Jupiter: 0.7, Venus: 0.4, Sun: 0.3 },
  health: { Sun: 0.8, Mars: 0.6, Saturn: 0.6, Moon: 0.5 },
  money: { Jupiter: 1.0, Venus: 0.6, Mercury: 0.5 },
};
