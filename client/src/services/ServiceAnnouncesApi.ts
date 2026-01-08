import type { Announce } from "../types/Announce";
// Fonction pour récupérer les annonces depuis l'API, avec une option de requête de recherche
export async function fetchFeaturedAnnounces(q?: string): Promise<Announce[]> {
  // Construction de l'URL avec le paramètre de requête
  const url = new URL(`${import.meta.env.VITE_API_URL}/api/announcesFiltered`);
  if (q && q.trim() !== "") url.searchParams.set("q", q.trim());
  // Appel de l'API pour récupérer les annonces
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  // Retourne les données des annonces sous forme de tableau d'objets Announce
  return (await res.json()) as Announce[];
}

export async function fetchAllAnnounces(q?: string): Promise<Announce[]> {
  const url = new URL(`${import.meta.env.VITE_API_URL}/api/announces`);
  if (q && q.trim() !== "") url.searchParams.set("q", q.trim());

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  return (await res.json()) as Announce[];
}
