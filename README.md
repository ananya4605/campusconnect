# CampusConnect

A beginner-friendly full-stack MERN app where students share internships, events,
study materials, announcements and lost & found items.

**Stack:** React + Vite · Express · MongoDB Atlas · JWT + bcrypt password hashing

```
campusconnect/
├── backend/          Express API + Mongoose models
│   ├── config/db.js          MongoDB connection
│   ├── models/               User, Post
│   ├── middleware/           JWT auth guard, async error wrapper
│   ├── routes/               /api/auth, /api/posts
│   ├── server.js             app entry
│   └── .env                  local secrets (gitignored)
└── frontend/         React app
    ├── src/api/              axios instance, adds the JWT to every call
    ├── src/context/          logged-in user state
    ├── src/components/       Navbar, PostCard, CategoryFilter…
    └── src/pages/            Login, Register, Home, PostDetail, PostForm, Dashboard
```

---

## 1. Get a free MongoDB Atlas connection string (you do this once, by hand)

1. Sign up at <https://www.mongodb.com/cloud/atlas> and create a **M0 free cluster**.
2. **Security → Database Access → Add New Database User**: create a username and
   password (Atlas does not let you use your login email/password here).
3. **Security → Network Access → Add IP Address**: click **Add Current Local Network**,
   or add `0.0.0.0/0` to allow any IP (easier while learning, less secure).
4. **Clusters → your cluster → Connect → Drivers → Copy**, and replace
   `<username>` / `<password>` with the user you created in step 2.
5. Open `backend/.env` and paste it as the value of `MONGO_URI`.

The URI looks like this:

```
MONGO_URI=mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/campusconnect?retryWrites=true&w=majority
```

Keep `campusconnect` as the database name in the URI — the app writes into it.

## 2. Run the backend

```bash
cd backend
npm install     # already done if you ran it
npm run dev
```

Expected output: `MongoDB connected` then `API running on http://localhost:5000`.
Test it in a browser: <http://localhost:5000/api/health> → `{"status":"ok"}`.

## 3. Run the frontend (new terminal)

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173>, create an account, and start posting.
Vite forwards every `/api` request to the backend (see `frontend/vite.config.js`),
so there is no CORS or URL configuration to manage while developing.

## 4. Two terminals at once

Keep the backend running in one terminal and the frontend in another. Stop a server
with `Ctrl + C`.

---

## Features

| Feature | Where |
| --- | --- |
| Register / login, hashed passwords | `backend/routes/auth.js`, `backend/models/User.js` |
| Home feed with post cards | `frontend/src/pages/Home.jsx` |
| Search by title **and** description | `GET /api/posts?search=` (`backend/routes/posts.js`) |
| Filter by category | category chips on Home and Dashboard |
| Create / edit / delete posts | `frontend/src/pages/PostForm.jsx` |
| Author-only edit & delete | `protect` middleware + owner check in `routes/posts.js` |
| Post details, contact email, apply link | `frontend/src/pages/PostDetail.jsx` |
| Dashboard of your own posts | `GET /api/posts?mine=true` → `frontend/src/pages/Dashboard.jsx` |

## Notes for later

- `bcryptjs` is used instead of native `bcrypt`: same API, but it does not need a C++
  compiler on Windows.
- The JWT is stored in `localStorage` under `cc_token` and attached automatically by
  the axios interceptor in `frontend/src/api/client.js`.
- Categories live in two places that must match: the `CATEGORIES` array in
  `backend/models/Post.js` and `frontend/src/constants.js`.
- For a real deployment, set `CLIENT_URL` to your frontend address and store secrets in
  your host's environment variables — never commit `.env`.

## Troubleshooting

| Error | Fix |
| --- | --- |
| `Missing MONGO_URI in backend/.env` | You did not create/fill `backend/.env` (step 1). |
| `Could not connect to MongoDB: … IP is not allowed` | Add your IP under Atlas → Network Access. |
| `getaddrinfo ENOTFOUND cluster0…` | Typo in the URI, or Atlas not reachable (VPN/firewall). |
| Login works but posts are empty | Backend not running, or you filtered by a category with no posts. |
| `ECONNREFUSED /api` in the browser | Start the backend first; Vite proxies to port 5000. |
| Port already in use | Change `PORT` in `backend/.env` and the proxy target in `vite.config.js`. |
