import { z } from "zod";

/**
 * A saved birth profile. Validated on read as well as write, because
 * localStorage is user-writable and can hold data from an older app version.
 */
export const placeSchema = z.object({
  label: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.string().min(1),
});

export const profileSchema = z.object({
  id: z.string().min(1),
  name: z.string().max(60),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  /** True when the user did not know their birth time and we defaulted to noon. */
  timeUnknown: z.boolean().default(false),
  place: placeSchema,
  createdAt: z.string(),
});

export type Profile = z.infer<typeof profileSchema>;
export type Place = z.infer<typeof placeSchema>;

/**
 * Storage contract. The app depends only on this interface, so swapping
 * localStorage for a database later is a new implementation rather than a
 * rewrite of the components that consume it.
 */
export interface ProfileRepository {
  list(): Promise<Profile[]>;
  get(id: string): Promise<Profile | null>;
  save(profile: Profile): Promise<void>;
  remove(id: string): Promise<void>;
  getActiveId(): Promise<string | null>;
  setActiveId(id: string | null): Promise<void>;
}
