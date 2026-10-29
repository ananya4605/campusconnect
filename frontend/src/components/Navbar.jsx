import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { initials } from "../constants";

export default function Navbar({ showMenuButton, menuOpen, onMenuToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {showMenuButton && (
          <button
            type="button"
            className="menu-button"
            onClick={onMenuToggle}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d={menuOpen ? "M6 6l12 12M18 6 6 18" : "M4 7h16M4 12h16M4 17h16"} />
            </svg>
          </button>
        )}

        <Link to={user ? "/" : "/login"} className="brand" aria-label="CampusConnect">
          <img className="brand-logo" src="/logo.svg" alt="" />
          <img className="brand-mark" src="/logo-mark.svg" alt="" />
        </Link>

        {user && (
          <nav className="nav-links">
            <NavLink to="/" end className="nav-link">
              Feed
            </NavLink>
            <NavLink to="/dashboard" className="nav-link">
              My Posts
            </NavLink>
          </nav>
        )}

        <div className="nav-right">
          {user ? (
            <>
              <Link to="/profile" className="nav-profile" title={user.email} aria-label="Your student profile">
                <span className="avatar avatar-nav" aria-hidden="true">
                  {initials(user.name)}
                </span>
                <span className="nav-user">Hi, {user.name.split(" ")[0]}</span>
              </Link>
              <Link to="/posts/new" className="btn btn-primary btn-sm">
                + New post
              </Link>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm">
                Log out
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">
              Log in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
