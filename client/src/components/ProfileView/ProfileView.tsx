import { Heart, Package } from "lucide-react";
import { Link } from "react-router";
import type {
  ProfileFavorite,
  ProfileItem,
  UserPrivate,
  UserPublic,
} from "../../types/User";
import ItemCard from "../ItemCard/ItemCard";
import "./ProfileView.css";

//discriminated union for profilView props.
//If mode is "me": user must be UserPrivate (with email, address)
//If mode is "member": user must be UserPublic + items + favorites
type ProfileViewProps =
  | { mode: "me"; user: UserPrivate }
  | {
      mode: "member";
      user: UserPublic;
      items: ProfileItem[];
      favorites: ProfileFavorite[];
    };

function ProfileView(props: ProfileViewProps) {
  const API_URL = import.meta.env.VITE_API_URL;

  // user avatar
  const avatarSrc = props.user.profil_picture
    ? `${API_URL}${props.user.profil_picture}`
    : `${API_URL}/assets/images/avatar-default.png`;

  // private profile (me mode)
  if (props.mode === "me") {
    const user = props.user;

    return (
      <section className="profile profile--me">
        {" "}
        <header className="profile-header">
          <h1>My account</h1>
          <p className="profile-subtitle">
            Everything you need to manage your account
          </p>

          <img
            src={avatarSrc}
            alt={`${user.firstname} ${user.lastname}`}
            className="profile-avatar"
          />

          <h2 className="profile-name">
            {user.firstname} {user.lastname}
          </h2>

          <button type="button" className="cta">
            Edit profile
          </button>
        </header>
        <section className="profile-info">
          <h3 className="sr-only">Personal Information</h3>

          <dl className="profile-info-grid">
            <div className="profile-info-item">
              <dt>Email:</dt>
              <dd>{user.email}</dd>
            </div>

            <div className="profile-info-item">
              <dt>Address:</dt>
              <dd>{user.address}</dd>
            </div>

            <div className="profile-info-item">
              <dt>City:</dt>
              <dd>{user.city}</dd>
            </div>

            <div className="profile-info-item">
              <dt>Zipcode:</dt>
              <dd>{user.zipcode}</dd>
            </div>
          </dl>
        </section>
        <section className="profile-actions">
          <h3 className="sr-only">Quick Actions</h3>

          <div className="profile-actions-grid">
            <Link to="/my-announces" className="profile-action-card">
              <div className="profile-action-icon">
                <Package size={40} strokeWidth={1.5} />
              </div>
              <h4>My Announcements</h4>
              <p>Manage your items</p>
            </Link>

            <Link to="/my-favorites" className="profile-action-card">
              <div className="profile-action-icon">
                <Heart size={40} strokeWidth={1.5} />
              </div>
              <h4>My Favorites</h4>
              <p>Find your favorites</p>
            </Link>
          </div>
        </section>
      </section>
    );
  }

  // public profile (member mode)
  const { user, items, favorites } = props;

  return (
    <section className="profile profile--member">
      {" "}
      <header className="profile-header">
        <img
          src={avatarSrc}
          alt={`${user.firstname} ${user.lastname}`}
          className="profile-avatar"
        />

        <h2 className="profile-name">
          {user.firstname} {user.lastname}
        </h2>

        <p className="profile-location">
          {user.city} ({user.zipcode})
        </p>
      </header>
      <section className="profile-section">
        <h2>His announcement ({items.length})</h2>

        {items.length === 0 ? (
          <p className="profile-empty">No announcement has been published</p>
        ) : (
          <ul className="profile-items-grid">
            {items.map((item) => (
              <li key={item.id}>
                {" "}
                <Link to={`/announce/${item.id}`}>
                  <ItemCard
                    id={item.id}
                    title={item.title}
                    location={item.location}
                    all_images={item.image_url ?? undefined}
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="profile-section">
        <h2>His favorites ({favorites.length})</h2>

        {favorites.length === 0 ? (
          <p className="profile-empty">No favorite for the moment</p>
        ) : (
          <ul className="profile-items-grid">
            {favorites.map((fav) => (
              <li key={fav.id}>
                {" "}
                <Link to={`/announce/${fav.id}`}>
                  <ItemCard
                    id={fav.id}
                    title={fav.title}
                    location={fav.location}
                    all_images={fav.image_url ?? undefined}
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}

export default ProfileView;
