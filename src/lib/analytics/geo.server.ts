export type GeoLocation = {
  country: string | null;
  countryCode: string | null;
  city: string | null;
};

type CacheEntry = {
  geo: GeoLocation;
  expiresAt: number;
};

const GEO_TTL_MS = 24 * 60 * 60 * 1000;
const geoCache = new Map<string, CacheEntry>();

/** Cap outbound IP lookups so a traffic spike cannot hammer the free API. */
const MAX_LOOKUPS_PER_MINUTE = 30;
const lookupTimestamps: number[] = [];

function pruneLookupTimestamps(now: number) {
  while (lookupTimestamps.length > 0 && now - lookupTimestamps[0]! > 60_000) {
    lookupTimestamps.shift();
  }
}

function canLookup(now: number): boolean {
  pruneLookupTimestamps(now);
  return lookupTimestamps.length < MAX_LOOKUPS_PER_MINUTE;
}

function rememberLookup(now: number) {
  lookupTimestamps.push(now);
}

function countryNameFromCode(code: string): string {
  const upper = code.trim().toUpperCase();
  if (!upper || upper === "XX" || upper === "T1") return upper || "Unknown";
  try {
    return (
      new Intl.DisplayNames(["en"], { type: "region" }).of(upper) ?? upper
    );
  } catch {
    return upper;
  }
}

function isPrivateOrLocalIp(ip: string): boolean {
  const value = ip.trim().toLowerCase();
  if (
    !value ||
    value === "unknown" ||
    value === "localhost" ||
    value === "::1" ||
    value === "0.0.0.0"
  ) {
    return true;
  }

  if (value.includes(":")) {
    // IPv6 unique-local / link-local
    if (
      value.startsWith("fc") ||
      value.startsWith("fd") ||
      value.startsWith("fe80")
    ) {
      return true;
    }
    return false;
  }

  const parts = value.split(".").map((p) => Number(p));
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) {
    return true;
  }
  const [a, b] = parts as [number, number, number, number];
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}

function firstPublicIp(candidates: Array<string | undefined | null>): string | null {
  for (const raw of candidates) {
    if (!raw) continue;
    for (const part of raw.split(",")) {
      const ip = part.trim().replace(/^\[|\]$/g, "");
      if (!ip || isPrivateOrLocalIp(ip)) continue;
      return ip;
    }
  }
  return null;
}

type HeaderMap = {
  get(name: string): string | null | undefined;
};

function header(headers: HeaderMap, name: string): string | null {
  const value = headers.get(name)?.trim();
  return value && value.length > 0 ? value : null;
}

function geoFromPlatformHeaders(headers: HeaderMap): GeoLocation | null {
  const countryCode = (
    header(headers, "cf-ipcountry") ??
    header(headers, "x-vercel-ip-country") ??
    header(headers, "cloudfront-viewer-country") ??
    header(headers, "x-country-code") ??
    header(headers, "x-nf-country") ??
    header(headers, "x-appengine-country") ??
    header(headers, "fastly-client-country-code")
  )?.toUpperCase() ?? null;

  const city =
    header(headers, "cf-ipcity") ??
    header(headers, "x-vercel-ip-city") ??
    header(headers, "cloudfront-viewer-city");

  const decodedCity = city ? decodeURIComponent(city) : null;

  if (!countryCode && !decodedCity) return null;

  // Cloudflare "XX" / "T1" are unknown / Tor — treat as unresolved.
  if (countryCode === "XX" || countryCode === "T1") {
    return decodedCity
      ? { country: null, countryCode: null, city: decodedCity }
      : null;
  }

  return {
    country: countryCode ? countryNameFromCode(countryCode) : null,
    countryCode,
    city: decodedCity,
  };
}

function readCache(ip: string, now: number): GeoLocation | null {
  const hit = geoCache.get(ip);
  if (!hit) return null;
  if (hit.expiresAt <= now) {
    geoCache.delete(ip);
    return null;
  }
  return hit.geo;
}

function writeCache(ip: string, geo: GeoLocation, now: number) {
  geoCache.set(ip, { geo, expiresAt: now + GEO_TTL_MS });
  // Soft bound — drop oldest entries if the map grows large.
  if (geoCache.size > 5_000) {
    const oldest = geoCache.keys().next().value;
    if (oldest) geoCache.delete(oldest);
  }
}

async function lookupIpApi(ip: string, now: number): Promise<GeoLocation | null> {
  if (!canLookup(now)) return null;
  rememberLookup(now);

  try {
    const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(2_500),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      error?: boolean;
      reason?: string;
      country_name?: string;
      country_code?: string;
      city?: string;
    };
    if (data.error) return null;

    const countryCode = data.country_code?.trim().toUpperCase() || null;
    const country =
      data.country_name?.trim() ||
      (countryCode ? countryNameFromCode(countryCode) : null);
    const city = data.city?.trim() || null;
    if (!country && !city) return null;
    return { country, countryCode, city };
  } catch {
    return null;
  }
}

