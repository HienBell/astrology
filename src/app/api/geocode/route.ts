import { NextResponse } from "next/server";

import { timezoneFor } from "@/lib/geo/timezone";

/**
 * Place search, proxied through the server.
 *
 * Nominatim requires an identifying User-Agent and rate-limits by client, so
 * calling it from the browser would both violate its policy and expose users
 * to CORS failures. Proxying also lets us attach the resolved timezone in the
 * same round trip.
 */

const NOMINATIM = "https://nominatim.openstreetmap.org/search";
const CONTACT =
  process.env.NOMINATIM_CONTACT ?? "thiendo-astrology (contact via repository)";

export interface GeocodeResult {
  label: string;
  latitude: number;
  longitude: number;
  timezone: string;
  countryCode: string | null;
}

interface NominatimEntry {
  display_name?: string;
  lat?: string;
  lon?: string;
  address?: { country_code?: string };
}

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim();

  if (!query || query.length < 2) {
    return NextResponse.json<GeocodeResult[]>([]);
  }

  const url = new URL(NOMINATIM);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "6");
  url.searchParams.set("addressdetails", "1");
  // Cities, towns and villages are what a birthplace realistically is.
  url.searchParams.set("featureType", "settlement");

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": CONTACT,
        "Accept-Language": request.headers.get("accept-language") ?? "en",
      },
      // Place coordinates are effectively static; cache hard to stay well
      // inside Nominatim's one-request-per-second policy.
      next: { revalidate: 60 * 60 * 24 * 30 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "upstream", status: response.status },
        { status: 502 },
      );
    }

    const entries = (await response.json()) as NominatimEntry[];

    const results: GeocodeResult[] = entries.flatMap((entry) => {
      const latitude = Number(entry.lat);
      const longitude = Number(entry.lon);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return [];

      return [
        {
          label: entry.display_name ?? query,
          latitude,
          longitude,
          timezone: timezoneFor(latitude, longitude),
          countryCode: entry.address?.country_code?.toUpperCase() ?? null,
        },
      ];
    });

    return NextResponse.json(results);
  } catch {
    return NextResponse.json({ error: "unreachable" }, { status: 502 });
  }
}
