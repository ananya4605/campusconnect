# CampusConnect

**A MERN platform where college students share and discover internships, events, study materials, announcements, and lost & found items — on one campus-wide board.**

🔗 **Live demo:** https://campusconnect-mu-one.vercel.app
🔗 **API:** https://campusconnect-api-rhvm.onrender.com/api/health
💻 **Repo:** https://github.com/ananya4605/campusconnect · **Stack:** React · Vite · Express · MongoDB Atlas · JWT

---

## The problem

Important campus information is scattered across WhatsApp groups, notice boards and Instagram stories, so it is invisible outside whichever group posted it: an internship shared in one class group never reaches the rest of the batch, study material is buried in a chat scroll within a day, and lost & found items have no searchable record.

CampusConnect replaces that with a single board that is **searchable**, **category-organised**, and where every post carries its own contact route — an email, an application link, or both.

## What it does

| | |
| --- | --- |
| **Register & log in** | Email and password; passwords stored only as bcrypt hashes |
| **Campus feed** | Every post, newest first, in a responsive card grid |
| **Create a post** | Title, description, category, plus optional contact email and application link |
| **Edit & delete** | Only ever the author's own posts — enforced on the server, not just hidden in the UI |
| **Search** | Case-insensitive, across both title **and** description |
| **Filter** | Internships · Events · Study Materials · Announcements · Lost & Found |
| **Post details** | Full description with a one-click `mailto:` button and the external application link |
| **My Posts** | A personal dashboard with counts and inline management |

## Tech stack

| Layer | Choice |
| --- | --- |
| Frontend | React 18.3 · Vite 5.4 · React Router 6.26 · Axios 1.7 · plain CSS |
| Backend | Node.js · Express 4.19 · Mongoose 8.5 |
| Auth | JWT (`jsonwebtoken` 9.0) · `bcryptjs` at 10 salt rounds |
| Database | MongoDB Atlas, M0 free tier |
| Hosting | Vercel (frontend) · Render (API) |

Requires **Node.js 18 or newer**; developed on v24.

```
campusconnect/
├── backend/
│   ├── config/db.js          # MongoDB connection
│   ├── middleware/           # asyncHandler, `protect` (JWT verification)
│   ├── models/               # User (bcrypt pre-save hook), Post (category enum)
│   ├── routes/               # auth.js, posts.js
│   └── server.js             # entry: CORS, routes, central error handler
├── frontend/
│   └── src/
│       ├── api/client.js     # axios instance + token interceptor
│       ├── components/       # Navbar, PostCard, CategoryFilter, ProtectedRoute
│       ├── context/          # AuthContext
│       └── pages/            # Home, Dashboard, Login, Register, PostDetail, PostForm
└── render.yaml               # Render blueprint for backend/
```

---

## Run it locally

**1 · Install** — dependencies are separate per app:

```bash
cd backend  && npm install
cd ../frontend && npm install
```

**2 · Create a free MongoDB Atlas cluster** — at <https://www.mongodb.com/cloud/atlas>:

1. Create a **M0 free** deployment.
2. **Security → Database Access → Add New Database User** — these are *database* credentials, separate from your Atlas website login. Avoid `@ : / ? # %` in the password.
3. **Security → Network Access → Add IP Address** — your IP, or `0.0.0.0/0` while developing.
4. **Connect → Drivers** → copy the string, then insert the database name and password:
   `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/campusconnect`

**3 · Configure the backend:**

```bash
cd backend
copy .env.example .env     # Windows
cp .env.example .env       # macOS / Linux
```

Fill in `MONGO_URI`, and generate a signing key for `JWT_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(40).toString('hex'))"
```

**4 · Start both apps** — they are separate processes, so use **two terminals**, backend first:

```bash
cd backend   && npm run dev      # → MongoDB connected / API running on http://localhost:5000
cd frontend  && npm run dev      # → http://localhost:5173
```

Open **http://localhost:5173**, register, and start posting. Check the API any time with `curl http://localhost:5000/api/health`.

> **No CORS setup is needed locally.** Vite forwards every `/api` call to port 5000, so the browser only ever sees one origin.

| Command | Does |
| --- | --- |
| `npm run dev` (backend) | API with Nodemon auto-reload |
| `npm start` (backend) | API with plain `node` |
| `npm run dev` (frontend) | Vite dev server |
| `npm run build` (frontend) | Production bundle into `dist/` |

## Environment variables

