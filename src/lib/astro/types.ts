/**
 * Core domain types for the Jyotish (Vedic) engine.
 *
 * Everything in `lib/astro` is pure, framework-free and deterministic so it can
 * be unit-tested and run on either the server or the client.
 */

/** The nine grahas of Jyotish. Uranus/Neptune/Pluto are intentionally absent. */
export const GRAHAS = [
  "Sun",
  "Moon",
  "Mars",
  "Mercury",
  "Jupiter",
  "Venus",
  "Saturn",
  "Rahu",
  "Ketu",
] as const;

export type Graha = (typeof GRAHAS)[number];

/** 0 = Mesha/Aries … 11 = Meena/Pisces (sidereal). */
export type RashiIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

/** 1 = Lagna … 12. Whole-sign bhavas, as used throughout Jyotish. */
export type BhavaNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type Dignity =
  | "exalted"
  | "moolatrikona"
  | "own"
  | "friend"
  | "neutral"
  | "enemy"
  | "debilitated";

export interface BirthInput {
  /** Local wall-clock date at the place of birth, `YYYY-MM-DD`. */
  date: string;
  /** Local wall-clock time at the place of birth, `HH:mm`. */
  time: string;
  place: PlaceInput;
}

export interface PlaceInput {
  label: string;
  latitude: number;
  /** East-positive. */
  longitude: number;
  /** IANA zone, e.g. `Asia/Ho_Chi_Minh`. Resolved from the coordinates. */
  timezone: string;
}

/** A single graha resolved against the sidereal zodiac. */
export interface GrahaPosition {
  graha: Graha;
  /** Sidereal ecliptic longitude, 0–360. */
  longitude: number;
  /** Degrees within the occupied rashi, 0–30. */
  degreeInRashi: number;
  rashi: RashiIndex;
  bhava: BhavaNumber;
  nakshatra: NakshatraPlacement;
  /** Daily motion in degrees; negative means retrograde. */
  speed: number;
  retrograde: boolean;
  /** Within the Sun's rays — weakens the graha's ability to deliver results. */
  combust: boolean;
  dignity: Dignity;
  /** Shadbala-lite: 0–100 composite strength used by the scoring layer. */
  strength: number;
}

export interface NakshatraPlacement {
  /** 0–26. */
  index: number;
  /** 1–4. */
  pada: 1 | 2 | 3 | 4;
  lord: Graha;
  /** Fraction of the nakshatra already traversed, 0–1. Drives dasha balance. */
  traversed: number;
}

export interface Ascendant {
  /** Sidereal longitude of the lagna. */
  longitude: number;
  rashi: RashiIndex;
  degreeInRashi: number;
  nakshatra: NakshatraPlacement;
}

export interface NatalChart {
  input: BirthInput;
  /** UTC instant of birth. */
  utc: Date;
  julianDay: number;
  ayanamsa: number;
  ascendant: Ascendant;
  planets: Record<Graha, GrahaPosition>;
  /** Bhava number -> grahas occupying it. */
  occupants: Record<BhavaNumber, Graha[]>;
  /** Rashi index of the natal Moon — the Chandra Lagna used for gochara. */
  moonRashi: RashiIndex;
  /** Vimshottari mahadashas covering ~120 years from birth, with antardashas. */
  dashaTree: DashaPeriod[];
}

export interface DashaPeriod {
  lord: Graha;
  start: Date;
  end: Date;
  /** 1 = mahadasha, 2 = antardasha, 3 = pratyantardasha. */
  level: 1 | 2 | 3;
  children?: DashaPeriod[];
}

export interface ActiveDasha {
  maha: DashaPeriod;
  antar: DashaPeriod;
  pratyantar?: DashaPeriod;
}

/** The five life areas the daily reading is broken into. */
export const DOMAINS = [
  "career",
  "love",
  "family",
  "health",
  "money",
] as const;

export type Domain = (typeof DOMAINS)[number];

/**
 * One astrological reason contributing to a domain score.
 *
 * `key` is an i18n key rather than prose so the same factor renders in both
 * locales and can be fed to the LLM layer as structured input.
 */
export interface ScoreFactor {
  key: string;
  /** Interpolated into the i18n string and passed to the LLM for context. */
  params: Record<string, string | number>;
  /** Signed strength of the influence, roughly -3…+3. */
  impact: number;
  /** How relevant this factor is to each domain, 0–1. */
  domains: Partial<Record<Domain, number>>;
}

export interface DomainScore {
  domain: Domain;
  /** 0–100. 50 is astrologically neutral. */
  score: number;
  trend: "rising" | "steady" | "falling";
  /** Factors touching this domain, strongest influence first. */
  factors: ScoreFactor[];
}

export interface DailyReading {
  /** `YYYY-MM-DD` in the subject's own timezone. */
  date: string;
  chart: NatalChart;
  transits: Record<Graha, GrahaPosition>;
  activeDasha: ActiveDasha;
  moonNakshatra: NakshatraPlacement;
  moonRashi: RashiIndex;
  tithi: Tithi;
  sadeSati: SadeSatiState;
  domains: Record<Domain, DomainScore>;
  /** Mean of the five domains, 0–100. */
  overall: number;
}

export interface Tithi {
  /** 1–30. */
  index: number;
  paksha: "shukla" | "krishna";
  /** 0–1 completion of the current tithi. */
  fraction: number;
}

export interface SadeSatiState {
  active: boolean;
  /** Which leg: 12th (rising), 1st (peak), 2nd (setting) from natal Moon. */
  phase: "rising" | "peak" | "setting" | null;
}
