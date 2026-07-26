import type { Dictionary } from "../types";

export const en: Dictionary = {
  meta: {
    title: "Thien Do — Vedic Astrology",
    description:
      "Cast a sidereal Jyotish chart and read the day across career, love, family, health and money.",
  },

  nav: {
    home: "Home",
    chart: "Chart",
    today: "Today",
    about: "About Jyotish",
    newChart: "New chart",
  },

  hero: {
    eyebrow: "Vedic Astrology · Jyotish",
    title: "The sky you were born under",
    titleAccent: "is still moving",
    subtitle:
      "Enter your date, time and place of birth. We cast your chart against the real constellations, compute your Vimshottari dasha, and read today across the five areas of your life.",
    cta: "Cast my chart",
    ctaSecondary: "See a sample chart",
    scrollHint: "Scroll to begin",
    stat1: "9 grahas",
    stat1Label: "Planetary forces",
    stat2: "27 stars",
    stat2Label: "Nakshatras",
    stat3: "120 years",
    stat3Label: "Dasha cycle",
  },

  form: {
    title: "Birth details",
    subtitle: "The more exact these are, the truer the chart — especially the time.",
    name: "Name",
    namePlaceholder: "What should we call you?",
    nameHint: "Display only. It never leaves your device.",
    date: "Date of birth",
    time: "Time of birth",
    timeHint:
      "Four minutes moves the ascendant by a degree. If you are unsure, give your closest estimate.",
    place: "Place of birth",
    placePlaceholder: "Search for a city…",
    placeHint: "Used to resolve your timezone and the coordinates for the ascendant.",
    searching: "Searching…",
    noResults: "No place found",
    searchError: "Could not reach the place search. Check your connection and retry.",
    timezone: "Timezone",
    timezoneOverride: "Change timezone",
    timezoneHint:
      "Resolved from the coordinates using historical rules. Only change this if you are certain.",
    submit: "Cast the chart",
    submitting: "Calculating…",
    required: "This field is required",
    invalidDate: "Invalid date",
    invalidTime: "Invalid time",
    placeRequired: "Pick a place from the suggestions",
    unknownTime: "I don't know my birth time",
    unknownTimeNote:
      "We'll use 12:00 noon. The ascendant and house positions will be unreliable, but planetary positions stay correct.",
  },

  domains: {
    career: "Career",
    love: "Love",
    family: "Family",
    health: "Health",
    money: "Money",
  },

  domainTaglines: {
    career: "Work, reputation, direction",
    love: "Partnership, romance, connection",
    family: "Home, parents, roots",
    health: "Body, energy, rhythm",
    money: "Income, assets, opportunity",
  },

  reading: {
    todayTitle: "Today's reading",
    overall: "Overall",
    scoreLabel: "score",
    trendRising: "Rising",
    trendSteady: "Steady",
    trendFalling: "Falling",
    factorsTitle: "Why",
    factorsEmpty: "Nothing significant touches this area today.",
    whyThisScore: "What this score rests on",
    generating: "Interpreting…",
    regenerate: "Interpret again",
    interpretationTitle: "Reading",
    interpretationFallback:
      "The written interpretation is unavailable right now. The astrological factors below are complete and accurate.",
    prevDay: "Previous",
    nextDay: "Next",
    today: "Today",
    dateLabel: "Reading for",
  },

  chart: {
    title: "Natal chart",
    subtitle: "Rashi (D-1) · Sidereal zodiac · Whole-sign houses",
    lagna: "Ascendant",
    lagnaLord: "Ascendant lord",
    ayanamsa: "Ayanamsa (Lahiri)",
    moonSign: "Moon sign",
    sunSign: "Sun sign",
    birthMoment: "Birth moment",
    styleNorth: "North Indian",
    styleSouth: "South Indian",
    styleWheel: "Wheel",
    houseLabel: "House",
    emptyHouse: "Empty",
    tableGraha: "Graha",
    tableSign: "Sign",
    tableDegree: "Degree",
    tableHouse: "House",
    tableNakshatra: "Nakshatra",
    tablePada: "Pada",
    tableDignity: "Dignity",
    tableStrength: "Strength",
    retrograde: "Retrograde",
    combust: "Combust",
    legend: "Legend",
  },

  dasha: {
    title: "Vimshottari Dasha",
    subtitle: "The 120-year timing cycle, counted from the Moon's birth nakshatra",
    maha: "Mahadasha",
    antar: "Antardasha",
    pratyantar: "Pratyantardasha",
    current: "Running now",
    remaining: "Remaining",
    years: "years",
    months: "months",
    days: "days",
    from: "From",
    to: "To",
  },

  sadeSati: {
    title: "Sade Sati",
    active: "Sade Sati is running",
    inactive: "Not in Sade Sati",
    rising: "First phase — Saturn in the 12th from your Moon",
    peak: "Peak phase — Saturn transiting your natal Moon",
    setting: "Final phase — Saturn in the 2nd from your Moon",
    explain:
      "A roughly seven-and-a-half year span while Saturn crosses the three signs around your natal Moon. Tradition reads it as a period of pressure and maturing, not of disaster.",
  },

  panchanga: {
    title: "Today's Panchanga",
    tithi: "Tithi",
    paksha: "Paksha",
    shukla: "Shukla (waxing)",
    krishna: "Krishna (waning)",
    moonNakshatra: "Moon's nakshatra",
    moonSign: "Moon in",
  },

  grahas: {
    Sun: "Sun",
    Moon: "Moon",
    Mars: "Mars",
    Mercury: "Mercury",
    Jupiter: "Jupiter",
    Venus: "Venus",
    Saturn: "Saturn",
    Rahu: "Rahu",
    Ketu: "Ketu",
  },

  grahaSanskrit: {
    Sun: "Surya",
    Moon: "Chandra",
    Mars: "Mangala",
    Mercury: "Budha",
    Jupiter: "Guru",
    Venus: "Shukra",
    Saturn: "Shani",
    Rahu: "Rahu",
    Ketu: "Ketu",
  },

  rashis: [
    "Aries",
    "Taurus",
    "Gemini",
    "Cancer",
    "Leo",
    "Virgo",
    "Libra",
    "Scorpio",
    "Sagittarius",
    "Capricorn",
    "Aquarius",
    "Pisces",
  ],

  dignities: {
    exalted: "Exalted",
    moolatrikona: "Moolatrikona",
    own: "Own sign",
    friend: "Friendly",
    neutral: "Neutral",
    enemy: "Inimical",
    debilitated: "Debilitated",
  },

  bhavas: [
    "Self, body",
    "Wealth, family speech",
    "Siblings, effort",
    "Home, mother",
    "Children, romance",
    "Illness, rivals",
    "Marriage, partners",
    "Upheaval, longevity",
    "Fortune, father",
    "Career, standing",
    "Income, networks",
    "Loss, release",
  ],

  factor: {
    "gochara.favourable":
      "{graha} transits the {house} house from your natal Moon — a favourable gochara position.",
    "gochara.adverse":
      "{graha} sits in the {house} house from your natal Moon — an unfavourable gochara position.",
    "gochara.obstructed":
      "{graha} holds a normally favourable position, but another graha blocks it (vedha), cancelling the result.",
    "drishti.conjunction": "{moving} is conjunct your natal {natal} in the {house} house.",
    "drishti.aspect": "{moving} casts drishti on your natal {natal} in the {house} house.",
    "dasha.maha":
      "{graha} mahadasha — natally placed in house {house}, {dignity}.",
    "dasha.antar":
      "{graha} antardasha — natally placed in house {house}, {dignity}.",
    "dasha.pratyantar":
      "{graha} pratyantardasha — natally placed in house {house}, {dignity}.",
    sadeSati: "You are in the {phase} phase of Sade Sati.",
    "moon.nakshatra":
      "Today's Moon sits in {nakshatra} (ruled by {lord}), falling in your {house} house.",
  },

  sadeSatiPhase: {
    rising: "first",
    peak: "peak",
    setting: "final",
  },

  profile: {
    saved: "Saved profiles",
    savedHint: "Stored on your device. Nothing is sent to a server.",
    switch: "Switch profile",
    delete: "Delete",
    deleteConfirm: "Delete this profile?",
    empty: "No profiles yet",
    add: "Add profile",
  },

  about: {
    title: "A few things worth knowing",
    siderealTitle: "The sidereal zodiac",
    siderealBody:
      "Jyotish measures positions against the actual constellations rather than the spring equinox that Western astrology uses. The two now differ by about 24 degrees, so your Sun sign here will usually fall one sign earlier than the one you know. That is not an error.",
    housesTitle: "Whole-sign houses",
    housesBody:
      "Each zodiac sign is exactly one house, starting from your ascendant. This is the classical Jyotish house scheme and the assumption behind every gochara and dasha rule used here.",
    limitsTitle: "Limits",
    limitsBody:
      "This is a tool for reflection, not for deciding things on your behalf. The scores are a way to visualise how the astrological factors balance out — they are meaningful compared across days, not as an absolute measure. Not a substitute for medical, legal or financial advice.",
  },

  common: {
    loading: "Loading…",
    error: "Something went wrong",
    retry: "Retry",
    back: "Back",
    close: "Close",
    copy: "Copy",
    copied: "Copied",
    share: "Share",
    language: "Language",
    strong: "Strong",
    weak: "Weak",
  },
};
