"use client";

import { profileSchema, type Profile, type ProfileRepository } from "./types";

const PROFILES_KEY = "thiendo.profiles.v1";
const ACTIVE_KEY = "thiendo.activeProfile.v1";

function readAll(): Profile[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PROFILES_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Drop anything that no longer matches the schema rather than crashing the
    // whole app because one stale record is malformed.
    return parsed.flatMap((entry) => {
      const result = profileSchema.safeParse(entry);
      return result.success ? [result.data] : [];
    });
  } catch {
    return [];
  }
}

function writeAll(profiles: Profile[]): void {
  window.localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

/** localStorage-backed implementation of the profile repository. */
export const localProfileRepository: ProfileRepository = {
  async list() {
    return readAll();
  },

  async get(id) {
    return readAll().find((p) => p.id === id) ?? null;
  },

  async save(profile) {
    const all = readAll();
    const index = all.findIndex((p) => p.id === profile.id);
    if (index >= 0) all[index] = profile;
    else all.unshift(profile);
    writeAll(all);
  },

  async remove(id) {
    writeAll(readAll().filter((p) => p.id !== id));
    if (window.localStorage.getItem(ACTIVE_KEY) === id) {
      window.localStorage.removeItem(ACTIVE_KEY);
    }
  },

  async getActiveId() {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(ACTIVE_KEY);
  },

  async setActiveId(id) {
    if (id === null) window.localStorage.removeItem(ACTIVE_KEY);
    else window.localStorage.setItem(ACTIVE_KEY, id);
  },
};

export function createProfileId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `p_${Date.now().toString(36)}`;
}
