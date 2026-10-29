import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, errorMessage } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { CATEGORY_CLASS, formatDate, initials } from "../constants";

/* A Mongo ObjectId stores its creation time in the first four bytes, so the join
   date comes from the id the session already carries — the user document has no
   timestamp field in the API response. */
function memberSince(id) {
  if (!/^[0-9a-f]{24}$/.test(id || "")) return null;
  return new Date(Number.parseInt(id.slice(0, 8), 16) * 1000);
}

export default function Profile() {
  const { user } = useAuth();
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    api
      .get("/posts", { params: { mine: "true" } })
      .then((res) => {
        if (alive) setPosts(res.data.posts);
      })
      .catch((err) => {
        if (alive) setError(errorMessage(err));
      });
    return () => {
      alive = false;
    };
  }, []);

  const joined = memberSince(user._id);
  const categories = posts ? [...new Set(posts.map((post) => post.category))] : null;

  return (
    <>
      <Link to="/" className="back">
        ← Back to feed
      </Link>

      <section className="detail profile">
        <div className="profile-head">
          <span className="avatar avatar-xl" aria-hidden="true">
            {initials(user.name)}
          </span>
          <div>
            <h1>{user.name}</h1>
            <p className="detail-meta">{user.email}</p>
          </div>
          <span className="badge">Student</span>
        </div>

        {error && <div className="alert">{error}</div>}

        <dl className="rows">
          <div>
            <dt>Full name</dt>
            <dd>{user.name}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
          {joined && (
            <div>
              <dt>Member since</dt>
              <dd>{formatDate(joined)}</dd>
            </div>
          )}
        </dl>

        <h2 className="section-title">Activity</h2>
        <div className="stats">
          <div className="stat">
            <span className="stat-value">{posts ? posts.length : "—"}</span>
            <span className="stat-label">Posts published</span>
          </div>
          <div className="stat">
            <span className="stat-value">{categories ? categories.length : "—"}</span>
            <span className="stat-label">Categories used</span>
          </div>
          <div className="stat">
            <span className="stat-value stat-date">{posts?.[0] ? formatDate(posts[0].createdAt) : "—"}</span>
            <span className="stat-label">Latest post</span>
          </div>
        </div>

        {categories?.length > 0 && (
          <div className="chips">
            {categories.map((name) => (
              <span key={name} className={`badge ${CATEGORY_CLASS[name] || ""}`}>
                {name}
              </span>
            ))}
          </div>
        )}

        <div className="detail-links">
          <Link to="/dashboard" className="btn btn-primary">
            View my posts
          </Link>
          <Link to="/posts/new" className="btn btn-soft">
            Create a post
          </Link>
        </div>
      </section>
    </>
  );
}
