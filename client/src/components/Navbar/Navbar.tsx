import { useContext } from "react";
import { useNavigate } from "react-router";
// import roundedLogo from "../../assets/icons/rounded-logo.svg";
import pickitDark from "../../assets/icons/pickit-dark.png";
import pickitLight from "../../assets/icons/pickit-light.png";
import addDark from "../../assets/images/Navbar/add-dark.png";
import addLight from "../../assets/images/Navbar/add-light.png";
import chatDark from "../../assets/images/Navbar/chat-dark.png";
import chatLight from "../../assets/images/Navbar/chat-light.png";
import heartDark from "../../assets/images/Navbar/heart-dark.png";
import heartLight from "../../assets/images/Navbar/heart-light.png";
import homeDark from "../../assets/images/Navbar/home-dark.png";
import homeLight from "../../assets/images/Navbar/home-light.png";
import searchDark from "../../assets/images/Navbar/search-dark.png";
import searchLight from "../../assets/images/Navbar/search-light.png";
import userDark from "../../assets/images/Navbar/user-dark.png";
import userLight from "../../assets/images/Navbar/user-light.png";
import type { SearchResult, Tab } from "../../types/Search";
import ThemeToggle from "../ThemeToggle/ThemeToggle";

import "./Navbar.css";
import { AuthContext } from "../../context/AuthContext";
import SearchBar from "../SearchBar/SearchBar.tsx";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const isLogged = !!user;

  const navigate = useNavigate();

  const handleSearchSubmit = (q: string, tab: Tab) => {
    if (tab === "announces") {
      navigate(`/catalog?q=${encodeURIComponent(q)}`);
    }
    if (tab === "users") {
      navigate(`/members?q=${encodeURIComponent(q)}`);
      return;
    }
  };

  // Handle selection from search results
  const handleSearchSelect = (result: SearchResult) => {
    if (result.type === "users") {
      // redirection to user profile
      navigate(`/profile/${result.item.id}`);
    } else {
      // redirection to announce details
      navigate(`/catalog?q=${encodeURIComponent(result.item.title)}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <nav className="desktop-nav" aria-label="Main navigation">
        {/* logo */}
        <button
          type="button"
          onClick={() => navigate("/")}
          aria-label="Go to homepage"
          className="navbar-logo"
        >
          <img src={pickitDark} alt="" className="logo-dark" />
          <img src={pickitLight} alt="" className="logo-light" />
          <span className="sr-only">Pickit Home</span>
        </button>
        {/* creer une annonce */}
        <button
          type="button"
          onClick={() => navigate("/create-annonce")}
          className="cta"
        >
          List an item
        </button>
        {/* Searchbar */}
        <SearchBar
          placeholder="Search for announcements or members..."
          onSubmit={handleSearchSubmit}
          onSelect={handleSearchSelect}
        />
        <div className="nav-actions">
          {/* favorites */}
          <button
            type="button"
            onClick={() => navigate("/my-favorites")}
            aria-label="View my favorites"
            className="icon-btn"
          >
            <img src={heartDark} alt="" className="icon-light" />
            <img src={heartLight} alt="" className="icon-dark" />
          </button>
          {/* CHANGE CONDITION : IF USER IS LOGGED IN -> SHOW PROFILE ICON AND DISCONNECT BTN (FIST DIV) IF HES NOT LOGGED IN -> SHOW LOG IN / SIGN IN BTN */}
          {isLogged ? (
            <>
              {/* Conteneur pour grouper l'icône et le nom sans que tout soit un lien */}
              <div className="user-profile-section">
                {/* profile */}
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() =>
                    navigate(user?.role === 1 ? "/ad-dashboard" : "/profile/me")
                  }
                  aria-label={`View profile of ${user?.firstname}`}
                >
                  <img src={userDark} alt="" className="icon-light" />
                  <img src={userLight} alt="" className="icon-dark" />
                </button>

                {/* Le texte est ici, en dehors du composant Link */}
                <span className="user-greeting">Hello, {user?.firstname}</span>
              </div>
              {/* logout */}
              <button
                type="button"
                onClick={handleLogout}
                className="secondary"
                aria-label="Log out of your account"
              >
                Log out
              </button>
            </>
          ) : (
            // login
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="primary navbar-login-btn"
              aria-label="Log in of your account"
            >
              Log In
            </button>
          )}
          {/* theme toggle */}
          <ThemeToggle />
        </div>
      </nav>
      {/* mobile nav */}
      <button
        type="button"
        onClick={() => navigate("/")}
        aria-label="Go to homepage"
        className="mobile-nav_logo"
      >
        <img src={pickitDark} alt="" className="logo-dark" />
        <img src={pickitLight} alt="" className="logo-light" />
        <span className="sr-only">Pickit Home</span>
      </button>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {/* home */}
        <button
          type="button"
          onClick={() => navigate("/")}
          aria-label="Home"
          className="mobile-nav-btn"
        >
          <img src={homeDark} alt="" className="icon-light" />
          <img src={homeLight} alt="" className="icon-dark" />
          <span>Home</span>
        </button>
        {/* search */}
        <button
          type="button"
          onClick={() => navigate("/catalog")}
          aria-label="Search catalog"
          className="mobile-nav-btn"
        >
          <img src={searchDark} alt="" className="icon-light" />
          <img src={searchLight} alt="" className="icon-dark" />
          <span>Search</span>
        </button>
        {/* add */}
        <button
          type="button"
          onClick={() => navigate("/create-annonce")}
          aria-label="Create new announcement"
          className="mobile-nav-btn"
        >
          <img src={addDark} alt="" className="icon-light" />
          <img src={addLight} alt="" className="icon-dark" />
          <span>Add</span>
        </button>
        {/* chat */}
        <button
          type="button"
          onClick={() => navigate("/chat")}
          aria-label="Open chat"
          className="mobile-nav-btn"
        >
          <img src={chatDark} alt="" className="icon-light" />
          <img src={chatLight} alt="" className="icon-dark" />
          <span>Chat</span>
        </button>
        {/* profile */}
        <button
          type="button"
          onClick={() =>
            navigate(user?.role === 1 ? "/ad-dashboard" : "/profile/me")
          }
          aria-label={
            isLogged ? `View profile of ${user?.firstname}` : "View profile"
          }
          className="mobile-nav-btn"
        >
          <img src={userDark} alt="" className="icon-light" />
          <img src={userLight} alt="" className="icon-dark" />
          {/* Mobile : Le texte reste dans le Link car c'est la navigation principale sur smartphone */}
          <span>{isLogged ? `Hello, ${user?.firstname}` : "Profile"}</span>
        </button>
      </nav>
    </>
  );
}
export default Navbar;
