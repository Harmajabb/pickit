import type { Announce } from "../types/Announce";
import type { AnnounceFilters } from "../types/AnnounceFilters";

// function to fetch featured announces (4 announces))
export async function fetchFeaturedAnnounces(
  filters: AnnounceFilters = {},
): Promise<Announce[]> {
  // with param request we can build dynamic url
  const url = new URL(`${import.meta.env.VITE_API_URL}/api/announcesFiltered`);
  const { q } = filters;
  if (q && q.trim() !== "") {
    url.searchParams.set("q", q.trim());
  }
  // API call to fetch announces
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  // return announces array in JSON format
  return (await res.json()) as Announce[];
}

// function to fetch all announces with search query and filters
export async function fetchAllAnnounces(
  filters: AnnounceFilters = {},
): Promise<Announce[]> {
  const { q, zipcode, category_id } = filters;

  let baseUrl = `${import.meta.env.VITE_API_URL}/api/announces`;
  if (q && q.trim() !== "") {
    baseUrl = `${import.meta.env.VITE_API_URL}/api/searchFullAnnounces`;
  }

  const url = new URL(baseUrl);
  // if search query
  if (q && q.trim() !== "") {
    url.searchParams.set("q", q.trim());
  }
  // if zipcode filter
  if (zipcode) {
    url.searchParams.set("zipcode", zipcode);
  }
  // if category filter
  if (category_id) {
    url.searchParams.set("category_id", String(category_id));
  }
  // fetch one API final call
  const res = await fetch(url.toString());

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  // return announces array in JSON format
  return (await res.json()) as Announce[];
}
