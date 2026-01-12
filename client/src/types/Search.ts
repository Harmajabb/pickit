// used for search results
import type { Announce } from "./Announce";
import type { User } from "./User";
// it forces the possible tabs and avoids typos and it export for the navbar catalog.
export type Tab = "announces" | "users";

export type SearchResult =
  | { type: "announces"; item: Announce } // item is an announce
  | { type: "users"; item: User }; // item is a user
