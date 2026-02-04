import {
  createContext, //create the announcements context
  type ReactNode,
  useCallback, // memoize the refreshAnnounces function and silence dependency warnings in useEffect
  useContext, // consume the context in the useAnnounces hook
  useState, // manage the state of announcements, the request, loading, and errors
} from "react";
import { fetchAllAnnounces } from "../services/ServiceAnnouncesApi"; // import of the fetchAnnounces function to retrieve announcements from the API
import type { Announce } from "../types/Announce"; // import of the Announce type to type the announcements
import type { AnnounceFilters } from "../types/AnnounceFilters";

type AnnouncesContextType = {
  announces: Announce[]; // announcements array
  isLoading: boolean; // announcements loading indicator
  error: string | null; // error message in case of a loading issue
  refreshAnnounces: (filters: AnnounceFilters) => void; // function to refresh the list of announcements, optionally with a search query
  // note: the function returns a Promise<void> because it is asynchronous
};

// Creation of the announcements context with a type that can be undefined
// to handle the case where the context is not yet provided
const AnnouncesContext = createContext<AnnouncesContextType | undefined>(
  undefined,
);

// Announcements context provider, which wraps child components
// and provides them with access to data and functions related to announcements
export function AnnouncesProvider({ children }: { children: ReactNode }) {
  // console.log("AnnouncesProvider rendered");
  const [announces, setAnnounces] = useState<Announce[]>([]); // state to store the announcements
  const [isLoading, setIsLoading] = useState(true); // state to indicate if the announcements are loading
  const [error, setError] = useState<string | null>(null); // state to store a potential error message

  // Function to refresh the list of announcements, with an optional search query
  // Uses useCallback to memoize the function and avoid unnecessary recreations.
  // biome requested this.
  const refreshAnnounces = useCallback(
    async (filters: AnnounceFilters = {}) => {
      // console.log("Refreshing announces with query:", q);
      setIsLoading(true);
      setError(null);

      // Call to the fetchAnnounces function to retrieve announcements from the API
      try {
        const data = await fetchAllAnnounces(filters);
        console.log("Fetched announces:", data);
        setAnnounces(data);
      } catch {
        // console.error("Error fetching announces");
        // In case of an error, update the error state
        setError("Failed to fetch announces");
      } finally {
        // Always disable the loading indicator at the end
        setIsLoading(false);
      }
    },
    [],
  );

  // Context value to provide to child components
  const value: AnnouncesContextType = {
    announces,
    isLoading,
    error,
    refreshAnnounces,
  };

  // allows child components to access the announcements context
  return (
    <AnnouncesContext.Provider value={value}>
      {children}
    </AnnouncesContext.Provider>
  );
}

// Custom hook to consume the announcements context
export function useAnnounces() {
  const ctx = useContext(AnnouncesContext);
  if (ctx === undefined) {
    throw new Error("useAnnounces must be used within an AnnouncesProvider");
  }
  return ctx;
}
