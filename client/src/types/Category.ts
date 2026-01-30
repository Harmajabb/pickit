export interface Category {
  id: number;
  category: string;
  parent_id: number | null;
  children?: Category[];
}
