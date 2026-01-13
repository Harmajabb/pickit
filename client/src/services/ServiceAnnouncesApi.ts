import type { Announce } from "../types/Announce";
// function to fetch featured announces (4 announces))
export async function fetchFeaturedAnnounces(q?: string): Promise<Announce[]> {
  // with param request we can build dynamic url
  const url = new URL(`${import.meta.env.VITE_API_URL}/api/announcesFiltered`);
  if (q && q.trim() !== "") url.searchParams.set("q", q.trim());
  // API call to fetch announces
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  // return announces array in JSON format
  return (await res.json()) as Announce[];
}

// function to fetch all announces with search query
export async function fetchAllAnnounces(q?: string): Promise<Announce[]> {
  if (q && q.trim() !== "") {
    const url = new URL(
      `${import.meta.env.VITE_API_URL}/api/searchFullAnnounces`,
    );
    url.searchParams.set("q", q.trim());
    // API call to fetch announces
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    // return announces array in JSON format
    return (await res.json()) as Announce[];
  }
  //without search query, fetch all announces
  const url = new URL(`${import.meta.env.VITE_API_URL}/api/announces`);
  if (q && q.trim() !== "") url.searchParams.set("q", q.trim());
  // API call to fetch announces
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  // return announces array in JSON format
  return (await res.json()) as Announce[];
}
