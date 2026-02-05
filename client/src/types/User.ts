import type { Announce } from "./Announce";

// public user
export interface UserPublic {
  id: number;
  firstname: string;
  lastname: string;
  city: string;
  zipcode: string;
  profil_picture: string | null;
}

// private user
// note: extends mean to take from what it written from UserPublic
export interface UserPrivate extends UserPublic {
  email: string;
  address: string;
}

// Public user with item and favorites
export interface PublicProfileData {
  user: UserPublic;
  items: Announce[];
  favorites: Announce[];
}

// Private profile with only user
export interface MyProfileData {
  user: UserPrivate;
}

// Type union: it help to decide between Public or Private profile.
export type ProfileData = PublicProfileData | MyProfileData;

export interface ProfileItem extends Announce {
  is_borrowed: boolean;
}

export interface ProfileFavorite extends Announce {
  favorited_at: string;
}
