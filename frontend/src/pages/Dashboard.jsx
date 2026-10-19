import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, errorMessage } from "../api/client";
import CategoryFilter from "../components/CategoryFilter";
import PostCard from "../components/PostCard";

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  function load() {
    setStatus("loading");
    setError("");
    api
      .get("/posts", { params: { mine: "true", category: category === "All" ? "" : category } })
      .then((res) => {
        setPosts(res.data.posts);
        setStatus("done");
      })
      .catch((err) => {
        setError(errorMessage(err));
        setStatus("error");
      });
  }

  useEffect(load, [category]);

  async function handleDelete(post) {
    if (!window.confirm(`Delete "${post.title}"?`)) return;
    try {
      await api.delete(`/posts/${post._id}`);
      setPosts((current) => current.filter((p) => p._id !== post._id));
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <>
      <section className="dash-head">
        <div>
          <h1>My posts</h1>
          <p className="muted">Manage everything you have shared on the board.</p>
        </div>
        <Link to="/posts/new" className="btn btn-primary">
          + New post
        </Link>
      </section>

      <div className="stats">
        <div className="stat">
          <span className="stat-value">{posts.length}</span>
          <span className="stat-label">Published</span>
        </div>
        <div className="stat">
          <span className="stat-value">{new Set(posts.map((p) => p.category)).size}</span>
          <span className="stat-label">Categories used</span>
        </div>
      </div>

      <CategoryFilter value={category} onChange={setCategory} />

      {error && <div className="alert">{error}</div>}
      {status === "loading" && <p className="muted">Loading your posts…</p>}

      {status === "done" && posts.length === 0 && (
        <div className="empty">
          <p>You have not posted in this category yet.</p>
          <Link to="/posts/new" className="btn btn-primary">
            Create your first post
          </Link>
        </div>
      )}

      {status === "done" && posts.length > 0 && (
        <div className="grid">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              actions={
                <>
                  <Link to={`/posts/${post._id}/edit`} className="btn btn-soft btn-sm">
                    Edit
                  </Link>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(post)}>
                    Delete
                  </button>
                </>
              }
            />
          ))}
        </div>
      )}
    </>
  );
}
