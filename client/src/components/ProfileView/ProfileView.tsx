import { Handshake, Heart, Package } from "lucide-react";
import { Link } from "react-router";
import type { Announce } from "../../types/Announce";
import type { UserPrivate, UserPublic } from "../../types/User";
import "./ProfileView.css";
import CatalogCard from "../CatalogCard/CatalogCard";

//discriminated union for profileView props.
//If mode is "me": user must be UserPrivate (with email, address)
//If mode is "member": user must be UserPublic + items + favorites
type ProfileViewProps =
  | {
      mode: "me";
      user: UserPrivate;
      onEditClick?: () => void;
      onStatusUpdate?: (borrowId: number, newStatus: string) => Promise<void>;
    }
  | {
      mode: "member";
      user: UserPublic;
      items: Announce[];
      favorites: Announce[];
    };

function ProfileView(props: ProfileViewProps) {
  const API_URL = import.meta.env.VITE_API_URL;

  // user avatar
  const avatarSrc = props.user.profile_picture
    ? `${API_URL}${props.user.profile_picture}`
    : `${API_URL}/assets/images/avatar-default.png`;

  // private profile (me mode)
  if (props.mode === "me") {
    const user = props.user;
    const { onEditClick } = props;

    return (
      <section
        className="profile profile--me"
        aria-labelledby="profile-header-title"
      >
        {" "}
        <header className="profile-header">
          <h1 id="profile-header-title">My account</h1>
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

          <button type="button" className="cta" onClick={onEditClick}>
            Edit profile
          </button>
        </header>
        <section className="profile-info" aria-labelledby="personal-info-title">
          <h3 id="personal-info-title" className="sr-only">
            Personal Information
          </h3>

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
        <section
          className="profile-actions"
          aria-labelledby="account-actions-title"
        >
          <h3 id="account-actions-title" className="sr-only">
            Quick Actions
          </h3>

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

            <Link to="/profile/requests" className="profile-action-card">
              <div className="profile-action-icon">
                <Handshake size={40} strokeWidth={1.5} />
              </div>
              <h4>My Requests</h4>
              <p>Manage borrow requests</p>
            </Link>
          </div>
        </section>
      </section>
    );
  }

  // public profile (member mode)
  const { user, items, favorites } = props;

  return (
    <section
      className="profile profile--member"
      aria-labelledby="profile-header-title"
    >
      {" "}
      <header className="profile-header">
        <h1 id="profile-header-title">Profile information</h1>
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
      <section
        className="profile-section"
        aria-labelledby="announcements-title"
      >
        <h2 id="announcements-title">
          Announcement ({items.length}){" "}
          <Link to="/" className="profile-see-all">
            See all announcements
          </Link>
        </h2>

        {items.length === 0 ? (
          <p className="profile-empty">No announcement has been published</p>
        ) : (
          <ul className="profile-items-grid">
            {items.slice(0, 6).map((item) => (
              <li key={item.id}>
                {" "}
                <CatalogCard data={item} />
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="profile-section" aria-labelledby="favorites-title">
        <h2 id="favorites-title">
          His favorites ({favorites.length})
          <Link to={`/favorites/${user.id}`} className="profile-see-all">
            See all favorites
          </Link>
        </h2>

        {favorites.length === 0 ? (
          <p className="profile-empty">No favorite for the moment</p>
        ) : (
          <ul className="profile-items-grid">
            {favorites.slice(0, 6).map((fav) => (
              <li key={fav.id}>
                {" "}
                <Link to={`/announce/${fav.id}`}>
                  <CatalogCard data={fav} />
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
