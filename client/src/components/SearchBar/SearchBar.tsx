//import
import { useEffect, useMemo, useRef, useState } from "react";
import type { Tab } from "../../types/Search.ts";
import "./SearchBar.css";

// props interface because this is a reusable component
interface Props {
  defaultTab?: Tab; // default selected tab aka announces or users optionnal
  minLength?: number; // minimum length of the query to trigger search
  placeholder?: string; // input placeholder text which will be different in some pages
  onSubmit: (q: string, tab: Tab) => void; // indispensable for navigation and filtering
  onQueryChange?: (q: string, tab: Tab) => void; // for dropdown suggestions
}

// hook to debounce a value
function useDebounce<T>(value: T, delayMs = 300) {
  const [debounced, setDebounced] = useState(value);
  // update debounced value after delay
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}

function SearchBar({
  defaultTab = "announces", // default to articles tab
  minLength = 2, // default minimum length
  placeholder = "Searching...", // default placeholder
  onSubmit, // mandatory submit handler
  onQueryChange, // optional live query change handler
}: Props) {
  // ui states
  const [tab, setTab] = useState<Tab>(defaultTab); // selected tab state
  const [input, setInput] = useState(""); // input value state
  const [open, setOpen] = useState(false); // dropdown open state
  //debounced input value
  const debounced = useDebounce(input, 300); // debounce input value
  const q = useMemo(() => debounced.trim(), [debounced]); // trimmed debounced query (usememo for optimization)

  const containerRef = useRef<HTMLDivElement | null>(null); // ref to the main container for the click outside handler

  // click outside it will close the dropdown
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // use escape touch to close the dropdown
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // effect to call onQueryChange when q changes and dropdown is open
  useEffect(() => {
    if (!onQueryChange) return;
    if (!open) return;

    if (q.length >= minLength) onQueryChange(q, tab);
    else onQueryChange("", tab);
  }, [q, tab, open, minLength, onQueryChange]);

  // form submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = input.trim();
    if (query.length < minLength) return;
    onSubmit(query, tab);
    setOpen(false);
  };

  return (
    // if the user clicks outside the container, the dropdown will close
    <div ref={containerRef} className="searchbar">
      {/* enter in the input will open the submit automatically */}
      <form className="searchbar-form" onSubmit={handleSubmit}>
        <div className="searchbar-control">
          <label
            className="searchbar-selectWrap"
            aria-label="search category" // accessibility label
          >
            <select
              className="searchbar-select"
              value={tab}
              onChange={(e) => setTab(e.target.value as Tab)}
            >
              <option value="announces">Announcement</option>
              <option value="users">Members</option>
            </select>
          </label>

          <input
            className="searchbar-input"
            type="search"
            placeholder={placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setOpen(true)}
            aria-label="Search" // accessibility label
          />
        </div>
      </form>
    </div>
  );
}

export default SearchBar;
