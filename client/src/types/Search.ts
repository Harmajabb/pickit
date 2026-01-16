// used for search results
import type { Announce } from "./Announce";
import type { UserPublic } from "./User";
// it forces the possible tabs and avoids typos and it export for the navbar catalog.
export type Tab = "announces" | "users";

export type SearchResult =
  | { type: "announces"; item: Announce } // item is an announce
  | { type: "users"; item: UserPublic }; // item is a user
