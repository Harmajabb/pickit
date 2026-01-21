//used for search results and announces listing
export interface Announce {
  id: number;
  title: string;
  description: string;
  amount_deposit: number;
  creation_date: Date;
  update_date: Date;
  start_borrow_date: Date;
  end_borrow_date: Date;
  location: string;
  state: string;
  all_images?: string;
  total_likes: number;
}
//used for product sheet and announce details
export interface AnnounceDetail {
  id: number;
  title: string;
  description: string;
  location: string;
  state: string;
  owner_id: number;
  categorie_id: number;
  all_images: string[];
  favourites?: number;
  start_borrow_date: Date;
  end_borrow_date: Date;
  amount_deposit: number;
  state_of_product: string;
  name: string;
  total_likes: number;
}