All backend config lives in `backend/.env`, which is gitignored — `backend/.env.example` is the committed template. **Never commit real credentials.**

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `MONGO_URI` | **Yes** | — | Atlas connection string, including the `campusconnect` database name |
| `JWT_SECRET` | **Yes** | — | Signing key for login tokens — a long random string |
| `JWT_EXPIRES` | No | `7d` | Token lifetime |
| `PORT` | No | `5000` | API port; must match the Vite proxy target in development |
| `CLIENT_URL` | No | `http://localhost:5173` | Comma-separated origins allowed by CORS |

The frontend needs nothing locally — it calls the relative path `/api`. Set `VITE_API_URL` only for a deployed build, where it is read at **build** time.

## API

Base URL `/api`. **Every route except `/api/health` requires** `Authorization: Bearer <token>`.

| Method | Endpoint | Notes |
| --- | --- | --- |
| `GET` | `/api/health` | `{ "status": "ok" }` — no auth |
| `POST` | `/api/auth/register` | `name`, `email`, `password` → `201 { token, user }` |
| `POST` | `/api/auth/login` | `email`, `password` → `200 { token, user }` |
| `GET` | `/api/auth/me` | Current user |
| `GET` | `/api/posts` | Query: `search`, `category`, `mine=true` → `{ count, posts }` |
| `GET` | `/api/posts/:id` | Single post |
| `POST` | `/api/posts` | `201` → created post |
| `PUT` / `DELETE` | `/api/posts/:id` | Author only, else `403` |

**Post fields:** `title` (required, ≤120) · `description` (required, ≤4000) · `category` (required, one of the five) · `contactEmail` (optional, validated) · `applyLink` (optional, ≤500) · `author` (set by the server from the JWT — never accepted from the client).

```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"title":"Frontend internship at Zenith Labs",
       "description":"React role for third-year students, remote, apply before 30 October.",
       "category":"Internships","contactEmail":"hr@zenith.io","applyLink":"https://zenith.io/careers"}'
```

Errors are always JSON with one `message` field: `400` invalid input · `401` missing/expired/wrong credentials · `403` not the author · `404` not found · `409` duplicate email.

## How it is deployed

Express is a long-lived process, so it runs on **Render**; the Vite build is static files, so it runs on **Vercel**.

- `render.yaml` is a Render **blueprint** — it defines the root directory, build and start commands, the health check, and CORS. `MONGO_URI` and `JWT_SECRET` are declared `sync: false`, so Render asks for them once in its own dashboard and they never enter Git.
- Vercel builds `frontend/` with `VITE_API_URL` pointed at the Render API, and `frontend/vercel.json` rewrites deep links to `index.html` so refreshing `/dashboard` works.
- **The free API falls asleep after ~15 minutes** of no traffic, so the first request can take 30–60 seconds and the feed shows *Loading posts…* while it wakes. That is expected, not a bug.
- Pushing to `main` redeploys Render automatically. Vercel is currently deployed with `npx vercel --prod` from `frontend/`; `vercel git connect` switches it to build on push too.

## Security decisions

- Passwords are hashed by a Mongoose `pre("save")` hook and the field is `select: false`, so it is excluded from queries and never returned.
- **Authorisation is server-side.** Edit and delete compare the stored `author` against the authenticated user before touching the database — hiding the buttons is a convenience, not the control.
- The author of a new post comes from the JWT, so a client cannot claim someone else's content.
- Post listings populate only the author's **name**, never their email address.
- Search terms are regex-escaped before being compiled into a MongoDB query.
- Input is validated in the browser for feedback and again in Express and the schema, because browser validation is always bypassable.
- Request bodies are capped at 100 kB.

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| `Missing MONGO_URI` | `backend/.env` was never created or filled. Copy `.env.example`. |
| Hangs, then `Could not connect to MongoDB` | Your IP is not on the Atlas **Network Access** list. |
| `Authentication failed` | Wrong **database user** password — not your Atlas website login. They are separate. |
| `ECONNREFUSED /api` in the browser | The backend isn't running. Start it first; Vite proxies to port 5000. |
| Feed is empty after logging in | No posts exist yet, or a category filter is still applied. |
| Live site hangs ~30–60 s, then works | Render put the free API to sleep. Load `/api/health` to wake it. |
| Live site logs `blocked by CORS policy` | The frontend origin is missing from `CLIENT_URL` in `render.yaml`. |

## What's next

No automated test suite yet — that is the first thing I would add, covering the auth rules and the author-only `403` paths. After that: comments and reactions, saved posts, image uploads for lost & found, cursor pagination (the feed currently returns every match in one response), and roles so coordinators can pin official announcements.

---

Built as a learning project with the MERN stack. No license file has been added yet.
