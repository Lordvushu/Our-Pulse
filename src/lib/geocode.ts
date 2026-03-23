/**
 * Reverse geocodes lat/lng to a human-readable city name.
 * Uses BigDataCloud's free, no-API-key endpoint.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return 'Unknown location';
    const data = await res.json();
    const suburb = data.localityInfo?.administrative?.find(
      (a: { adminLevel: number; name: string }) => a.adminLevel === 9 || a.adminLevel === 8
    )?.name;
    const city = data.city || data.locality || data.principalSubdivision;
    if (suburb && city && suburb !== city) return `${suburb}, ${city}`;
    return city || data.countryName || 'Unknown location';
  } catch {
    return 'Unknown location';
  }
}
