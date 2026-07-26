/**
 * Birth-time resolution.
 *
 * A birth time is a *local wall-clock* reading. Converting it to UTC has to use
 * the rules that were in force at that place on that date — Vietnam ran DST as
 * late as 1975 and changed its standard offset several times, so a naive
 * `new Date(...)` would silently shift charts by an hour or more.
 */

import { DateTime } from "luxon";
import tzLookup from "tz-lookup";

/** IANA zone for a coordinate pair. Falls back to UTC for open ocean. */
export function timezoneFor(latitude: number, longitude: number): string {
  try {
    return tzLookup(latitude, longitude);
  } catch {
    return "UTC";
  }
}

export interface ResolvedMoment {
  utc: Date;
  /** Offset actually applied, in minutes east of UTC. */
  offsetMinutes: number;
  /** `+07:00` style label for display. */
  offsetLabel: string;
}

/**
 * Resolves `YYYY-MM-DD` + `HH:mm` in an IANA zone to a UTC instant.
 * Throws on an invalid combination so callers surface it instead of guessing.
 */
export function resolveBirthMoment(
  date: string,
  time: string,
  timezone: string,
): ResolvedMoment {
  const local = DateTime.fromISO(`${date}T${time}`, { zone: timezone });

  if (!local.isValid) {
    throw new Error(
      `Invalid birth moment: ${date} ${time} in ${timezone} (${local.invalidReason})`,
    );
  }

  return {
    utc: local.toUTC().toJSDate(),
    offsetMinutes: local.offset,
    offsetLabel: local.toFormat("ZZ"),
  };
}

/** Today's date as `YYYY-MM-DD` in a given zone. */
export function todayIn(timezone: string): string {
  return DateTime.now().setZone(timezone).toISODate() ?? "";
}

/**
 * The instant to read a day from. Noon local is used rather than midnight so
 * the fast-moving Moon represents the day as a whole rather than its first
 * minute.
 */
export function readingInstant(localDate: string, timezone: string): Date {
  const dt = DateTime.fromISO(`${localDate}T12:00`, { zone: timezone });
  if (!dt.isValid) throw new Error(`Invalid reading date: ${localDate}`);
  return dt.toUTC().toJSDate();
}

/** Shifts a `YYYY-MM-DD` string by whole days, staying in the given zone. */
export function shiftLocalDate(
  localDate: string,
  days: number,
  timezone: string,
): string {
  return (
    DateTime.fromISO(localDate, { zone: timezone })
      .plus({ days })
      .toISODate() ?? localDate
  );
}
