import { LOCATIONS, type Location } from "@/data/locations";

export function searchLocations(
  query: string,
  limit = 8,
): Location[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  const results = LOCATIONS.map((location) => {
    const name = location.name.toLowerCase();
    const searchable = (location.searchable ?? []).map((term) =>
      term.toLowerCase(),
    );

    let score = 0;

    // Exact name match
    if (name === normalizedQuery) {
      score += 100;
    }

    // Name starts with query
    if (name.startsWith(normalizedQuery)) {
      score += 60;
    }

    // Name contains query
    if (name.includes(normalizedQuery)) {
      score += 40;
    }

    // Searchable terms
    for (const term of searchable) {
      if (term === normalizedQuery) {
        score += 80;
      } else if (term.startsWith(normalizedQuery)) {
        score += 40;
      } else if (term.includes(normalizedQuery)) {
        score += 20;
      }
    }

    return {
      location,
      score,
    };
  });

  return results
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((result) => result.location);
}