"use client";

import { useEffect, useMemo, useState } from "react";

import { createReading } from "@/lib/astro/reading";
import type { DailyReading } from "@/lib/astro/types";
import {
  readingInstant,
  resolveBirthMoment,
  todayIn,
} from "@/lib/geo/timezone";
import { localProfileRepository } from "@/lib/profile/local-storage";
import type { Profile } from "@/lib/profile/types";

/**
 * Loads the active profile and computes its reading entirely in the browser.
 *
 * `astronomy-engine` is pure JavaScript, so a full chart plus two transit sets
 * costs a few milliseconds. Doing it client-side means changing the date is
 * instant and no birth data ever leaves the device.
 */
export function useReading() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const activeId = await localProfileRepository.getActiveId();
      const found = activeId
        ? await localProfileRepository.get(activeId)
        : ((await localProfileRepository.list())[0] ?? null);

      if (cancelled) return;
      setProfile(found);
      if (found) setDate(todayIn(found.place.timezone));
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const { reading, error } = useMemo((): {
    reading: DailyReading | null;
    error: string | null;
  } => {
    if (!profile || !date) return { reading: null, error: null };

    try {
      const { timezone } = profile.place;
      const birth = resolveBirthMoment(profile.date, profile.time, timezone);

      return {
        reading: createReading({
          birth: {
            date: profile.date,
            time: profile.time,
            place: profile.place,
          },
          birthUtc: birth.utc,
          at: readingInstant(date, timezone),
          localDate: date,
        }),
        error: null,
      };
    } catch (cause) {
      return { reading: null, error: (cause as Error).message };
    }
  }, [profile, date]);

  return { profile, reading, date, setDate, loading, error };
}
