import CatalogCard from "../../components/CatalogCard/CatalogCard.tsx";
import "./Catalog.css";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import SearchBar from "../../components/SearchBar/SearchBar.tsx";
import { useAnnounces } from "../../context/AnnouncesContext.tsx";
import type { Announce } from "../../types/Announce.ts";
import type { SearchResult, Tab } from "../../types/Search";

function Catalog() {
  const navigate = useNavigate();
  const { announces, isLoading, error, refreshAnnounces } = useAnnounces();
  const [searchParams] = useSearchParams(); // Hook to read URL query parameters (e.g. ?q=bike)
  const data = announces as Announce[];

  const q = searchParams.get("q") ?? ""; // extract search query from URL, defaults to empty string if not present

  // fetch announces when component mounts or when search query changes
  useEffect(() => {
    refreshAnnounces(q);
  }, [q, refreshAnnounces]);

  if (isLoading) {
    return <p>Loading..</p>;
  }
  if (error !== null) {
    console.log(error);
    return <p>An error has occurred</p>;
  }

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
