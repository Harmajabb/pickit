import CatalogCard from "../../components/CatalogCard/CatalogCard.tsx";
import "./Catalog.css";
import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Search, ChevronDown } from "lucide-react";
import SearchBar from "../../components/SearchBar/SearchBar.tsx";
import { useAnnounces } from "../../context/AnnouncesContext.tsx";
import type { Announce } from "../../types/Announce.ts";
import type { SearchResult, Tab } from "../../types/Search";
import type { AnnounceFilters } from "../../types/AnnounceFilters.ts";
import { fetchCategories } from "../../services/ServiceSearchApi";
import type { Category } from "../../types/Category.ts";

function Catalog() {
  const navigate = useNavigate();
  const { announces, isLoading, error, refreshAnnounces } = useAnnounces();
  const [searchParams] = useSearchParams(); // Hook to read URL query parameters (e.g. ?q=bike)
  const data = announces as Announce[];

  const q = searchParams.get("q") ?? ""; // extract search query from URL, defaults to empty string if not present
  const zipcode = searchParams.get("zipcode") ?? ""; // extract zipcode filter from URL
  const category_id = searchParams.get("category_id") ?? ""; // extract category filter from URL

  // Local state for the Zipcode and the Category input (to avoid lag)
  const [zipInput, setZipInput] = useState(zipcode);
  const [categories, setCategories] = useState<Category[]>([]);

  // Stabilize updateFilters with useCallback so that the useEffect doesn’t loop
  const updateFilters = useCallback(
    (name: string, value: string) => {
      const newParams = new URLSearchParams(searchParams);
      if (value) {
        newParams.set(name, value);
      } else {
        newParams.delete(name);
      }
      navigate(`/catalog?${newParams.toString()}`);
    },
    [searchParams, navigate],
  );

  // Synchronization of local state when the URL changes (e.g. browser back button)
  useEffect(() => {
    setZipInput(zipcode);
  }, [zipcode]);

  // useEffect(() => {
  //   fetchCategories()
  //     .then((data) => setCategories(data))
  //     .catch((err) => console.error("Erreur catégories:", err));
  // }, []);

  useEffect(() => {
    fetchCategories()
      .then((data) => {
        console.log("Données reçues du serveur :", data); // <--- AJOUTE CE LOG
        setCategories(data);
      })
      .catch((err) => console.error("Erreur catégories:", err));
  }, []);

  const handleZipSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateFilters("zipcode", zipInput);
  };

  // fetch announces when component mounts or when search query and / or filters changes
  useEffect(() => {
    const filters: AnnounceFilters = {
      q,
      zipcode,
      category_id,
    };
    refreshAnnounces(filters);
  }, [q, zipcode, category_id, refreshAnnounces]);

  if (isLoading) {
    return <p>Loading..</p>;
  }
  if (error !== null) {
    console.log(error);

    return <p>An error has occurred</p>;
  }
  // Searchbar function
  const handleSearchSubmit = (q: string, tab: Tab) => {
    if (tab === "announces") {
      navigate(`/catalog?q=${encodeURIComponent(q)}`);
    }
  };

  // Handle selection from search results
  const handleSearchSelect = (result: SearchResult) => {
    if (result.type === "users") {
      // redirection to user profile
      navigate(`/profile/${result.item.id}`);
    } else {
      // redirection to announce details
      navigate(`/catalog?q=${encodeURIComponent(result.item.title)}`);
    }
  };

  return (
    <div className="catalog-page">
      <header className="catalog-header">
        <h1>Item catalog</h1>
        <div className="catalog-search">
          <SearchBar
            placeholder="Search for announcements or members..."
            onSubmit={handleSearchSubmit}
            onSelect={handleSearchSelect}
          />
        </div>
        <div className="catalog-filters">
          <div className="filter-item">
            <select
              value={category_id || ""}
              onChange={(e) => updateFilters("category_id", e.target.value)}
            >
              <option value="">All categories</option>

              {categories.map((cat) => (
                <option key={cat.id} value={cat.id.toString()}>
                  {cat.category}
                </option>
              ))}
            </select>
            <div className="select-icon">
              <ChevronDown size={18} strokeWidth={1.5} />
            </div>
          </div>

          <div className="filter-item zipcode-filter">
            <form onSubmit={handleZipSubmit} className="zip-search-wrapper">
              <input
                type="text"
                placeholder="Zipcode"
                value={zipInput}
                onChange={(e) => setZipInput(e.target.value)}
              />
              <button
                type="submit"
                className="zip-submit-btn"
                title="Validate zipcode"
              >
                <Search size={18} color="#666" />
              </button>
            </form>
          </div>
        </div>

        {q.trim() !== "" && (
          <p className="catalog-subtitle">Results for "{q}"</p>
        )}
      </header>

      <div className="catalog-container">
        {data.map((announce) => (
          <CatalogCard key={announce.id} data={announce} />
        ))}
      </div>
    </div>
  );
}

export default Catalog;
