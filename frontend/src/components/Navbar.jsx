import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to={user ? "/" : "/login"} className="brand">
          <span className="brand-mark">CC</span>
          CampusConnect
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
              <span className="nav-user" title={user.email}>
                Hi, {user.name.split(" ")[0]}
              </span>
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
