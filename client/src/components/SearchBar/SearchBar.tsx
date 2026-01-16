import { useEffect, useRef, useState } from "react";
import { searchApi } from "../../services/ServiceSearchApi";
import type { Announce } from "../../types/Announce";
import type { SearchResult, Tab } from "../../types/Search";
import type { UserPublic } from "../../types/User";
import "./SearchBar.css";

interface Props {
  placeholder?: string; // placeholder text for the search input
  onSubmit: (q: string, tab: Tab) => void; // callback when a search is submitted
  onSelect?: (result: SearchResult) => void; // optional callback when a search result is selected
}

function SearchBar({ placeholder = "Search...", onSubmit, onSelect }: Props) {
  const [tab, setTab] = useState<Tab>("announces"); // selected tab announce/user
  const [input, setInput] = useState(""); // current input value
  const [open, setOpen] = useState(false); // dropdown visibility state
  const [results, setResults] = useState<SearchResult[]>([]); // current search results
  const [isLoading, setIsLoading] = useState(false); // loading state during api call
  const containerRef = useRef<HTMLDivElement | null>(null); // ref for detecting outside clicks

  useEffect(() => {
    // the search isn't performed unless the dropdown is closed or query is less than 2 characters
    if (!open || input.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    // debounce the search input by 300ms
    // note Leah: think to use a library like lodash.debounce or use-debounce
    const timer = setTimeout(async () => {
      try {
        const query = input.trim();
        const data = await searchApi(query, tab);

        // transform api response to SearchResult format
        // type property to differentiate between announces and users
        const formattedResults: SearchResult[] =
          tab === "announces"
            ? (data as Announce[]).slice(0, 6).map((item) => ({
                // limit to 6 results
                type: "announces",
                item,
              }))
            : (data as UserPublic[]).slice(0, 6).map((item) => ({
                // limit to 6 results
                type: "users",
                item,
              }));

        setResults(formattedResults);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [input, tab, open]);

  // close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // close dropdown on Escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // handle search submission (button click or enter key)
  const performSubmit = () => {
    const query = input.trim();
    if (query.length < 2) return;

    onSubmit(query, tab);
    setOpen(false);
  };

  // handle form submission (enter key)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSubmit();
  };
  // handle selection of a search result (click)
  const handlePick = (result: SearchResult) => {
    if (onSelect) {
      onSelect(result);
      setOpen(false);
      return;
    }

    let nextQuery = "";

    if (result.type === "announces") {
      nextQuery = result.item.title || "";
    } else {
      nextQuery = `${result.item.firstname} ${result.item.lastname}`.trim();
    }

    setInput(nextQuery);

    if (nextQuery.length >= 2) {
      onSubmit(nextQuery, tab);
    }

    setOpen(false);
  };

  return (
    <div ref={containerRef} className="searchbar">
      <form className="searchbar-form" onSubmit={handleSubmit}>
        <div className="searchbar-control">
          <select
            className="searchbar-select"
            value={tab}
            onChange={(e) => setTab(e.target.value as Tab)}
            aria-label="Search category"
          >
            <option value="announces">Announcements</option>
            <option value="users">Members</option>
          </select>
          <input
            className="searchbar-input"
            type="search"
            placeholder={placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setOpen(true)}
            aria-label="Search"
          />
          <button
            type="button"
            className="searchbar-btn"
            onClick={performSubmit}
            aria-label="Search"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* biome asked for it */}
              <title>Search</title>
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </button>
        </div>
      </form>
      {open && (
        <ul className="searchbar-dropdown-slot" aria-label="Search results">
          {input.trim().length < 2 ? (
            <li className="searchbar-dropdown-empty">
              Type at least 2 characters...
            </li>
          ) : isLoading ? (
            <li className="searchbar-dropdown-empty">Loading...</li>
          ) : results.length === 0 ? (
            <li className="searchbar-dropdown-empty">No results.</li>
          ) : (
            results.map((result) => {
              // unique key for each result item
              const key =
                result.type === "announces"
                  ? `announce-${result.item.id}`
                  : `user-${result.item.id}`;

              return (
                <li key={key}>
                  <button
                    type="button"
                    className="searchbar-dropdown-btn"
                    onClick={() => handlePick(result)}
                  >
                    {result.type === "announces" ? (
                      <div>
                        <div className="searchbar-dropdown-title">
                          {result.item.title}
                        </div>
                        <div className="searchbar-dropdown-sub">
                          {result.item.location || ""}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="searchbar-dropdown-title">
                          {result.item.firstname} {result.item.lastname}
                        </div>
                        <div className="searchbar-dropdown-sub">
                          {result.item.city || ""}
                        </div>
                      </div>
                    )}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}

export default SearchBar;
