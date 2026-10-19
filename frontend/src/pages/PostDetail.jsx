import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, errorMessage } from "../api/client";
import { CATEGORY_CLASS, formatDate } from "../constants";
import { useAuth } from "../context/AuthContext";

export default function PostDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setPost(null);
    api
      .get(`/posts/${id}`)
      .then((res) => setPost(res.data.post))
      .catch((err) => setError(errorMessage(err)));
  }, [id]);

  async function handleDelete() {
    if (!window.confirm("Delete this post? This cannot be undone.")) return;
    setBusy(true);
    try {
      await api.delete(`/posts/${id}`);
      navigate("/", { replace: true });
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  if (error && !post) return <div className="alert">{error}</div>;
  if (!post) return <p className="muted">Loading post…</p>;

  const isAuthor = post.author?._id === user?._id;

  return (
    <article className="detail">
      <Link to="/" className="back">
        ← Back to feed
      </Link>

      <span className={`badge ${CATEGORY_CLASS[post.category] || ""}`}>{post.category}</span>
      <h1>{post.title}</h1>
      <p className="detail-meta">
        Posted by <strong>{post.author?.name}</strong> on {formatDate(post.createdAt)}
      </p>

      <div className="detail-body">{post.description}</div>

      <div className="detail-links">
        {post.contactEmail && (
          <a className="btn btn-primary" href={`mailto:${post.contactEmail}`}>
            Email {post.contactEmail}
          </a>
        )}
        {post.applyLink && (
          <a className="btn btn-ghost" href={post.applyLink} target="_blank" rel="noreferrer">
            Open application link
          </a>
        )}
        {!post.contactEmail && !post.applyLink && (
          <p className="muted">This post has no contact details.</p>
        )}
      </div>

      {isAuthor && (
        <div className="detail-owner">
          <p className="muted">This is your post.</p>
          <Link to={`/posts/${post._id}/edit`} className="btn btn-soft">
            Edit post
          </Link>
          <button className="btn btn-danger" onClick={handleDelete} disabled={busy}>
            {busy ? "Deleting…" : "Delete post"}
          </button>
        </div>
      )}

      {error && <div className="alert">{error}</div>}
    </article>
  );
}
