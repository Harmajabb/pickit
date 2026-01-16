// public user
export interface UserPublic {
  id: number;
  firstname: string;
  lastname: string;
  city: string;
  zipcode: number;
  profil_picture: string | null;
}

// private user
// note: extends mean to take from what it written from UserPublic
export interface UserPrivate extends UserPublic {
  email: string;
  address: string;
}

// announcement Item
export interface ProfileItem {
  id: number;
  title: string;
  location: string;
  image_url: string | null;
}

// Favorite
export interface ProfileFavorite {
  id: number;
  title: string;
  location: string;
  image_url: string | null;
}

// Public user with item and favorites
export interface PublicProfileData {
  user: UserPublic;
  items: ProfileItem[];
  favorites: ProfileFavorite[];
}

// Private profile with only user
export interface MyProfileData {
  user: UserPrivate;
}

// Type union: it help to decide between Public or Private profile.
export type ProfileData = PublicProfileData | MyProfileData;
