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

  // for keyboard navigation
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement | null>(null); // ref for detecting outside clicks
  const listboxId = "search-results";

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

  // handle search submission (button click or enter key)
  const performSubmit = () => {
    const query = input.trim();
    // console.log("SUBMIT", { query, tab });
    if (query.length < 2) return;

    //For Members mode with results: select first result (goes to /profile/:id)
    if (tab === "users" && results.length > 0) {
      handlePick(results[0]);
      return;
    }
    // For Members mode without results: do nothing
    if (tab === "users" && results.length === 0) {
      return;
    }

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // console.log("keydown", e.key, {
    //   open,
    //   results: results.length,
    //   activeIndex,
    // });

    // open the dropdown when user starts navigating
    if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      setOpen(true);
      return;
    }

    // if closed dropdown no reason to deal with arrowDown and ArrowUp
    if (!open) return;

    // direction: 1 for down (ArrowDown), -1 for up (ArrowUp)
    const navigateResults = (direction: 1 | -1) => {
      e.preventDefault();
      if (results.length === 0) return;

      setActiveIndex((prev) => {
        if (direction === 1) {
          // Navigation down: if not at end, +1, else loop to start
          return prev < results.length - 1 ? prev + 1 : 0;
        }
        // Navigation up: if not at start, -1, else loop to end
        return prev > 0 ? prev - 1 : results.length - 1;
      });
    };

    if (e.key === "ArrowDown") {
      navigateResults(1);
      return;
    }

    if (e.key === "ArrowUp") {
      navigateResults(-1);
      return;
    }

    if (e.key === "Enter") {
      // If an item is active, pick it instead of submitting the form
      if (activeIndex >= 0 && activeIndex < results.length) {
        e.preventDefault();
        handlePick(results[activeIndex]);
      }
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setActiveIndex(-1);
      return;
    }
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
          <label className="sr-only" htmlFor="search-input">
            Search
          </label>
          <input
            id="search-input"
            className="searchbar-input"
            type="search"
            placeholder={placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            role="combobox" //biome asked me to add it so...
            aria-label="Search"
            aria-expanded={open} // state of dropdown
            aria-controls={listboxId} // id of the element list
            aria-autocomplete="list" // autocompletion
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
        <ul
          className="searchbar-dropdown-slot"
          aria-label="Search results"
          id={listboxId}
        >
          {input.trim().length < 2 ? (
            <li className="searchbar-dropdown-empty">
              Type at least 2 characters...
            </li>
          ) : isLoading ? (
            <li className="searchbar-dropdown-empty">Loading...</li>
          ) : results.length === 0 ? (
            <li className="searchbar-dropdown-empty">No results.</li>
          ) : (
            results.map((result, index) => {
              // unique key for each result item
              const key =
                result.type === "announces"
                  ? `announce-${result.item.id}`
                  : `user-${result.item.id}`;

              const isActive = index === activeIndex;

              return (
                <li key={key}>
                  <button
                    type="button"
                    aria-label="result"
                    className={`searchbar-dropdown-btn ${isActive ? "is-active" : ""}`}
                    onMouseEnter={() => setActiveIndex(index)}
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
