import type { Announce } from "../types/Announce";
import type { Tab } from "../types/Search";
import type { UserPublic } from "../types/User";
import type { Category } from "../types/Category";

// function to perform search based on query and tab (announces or users)
export async function searchApi(
  q: string,
  tab: Tab,
): Promise<Announce[] | UserPublic[]> {
  //create api endpoint url with query parameters
  const url = new URL(`${import.meta.env.VITE_API_URL}/api/search`);
  url.searchParams.set("q", q);
  url.searchParams.set("tab", tab);
  // API call to perform search
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  // return announces or users array in JSON format based on tab
  return (await res.json()) as Announce[] | UserPublic[];
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/categories`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as Category[];
}
