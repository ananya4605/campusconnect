import { Link } from "react-router-dom";
import { CATEGORY_ACCENT, CATEGORY_CLASS, formatDate, initials } from "../constants";

export default function PostCard({ post, actions }) {
  return (
    <article className={`card ${CATEGORY_ACCENT[post.category] || ""}`}>
      <div className="card-top">
        <span className={`badge ${CATEGORY_CLASS[post.category] || ""}`}>{post.category}</span>
        <span className="card-date">{formatDate(post.createdAt)}</span>
      </div>

      <h3 className="card-title">
        <Link to={`/posts/${post._id}`}>{post.title}</Link>
      </h3>

      <p className="card-desc">{post.description}</p>

      <div className="card-foot">
        <span className="card-author">
          <span className="avatar" aria-hidden="true">
            {initials(post.author?.name)}
          </span>
          <span className="card-author-name">{post.author?.name || "Unknown"}</span>
        </span>
        <div className="card-actions">{actions}</div>
      </div>
    </article>
  );
}
