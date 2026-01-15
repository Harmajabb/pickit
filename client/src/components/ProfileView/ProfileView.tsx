import ItemCard from "../ItemCard/ItemCard";
import type {
  ProfileFavorite,
  ProfileItem,
  UserPrivate,
  UserPublic,
} from "../../types/User";
import { Link } from "react-router";
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
      <section className="profile profile">
        <header className="profile-header">
          <h1>My account</h1>
          <p>Everything you need to manage your account</p>

          <img
            src={avatarSrc}
            alt={`${user.firstname} ${user.lastname}`}
            className="profile-avatar"
          />

          <h2 className="profile-name">
            {user.firstname} {user.lastname}
          </h2>
        </header>

        <section>
          <span>Email:</span>
          <span>{user.email}</span>

          <span>Address:</span>
          <span>{user.address}</span>

          <span>City:</span>
          <span>{user.city}</span>

          <span>ZipCode:</span>
          <span>{user.zipcode}</span>
        </section>

        <section>
          <Link to="/my-announces">
            <span>My Announcement</span>
            <p>Manage your items</p>
          </Link>

          <Link to="/my-favorites">
            <span>My favorites</span>
            <p>Find your favorites</p>
          </Link>
        </section>
      </section>
    );
  }

  // public profile (member mode)
  const { user, items, favorites } = props;

  return (
    <section className="profile">
      <header className="profile-header">
        <img
          src={avatarSrc}
          alt={`${user.firstname} ${user.lastname}`}
          className="profile-avatar"
        />

        <h1 className="profile-name">
          {user.firstname} {user.lastname}
        </h1>

        <p className="profile-location">
          {user.city} ({user.zipcode})
        </p>
      </header>

      <section>
        <h2>His announcement ({items.length})</h2>

        {items.length === 0 ? (
          <p>No announcement has been published</p>
        ) : (
          <ul className="profile-items-grid">
  {items.map((item) => (
    <Link key={item.id} to={`/announce/${item.id}`}>
      <ItemCard
        id={item.id}
        title={item.title}
        location={item.location}
        all_images={item.image_url ?? undefined}
      />
    </Link>
  ))}
</ul>
        )}
      </section>

      <section>
  <h2>His favorites ({favorites.length})</h2>

  {favorites.length === 0 ? (
    <p>No favorite for the moment</p>
  ) : (
    <ul className="profile-items-grid">
      {favorites.map((fav) => (
        <Link key={fav.id} to={`/announce/${fav.id}`}>
          <ItemCard
            id={fav.id}
            title={fav.title}
            location={fav.location}
            all_images={fav.image_url ?? undefined}
          />
        </Link>
      ))}
    </ul>
  )}
</section>
    </section>
  );
}

export default ProfileView;
