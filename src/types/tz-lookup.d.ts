/**
 * `tz-lookup` ships no type declarations. It exports a single function mapping
 * a coordinate pair to an IANA timezone name.
 */
declare module "tz-lookup" {
  export default function tzLookup(latitude: number, longitude: number): string;
}
