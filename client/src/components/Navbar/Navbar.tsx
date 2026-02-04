import { useContext } from "react";
import { Link, useNavigate } from "react-router";
import logo from "../../assets/icons/logo.svg";
import roundedLogo from "../../assets/icons/rounded-logo.svg";
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

  return (
    <>
      <nav className="desktop-nav">
        <Link to="/">
          <img src={logo} alt="logo PICKIT" />
        </Link>
        <Link to="/create-annonce" className="cta">
          List an item
        </Link>

        <SearchBar
          placeholder="Search for announcements or members..."
          onSubmit={handleSearchSubmit}
          onSelect={handleSearchSelect}
        />
        <svg viewBox="0 0 24 23" aria-hidden="true" className="nav-icons ">
          <path
            d="M19.0889 18.1082C19.0889 18.1082 19.183 18.0395 19.3333 17.9221C21.5859 16.1429 23 13.5645 23 10.694C23 5.34259 18.0744 1 12 1C5.92556 1 1 5.34259 1 10.694C1 16.048 5.92556 20.2407 12 20.2407C12.5182 20.2407 13.3689 20.2058 14.552 20.1359C16.0944 21.1597 18.3458 22 20.316 22C20.9259 22 21.2131 21.4881 20.822 20.9662C20.228 20.222 19.4091 19.0296 19.0913 18.1069L19.0889 18.1082Z"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6.49756 13.3733C9.55311 16.4948 14.442 16.4948 17.4976 13.3733"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <Link to="/my-favorites">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="nav-icons heart"
          >
            <g>
              <path
                d="M19.4998 12.5719L11.9998 19.9999L4.49981 12.5719C4.00512 12.0905 3.61546 11.5119 3.35536 10.8726C3.09527 10.2332 2.97037 9.54688 2.98855 8.85687C3.00673 8.16685 3.16758 7.48807 3.46097 6.86327C3.75436 6.23847 4.17395 5.68119 4.6933 5.22651C5.21265 4.77184 5.82052 4.42962 6.47862 4.22141C7.13673 4.01321 7.83082 3.94352 8.51718 4.01673C9.20354 4.08995 9.86731 4.30449 10.4667 4.64684C11.0661 4.98919 11.5881 5.45193 11.9998 6.00593C12.4133 5.45595 12.9359 4.99725 13.5349 4.65854C14.1339 4.31982 14.7963 4.10838 15.4807 4.03745C16.1652 3.96652 16.8569 4.03763 17.5126 4.24632C18.1683 4.45502 18.7738 4.79681 19.2914 5.2503C19.8089 5.70379 20.2272 6.25922 20.5202 6.88182C20.8132 7.50443 20.9746 8.18082 20.9941 8.86864C21.0137 9.55647 20.8911 10.2409 20.6339 10.8792C20.3768 11.5174 19.9907 12.0958 19.4998 12.5779"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          </svg>
        </Link>

        {/* CHANGE CONDITION : IF USER IS LOGGED IN -> SHOW PROFILE ICON AND DISCONNECT BTN (FIST DIV) IF HES NOT LOGGED IN -> SHOW LOG IN / SIGN IN BTN */}
        {isLogged ? (
          <>
            <div className="nav-user-info">
              <Link to={user?.role === 1 ? "/ad-dashboard" : "/profile/me"}>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 14 20"
                  className="nav-icons"
                >
                  <path
                    d="M3 5C3 6.06087 3.42143 7.07828 4.17157 7.82843C4.92172 8.57857 5.93913 9 7 9C8.06087 9 9.07828 8.57857 9.82843 7.82843C10.5786 7.07828 11 6.06087 11 5C11 3.93913 10.5786 2.92172 9.82843 2.17157C9.07828 1.42143 8.06087 1 7 1C5.93913 1 4.92172 1.42143 4.17157 2.17157C3.42143 2.92172 3 3.93913 3 5Z"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M1 19V17C1 15.9391 1.42143 14.9217 2.17157 14.1716C2.92172 13.4214 3.93913 13 5 13H9C10.0609 13 11.0783 13.4214 11.8284 14.1716C12.5786 14.9217 13 15.9391 13 17V19"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <span className="nav-firstname">Hello, {user?.firstname}</span>
            </div>

            <Link onClick={logout} to="/" className="secondary">
              Log out
            </Link>
          </>
        ) : (
          <Link to="/login" className="primary">
            Log In
          </Link>
        )}
        <ThemeToggle />
      </nav>

      <Link to="/">
        <img src={roundedLogo} alt="PICKIT logo" className="mobile-nav_logo" />
      </Link>
      <nav className="mobile-nav">
        <Link to="/">
          <svg viewBox="0 0 20 20" aria-hidden="true" className="nav-icons">
            <path
              d="M3 10H1L10 1L19 10H17"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M3 10V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19H15C15.5304 19 16.0391 18.7893 16.4142 18.4142C16.7893 18.0391 17 17.5304 17 17V10"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M7 19V13C7 12.4696 7.21071 11.9609 7.58579 11.5858C7.96086 11.2107 8.46957 11 9 11H11C11.5304 11 12.0391 11.2107 12.4142 11.5858C12.7893 11.9609 13 12.4696 13 13V19"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Home</span>
        </Link>
        {/* ... (Catalog, Add, Chat links omis pour la clarté, mais garde les tiens tels quels) */}
        <Link to={user?.role === 1 ? "/ad-dashboard" : "/profile/me"}>
          <svg viewBox="0 0 14 20" aria-hidden="true" className="nav-icons">
            <path
              d="M3 5C3 6.06087 3.42143 7.07828 4.17157 7.82843C4.92172 8.57857 5.93913 9 7 9C8.06087 9 9.07828 8.57857 9.82843 7.82843C10.5786 7.07828 11 6.06087 11 5C11 3.93913 10.5786 2.92172 9.82843 2.17157C9.07828 1.42143 8.06087 1 7 1C5.93913 1 4.92172 1.42143 4.17157 2.17157C3.42143 2.92172 3 3.93913 3 5Z"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M1 19V17C1 15.9391 1.42143 14.9217 2.17157 14.1716C2.92172 13.4214 3.93913 13 5 13H9C10.0609 13 11.0783 13.4214 11.8284 14.1716C12.5786 14.9217 13 15.9391 13 17V19"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {/* Mobile : Le texte reste dans le Link car c'est la navigation principale sur smartphone */}
          <span>{isLogged ? `Bonjour, ${user?.firstname}` : "Profile"}</span>
        </Link>
      </nav>
    </>
  );
}
export default Navbar;
