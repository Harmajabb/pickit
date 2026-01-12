import {
  type ReactNode,
  createContext, //utilisé pour créer le contexte des annonces
  useCallback, //utilisé pour mémoriser la fonction refreshAnnounces et calmer les warnings de dépendances dans useEffect
  useContext, //utilisé pour consommer le contexte dans le hook useAnnounces
  useEffect, //utilisé pour déclencher le chargement initial des annonces lorsque le composant est monté
  useState, //utilisé pour gérer l'état des annonces, de la requête, du chargement et des erreurs
} from "react";
import { fetchAllAnnounces } from "../services/ServiceAnnouncesApi"; //importation de la fonction fetchAnnounces pour récupérer les annonces depuis l'API
import type { Announce } from "../types/Announce"; //importation du type Announce pour typer les annonces

type AnnouncesContextType = {
  announces: Announce[]; //tableau des annonces
  isLoading: boolean; //indicateur de chargement des annonces
  error: string | null; //message d'erreur en cas de problème lors du chargement
  refreshAnnounces: (q?: string) => Promise<void>; //fonction pour rafraîchir la liste des annonces, optionnellement avec une requête de recherche
  // note : la fonction retourne une Promise<void> car elle est asynchrone
};

// Création du contexte des annonces avec un type pouvant être undefined
// pour gérer le cas où le contexte n'est pas encore fourni
const AnnouncesContext = createContext<AnnouncesContextType | undefined>(
  undefined,
);

// Fournisseur du contexte des annonces, qui encapsule les composants enfants
// et leur fournit l'accès aux données et fonctions liées aux annonces
export function AnnouncesProvider({ children }: { children: ReactNode }) {
  // console.log("AnnouncesProvider rendered");
  const [announces, setAnnounces] = useState<Announce[]>([]); //état pour stocker les annonces
  const [isLoading, setIsLoading] = useState(true); //état pour indiquer si les annonces sont en cours de chargement
  const [error, setError] = useState<string | null>(null); //état pour stocker un message d'erreur éventuel

  // Fonction pour rafraîchir la liste des annonces, avec une option de requête de recherche
  // Utilisation de useCallback pour mémoriser la fonction et éviter les recréations inutiles.
  // biome a requêté cela.
  const refreshAnnounces = useCallback(async (q?: string) => {
    // console.log("Refreshing announces with query:", q);
    setIsLoading(true);
    setError(null);

    // Appel de la fonction fetchAnnounces pour récupérer les annonces depuis l'API
    try {
      const data = await fetchAllAnnounces(q);
      // console.log("Fetched announces:", data);
      setAnnounces(data);
    } catch {
      // console.error("Error fetching announces");
      // En cas d'erreur, on met à jour l'état de l'erreur
      setError("Failed to fetch announces");
    } finally {
      // Toujours désactiver l'indicateur de chargement à la fin
      setIsLoading(false);
    }
  }, []);

  // Utilisation de useEffect pour charger les annonces initiales lorsque le composant est monté
  useEffect(() => {
    // console.log("Fetching announces on mount");
    refreshAnnounces();
  }, [refreshAnnounces]);

  // Valeur du contexte à fournir aux composants enfants /!\IMPORTANT/!\
  const value: AnnouncesContextType = {
    announces,
    isLoading,
    error,
    refreshAnnounces,
  };

  // permet aux composants enfants d'accéder au contexte des annonces
  return (
    <AnnouncesContext.Provider value={value}>
      {children}
    </AnnouncesContext.Provider>
  );
}

// Hook personnalisé pour consommer le contexte des annonces
export function useAnnounces() {
  const ctx = useContext(AnnouncesContext);
  if (ctx === undefined) {
    throw new Error("useAnnounces must be used within an AnnouncesProvider");
  }
  return ctx;
}
