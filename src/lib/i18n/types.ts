import type { vi } from "./dictionaries/vi";

/**
 * The Vietnamese dictionary defines the contract. Every other locale is typed
 * against it, so a missing or misspelled key is a compile error rather than a
 * blank string in production.
 */
export type Dictionary = typeof vi;
