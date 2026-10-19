import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, errorMessage } from "../api/client";
import { CATEGORIES } from "../constants";

const EMPTY = { title: "", description: "", category: "Internships", contactEmail: "", applyLink: "" };

export default function PostForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/posts/${id}`)
      .then((res) => {
        const { title, description, category, contactEmail, applyLink } = res.data.post;
        setForm({ title, description, category, contactEmail: contactEmail || "", applyLink: applyLink || "" });
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setBusy(false));
  }, [id, isEdit]);

  function update(key) {
    return (e) => setForm({ ...form, [key]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = isEdit
        ? await api.put(`/posts/${id}`, form)
        : await api.post("/posts", form);
      navigate(`/posts/${res.data.post._id}`, { replace: true });
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <section className="form-card">
      <h1>{isEdit ? "Edit post" : "Create a post"}</h1>
      <p className="muted">Only you can edit or delete this post later.</p>

      {error && <div className="alert">{error}</div>}
      {busy && isEdit ? (
        <p className="muted">Loading…</p>
      ) : (
        <form onSubmit={handleSubmit} className="form">
          <label className="field">
            <span>Title</span>
            <input
              required
              maxLength={120}
              value={form.title}
              onChange={update("title")}
              placeholder="e.g. Summer frontend internship at Zenith Labs"
            />
          </label>

          <label className="field">
            <span>Category</span>
            <select required value={form.category} onChange={update("category")}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Description</span>
            <textarea
              required
              rows={7}
              maxLength={4000}
              value={form.description}
              onChange={update("description")}
              placeholder="Share the details other students need: what it is, who can apply, deadlines…"
            />
          </label>

          <div className="field-row">
            <label className="field">
              <span>Contact email (optional)</span>
              <input
                type="email"
                value={form.contactEmail}
                onChange={update("contactEmail")}
                placeholder="you@college.edu"
              />
            </label>

            <label className="field">
              <span>Application link (optional)</span>
              <input
                type="url"
                value={form.applyLink}
                onChange={update("applyLink")}
                placeholder="https://…"
              />
            </label>
          </div>

          <div className="form-actions">
            <button className="btn btn-primary" disabled={busy}>
              {busy ? "Saving…" : isEdit ? "Save changes" : "Publish post"}
            </button>
            <Link to={isEdit ? `/posts/${id}` : "/"} className="btn btn-ghost">
              Cancel
            </Link>
          </div>
        </form>
      )}
    </section>
  );
}