function mergeGeo(primary: GeoLocation | null, fallback: GeoLocation | null): GeoLocation {
  return {
    country: primary?.country ?? fallback?.country ?? null,
    countryCode: primary?.countryCode ?? fallback?.countryCode ?? null,
    city: primary?.city ?? fallback?.city ?? null,
  };
}

/**
 * Resolve visitor country + city from the incoming request.
 * Prefers edge/platform geo headers, then a cached IP lookup.
 */
export async function resolveRequestGeo(headers: HeaderMap): Promise<GeoLocation> {
  const platform = geoFromPlatformHeaders(headers);
  const ip = firstPublicIp([
    header(headers, "cf-connecting-ip"),
    header(headers, "true-client-ip"),
    header(headers, "x-real-ip"),
    header(headers, "x-client-ip"),
    header(headers, "x-forwarded-for"),
    header(headers, "x-vercel-forwarded-for"),
  ]);

  // Complete platform answer — no need to call an external API.
  if (platform?.country && platform.city) {
    return platform;
  }

  if (!ip) {
    if (platform?.country || platform?.city) return platform;
    // Local / private / missing IP — mark clearly for admin UI.
    return { country: "Local", countryCode: null, city: "Local" };
  }

  const now = Date.now();
  const cached = readCache(ip, now);
  if (cached) {
    return mergeGeo(cached, platform);
  }

  // Need city (or any missing field) — try IP API once, then cache.
  const needsLookup = !platform?.city || !platform?.country;
  const lookedUp = needsLookup ? await lookupIpApi(ip, now) : null;
  const merged = mergeGeo(lookedUp, platform);

  if (merged.country || merged.city) {
    writeCache(ip, merged, now);
    return merged;
  }

  writeCache(
    ip,
    { country: "Local", countryCode: null, city: "Local" },
    now,
  );
  return { country: "Local", countryCode: null, city: "Local" };
}

const TIMEZONE_COUNTRY: Record<string, string> = {
  "Europe/Warsaw": "PL",
  "Europe/Kyiv": "UA",
  "Europe/Kiev": "UA",
  "Europe/Uzhgorod": "UA",
  "Europe/Zaporozhye": "UA",
  "Europe/Berlin": "DE",
  "Europe/London": "GB",
  "Europe/Paris": "FR",
  "Europe/Amsterdam": "NL",
  "Europe/Prague": "CZ",
  "Europe/Vienna": "AT",
  "Europe/Rome": "IT",
  "Europe/Madrid": "ES",
  "Europe/Lisbon": "PT",
  "Europe/Stockholm": "SE",
  "Europe/Oslo": "NO",
  "Europe/Copenhagen": "DK",
  "Europe/Helsinki": "FI",
  "Europe/Bucharest": "RO",
  "Europe/Sofia": "BG",
  "Europe/Athens": "GR",
  "Europe/Istanbul": "TR",
  "Europe/Riga": "LV",
  "Europe/Vilnius": "LT",
  "Europe/Tallinn": "EE",
  "Europe/Dublin": "IE",
  "Europe/Zurich": "CH",
  "Europe/Brussels": "BE",
  "America/New_York": "US",
  "America/Chicago": "US",
  "America/Denver": "US",
  "America/Los_Angeles": "US",
  "America/Toronto": "CA",
  "America/Vancouver": "CA",
  "America/Sao_Paulo": "BR",
  "Asia/Dubai": "AE",
  "Asia/Singapore": "SG",
  "Asia/Tokyo": "JP",
  "Australia/Sydney": "AU",
};

export function geoFromTimeZone(timezone?: string | null): GeoLocation | null {
  if (!timezone) return null;
  const countryCode = TIMEZONE_COUNTRY[timezone.trim()];
  if (!countryCode) return null;
  return {
    country: countryNameFromCode(countryCode),
    countryCode,
    city: null,
  };
}

/**
 * Weak country fallback from Accept-Language / navigator.language
 * (`uk-UA` → Ukraine). Used only when edge geo headers are missing.
 */
export function geoFromLocale(locale?: string | null): GeoLocation | null {
  if (!locale) return null;
  const parts = locale.trim().replaceAll("_", "-").split("-");
  const region = parts.find((part, index) => {
    if (index === 0) return false;
    return /^[A-Za-z]{2}$/.test(part);
  });
  if (!region) return null;
  const countryCode = region.toUpperCase();
  if (countryCode === "XX" || countryCode === "T1") return null;
  return {
    country: countryNameFromCode(countryCode),
    countryCode,
    city: null,
  };
}

export function isUnresolvedGeo(geo: GeoLocation | null | undefined): boolean {
  if (!geo) return true;
  const country = geo.country?.trim();
  return !country || country === "Local" || country === "Unknown";
}

export function formatGeoLabel(geo: {
  city?: string | null;
  country?: string | null;
}): string {
  const city = geo.city?.trim() || null;
  const country = geo.country?.trim() || null;
  if (city && country && city !== country) return `${city}, ${country}`;
  return city || country || "—";
}
