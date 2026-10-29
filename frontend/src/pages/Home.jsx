import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api, errorMessage } from "../api/client";
import CategoryFilter from "../components/CategoryFilter";
import PostCard from "../components/PostCard";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [params, setParams] = useSearchParams();
  const category = params.get("category") || "All";

  function changeCategory(next) {
    const updated = new URLSearchParams(params);
    updated.set("category", next);
    setParams(updated, { replace: true });
  }

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setError("");

    const timer = setTimeout(() => {
      api
        .get("/posts", { params: { search, category: category === "All" ? "" : category } })
        .then((res) => {
          if (cancelled) return;
          setPosts(res.data.posts);
          setStatus("done");
        })
        .catch((err) => {
          if (cancelled) return;
          setError(errorMessage(err));
          setStatus("error");
        });
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search, category]);

  const heading = useMemo(
    () => (category === "All" ? "Latest on campus" : `${category} posts`),
    [category]
  );

  return (
    <>
      <section className="hero">
        <h1>Everything happening on your campus</h1>
        <p>Internships, events, study material, announcements and lost &amp; found — in one board.</p>
      </section>

      <section className="toolbar">
        <div className="search">
          <svg
            className="search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4.5 4.5" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search titles and descriptions…"
            aria-label="Search posts"
          />
          {search && (
            <button className="clear" onClick={() => setSearch("")} aria-label="Clear search">
              ✕
            </button>
          )}
        </div>
        <CategoryFilter value={category} onChange={changeCategory} />
      </section>

      {status === "error" && <div className="alert">{error}</div>}
      {status === "loading" && <p className="muted">Loading posts…</p>}

      {status === "done" && posts.length === 0 && (
        <div className="empty">
          <p>No posts match your search yet.</p>
          <p className="muted">Try another keyword or category, or be the first to post.</p>
        </div>
      )}

      {status === "done" && posts.length > 0 && (
        <>
          <h2 className="section-title">
            {heading} <span className="count">{posts.length}</span>
          </h2>
          <div className="grid">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
