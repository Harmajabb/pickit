export interface Announces {
  id: number;
  title: string;
  description: string;
  amount_caution: number;
  creation_date: Date;
  update_date: Date;
  start_location_date: Date;
  end_location_date: Date;
  location: string;
  state: string;
  all_images?: string;
}
