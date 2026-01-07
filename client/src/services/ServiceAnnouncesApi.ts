import type { Announce } from "../types/Announce";
// Fonction pour récupérer les annonces depuis l'API, avec une option de requête de recherche
export async function fetchAnnounces(q?: string): Promise<Announce[]> {
  // Construction de l'URL avec le paramètre de requête
  const url = new URL(`${import.meta.env.VITE_API_URL}/api/announcesFiltered`);
  if (q && q.trim() !== "") url.searchParams.set("q", q.trim());
  // Appel de l'API pour récupérer les annonces
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  // Retourne les données des annonces sous forme de tableau d'objets Announce
  return (await res.json()) as Announce[];
}
