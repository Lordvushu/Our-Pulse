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
    return (
      data.locality ||
      data.city ||
      data.principalSubdivision ||
      data.countryName ||
      'Unknown location'
    );
  } catch {
    return 'Unknown location';
  }
}
