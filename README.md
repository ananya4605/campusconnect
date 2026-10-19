# CampusConnect

**A MERN platform where college students share and discover internships, events, study materials, announcements, and lost & found items — in one campus-wide board.**

| | |
| --- | --- |
| **Live demo** | https://campusconnect-mu-one.vercel.app |
| **API** | https://campusconnect-api-rhvm.onrender.com/api/health |
| **Repository** | https://github.com/ananya4605/campusconnect |
| **Stack** | React · Vite · Express · MongoDB Atlas · JWT |
| **Status** | Deployed MVP — registration, posting, search, filtering, and author-only editing are complete and verified end-to-end |

---

## Table of contents

- [Overview](#overview)
- [Problem statement](#problem-statement)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Folder structure](#folder-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [API overview](#api-overview)
- [Data models](#data-models)
- [Screenshots](#screenshots)
- [Deployment](#deployment)
- [Security decisions](#security-decisions)
- [Troubleshooting](#troubleshooting)
- [What's next](#whats-next)

---

## Overview

CampusConnect is a full-stack web application that gives a single college one shared place to publish what matters to students. A student registers, logs in, and lands on a live feed of campus posts. They can publish their own under one of five categories, search across every post, filter by category, and manage anything they have posted from a personal dashboard.

The project is built as two independent applications that talk over HTTP: an Express REST API backed by MongoDB Atlas, and a React single-page app that consumes it. Authentication is stateless — the API issues a JWT on login and the browser sends it back on every request.

## Problem statement

Information that students need is scattered across WhatsApp groups, notice boards, Instagram stories, and word of mouth. The consequences are predictable:

- An internship shared only in one class group is invisible to everyone outside it.
- Useful study material gets lost in a chat scroll within a day.
- Lost-and-found items have no durable, searchable record.
- There is no single place to check "what is happening on campus this week."

CampusConnect addresses this with one searchable, category-organised board where every entry carries its own contact route — an email address, an application link, or both.

## Features

### For students

| Feature | Detail |
| --- | --- |
| **Register & log in** | Email and password, with passwords stored only as bcrypt hashes |
| **Campus feed** | All posts, newest first, in a responsive card grid |
| **Create a post** | Title, description, category, and optional contact email and application link |
| **Edit & delete** | Available only to the post's author |
| **Search** | Case-insensitive match across both title **and** description |
| **Filter** | Category chips: All · Internships · Events · Study Materials · Announcements · Lost & Found |
| **Post details** | Full description with a one-click `mailto:` contact button and external application link |
| **My Posts dashboard** | Every post the signed-in student has published, with counts and inline management |

### Under the hood

- Authorisation enforced **server-side**, not just hidden in the UI — a hand-crafted request to edit someone else's post is rejected with `403`.
- Search input is regex-escaped before it reaches MongoDB, so a query containing `(` or `+` is treated as literal text rather than crashing the matcher.
- One centralised error handler converts validation, cast, and duplicate-key failures into clean JSON responses instead of stack traces.
- The API never returns a password field, and post listings expose only the author's name — not their email address.

## Tech stack

| Layer | Choice | Version |
| --- | --- | --- |
| Frontend | React | 18.3 |
| Build tool & dev server | Vite | 5.4 |
| Routing | React Router | 6.26 |
| HTTP client | Axios | 1.7 |
| Styling | Plain CSS with custom properties | — |
| Backend | Node.js + Express | 4.19 |
| Database | MongoDB Atlas (M0 free tier) via Mongoose | 8.5 |
| Authentication | JSON Web Tokens (`jsonwebtoken` 9.0) | — |
| Password hashing | `bcryptjs` (10 salt rounds) | 2.4 |
| Dev reload | Nodemon | 3.1 |

Developed on Node.js v24. **Node.js 18 or newer** is required.

> `bcryptjs` is used instead of native `bcrypt`: identical API and hashing scheme, but no C++ build toolchain is needed on Windows.

## Folder structure

```
campusconnect/
├── render.yaml                    # Render blueprint: rootDir, build/start commands, CORS origins
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── middleware/
│   │   ├── asyncHandler.js        # forwards rejected promises to the error handler
│   │   └── auth.js                # `protect` — verifies the JWT, loads req.user
│   ├── models/
│   │   ├── Post.js                # post schema, category enum, validation
│   │   └── User.js                # user schema + bcrypt pre-save hook
│   ├── routes/
│   │   ├── auth.js                # register, login, me
│   │   └── posts.js               # list, detail, create, update, delete
│   ├── .env                       # local secrets — gitignored, never committed
│   ├── .env.example               # safe template to copy
│   ├── server.js                  # app entry, CORS, routes, error handler
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── client.js          # axios instance + JWT request interceptor
    │   ├── components/
    │   │   ├── CategoryFilter.jsx # category chips
    │   │   ├── Navbar.jsx         # brand, nav links, session controls
    │   │   ├── PostCard.jsx       # feed card
    │   │   └── ProtectedRoute.jsx # redirects logged-out users to /login
    │   ├── context/
    │   │   └── AuthContext.jsx    # user, login, register, logout
    │   ├── pages/
    │   │   ├── Dashboard.jsx      # my posts
    │   │   ├── Home.jsx           # feed + search + filter
    │   │   ├── Login.jsx
    │   │   ├── PostDetail.jsx
    │   │   ├── PostForm.jsx       # create and edit (one component, two modes)
    │   │   └── Register.jsx
    │   ├── constants.js           # category list and badge styling
    │   ├── index.css              # design tokens, layout, responsive rules
    │   ├── main.jsx               # React root
    │   └── App.jsx                # route table
    ├── index.html
    ├── vite.config.js             # dev server + /api proxy
    ├── vercel.json                # build settings + SPA rewrite for deep links
    └── package.json
```

## Getting started

### 1. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Create a MongoDB Atlas cluster

1. Sign up at <https://www.mongodb.com/cloud/atlas> and create a **free (M0)** deployment.
2. **Security → Database Access → Add New Database User** — create a username and password. These are *database* credentials, separate from your Atlas website login. Avoid `@ : / ? # %` in the password, or URL-encode it in the connection string.
3. **Security → Network Access → Add IP Address** — add your current IP, or `0.0.0.0/0` to allow any address while developing.
4. **Clusters → Connect → Drivers** — copy the connection string.
5. Insert your database name so the path ends in `/campusconnect`, and replace the `<password>` placeholder with your real one:

```
mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/campusconnect
```

### 3. Configure the environment

```bash
cd backend
copy .env.example .env      # Windows
cp .env.example .env        # macOS / Linux
```

Then open `backend/.env` and fill in `MONGO_URI` and `JWT_SECRET`. See [Environment variables](#environment-variables).

### 4. Run both applications

The API and the site are separate processes, so use **two terminals** and start the backend first.

Terminal 1 — API on port 5000:

```bash
cd backend
npm run dev
```

Wait for:

```
MongoDB connected
API running on http://localhost:5000
```

Terminal 2 — React app on port 5173:

```bash
cd frontend
npm run dev
```

Open **http://localhost:5173**, register an account, and start posting.

Sanity-check the API at any time:

```bash
curl http://localhost:5000/api/health
# {"status":"ok"}
```

> **No CORS configuration is needed while developing.** Vite forwards every `/api` request to `http://localhost:5000` (see `frontend/vite.config.js`), so the browser only ever talks to one origin. Set `CLIENT_URL` when you deploy the frontend to a different domain.

### Available scripts

| Location | Command | Does |
| --- | --- | --- |
| `backend/` | `npm run dev` | Start the API with Nodemon auto-reload |
| `backend/` | `npm start` | Start the API with plain `node` (production) |
| `frontend/` | `npm run dev` | Start the Vite dev server |
| `frontend/` | `npm run build` | Production bundle into `frontend/dist/` |
| `frontend/` | `npm run preview` | Serve the built bundle locally |

## Environment variables

All backend configuration lives in `backend/.env`. This file is listed in `.gitignore` and **must never be committed** — `backend/.env.example` is the committed template.

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `MONGO_URI` | **Yes** | — | Atlas connection string, including the `campusconnect` database name |
| `JWT_SECRET` | **Yes** | — | Signing key for login tokens. Long random string |
| `JWT_EXPIRES` | No | `7d` | Token lifetime |
| `PORT` | No | `5000` | API port; must match the Vite proxy target during development |
| `CLIENT_URL` | No | `http://localhost:5173` | Comma-separated origins allowed by CORS |

`backend/.env.example`:

```dotenv
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/campusconnect?retryWrites=true&w=majority
JWT_SECRET=paste_a_long_random_string_here
JWT_EXPIRES=7d
PORT=5000
CLIENT_URL=http://localhost:5173
```

Generate a strong signing key with either of these:

```bash
node -e "console.log(require('crypto').randomBytes(40).toString('hex'))"
openssl rand -hex 40
```

The frontend needs **no** environment variables — it calls the relative path `/api`.

## API overview

Base URL: `/api`. Every route below except `/health` requires the header `Authorization: Bearer <token>`.

### Authentication

| Method | Endpoint | Auth | Body | Returns |
| --- | --- | --- | --- | --- |
| `GET` | `/api/health` | No | — | `{ "status": "ok" }` |
| `POST` | `/api/auth/register` | No | `name`, `email`, `password` | `201` → `{ token, user }` |
| `POST` | `/api/auth/login` | No | `email`, `password` | `200` → `{ token, user }` |
| `GET` | `/api/auth/me` | Yes | — | `{ user: { _id, name, email } }` |

### Posts

| Method | Endpoint | Auth | Notes |
| --- | --- | --- | --- |
| `GET` | `/api/posts` | Yes | Query params: `search`, `category`, `mine=true`. Returns `{ count, posts }`, newest first |
| `GET` | `/api/posts/:id` | Yes | Single post, or `404` |
| `POST` | `/api/posts` | Yes | `201` → created post |
| `PUT` | `/api/posts/:id` | Yes | Author only, else `403` |
| `DELETE` | `/api/posts/:id` | Yes | Author only, else `403` |

**Post fields**

| Field | Type | Rules |
| --- | --- | --- |
| `title` | string | Required, trimmed, max 120 |
| `description` | string | Required, trimmed, max 4000 |
| `category` | string | Required, one of the five categories |
| `contactEmail` | string | Optional; validated as an email when provided |
| `applyLink` | string | Optional, max 500 |
| `author` | ObjectId | Set by the server from the JWT — never accepted from the client |

**Example — create a post**

```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Frontend internship at Zenith Labs",
    "description": "React role for third-year students, remote, apply before 30 October.",
    "category": "Internships",
    "contactEmail": "hr@zenith.io",
    "applyLink": "https://zenith.io/careers"
  }'
```

**Example — search and filter**

```bash
curl "http://localhost:5000/api/posts?search=internship&category=Internships" \
  -H "Authorization: Bearer $TOKEN"

curl "http://localhost:5000/api/posts?mine=true" -H "Authorization: Bearer $TOKEN"
```

**Error responses** are always JSON with a single `message` field:

| Status | When |
| --- | --- |
| `400` | Missing or invalid fields, malformed ObjectId |
| `401` | No token, expired token, or wrong credentials |
| `403` | Request to edit or delete another user's post |
| `404` | Post or route not found |
| `409` | Duplicate email on registration |

## Data models

**User** — `name`, `email` (unique, lowercased), `password` (bcrypt hash, `select: false`), timestamps.

```js
{ _id, name: "Asha Rao", email: "asha@college.edu", password: "$2a$10$…", createdAt, updatedAt }
```

**Post** — `title`, `description`, `category`, `contactEmail`, `applyLink`, `author` → `User`, timestamps. Indexed on `author` for the dashboard query.

```js
{ _id, title, description, category: "Internships", contactEmail, applyLink,
  author: ObjectId, createdAt, updatedAt }
```

## Screenshots

_Drop images into a `screenshots/` folder at the repository root, then uncomment the lines below._

<!--
### Campus feed
![Post feed with search and category filters](screenshots/feed.png)

### Post details
![Single post with contact email and application link](screenshots/post-detail.png)

### Create a post
![Post creation form with category dropdown](screenshots/create-post.png)

### My Posts dashboard
![Dashboard showing the signed-in student's posts](screenshots/dashboard.png)
-->

## Deployment

The two halves run on separate free tiers because they need different things: Express is a
long-lived process, so it goes on Render; the Vite build is static files, so it goes on Vercel.

| Piece | Host | Configured by |
| --- | --- | --- |
| `backend/` | Render — https://campusconnect-api-rhvm.onrender.com | [`render.yaml`](render.yaml) blueprint |
| `frontend/` | Vercel — https://campusconnect-mu-one.vercel.app | [`frontend/vercel.json`](frontend/vercel.json) + project env |
| Database | MongoDB Atlas M0 | `MONGO_URI` on Render |

**How the two find each other.** `VITE_API_URL` is inlined into the JavaScript bundle at
*build* time, so Vercel must know the API address before it builds. Render's `CLIENT_URL`
then has to list the Vercel origin or the browser blocks every response. Both values are
committed in `render.yaml` and the Vercel project settings, so neither is a guess.

**No secrets are in this repository.** `render.yaml` declares `MONGO_URI` and `JWT_SECRET`
with `sync: false`, which makes Render prompt for them once in its own dashboard. They are
never stored in Git, and `backend/.env` stays gitignored.

**Two things to expect on the free tier:**
- Render idles the API after ~15 minutes without traffic. The next request takes 30–60 seconds
  and the feed simply shows *Loading posts…* while it wakes. That is not a bug.
- Atlas Network Access is set to `0.0.0.0/0` because Render's free instances have no static
  egress IP. Access is then protected by the database credentials alone. Fine for a
  demonstration cluster; replace it with specific IPs for anything holding real data.

**Redeploying.** Pushing to `main` updates Render automatically through the blueprint. Vercel
is currently deployed from the CLI, so a frontend change needs `npx vercel --prod` from
`frontend/`. Running `vercel git connect` there switches Vercel to build on every push too.

## Security decisions

- **Passwords are never stored or returned in plaintext.** A Mongoose `pre("save")` hook hashes with bcrypt at 10 salt rounds, and the schema marks `password` as `select: false` so it is excluded from queries unless explicitly requested.
- **Authorisation is enforced on the server.** The edit and delete handlers compare the stored `author` against the authenticated user before touching the database. Hiding the buttons in the UI is a convenience, not the control.
- **The author is taken from the token.** `POST /api/posts` sets `author` from `req.user._id`; a client cannot claim authorship of another account.
- **Email addresses are not leaked.** Post listings populate only the author's `name`.
- **Input is validated twice** — in the browser for immediate feedback, and again in Express and in the Mongoose schema, because browser validation can always be bypassed.
- **Regex injection is neutralised.** Search terms are escaped before being compiled into a MongoDB regular expression.
- **Payload size is capped** at 100 kB to keep the request body parser from being abused.
- **Secrets stay local.** `backend/.env` is gitignored; only `.env.example`, with placeholders, is published.

## Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| `Missing MONGO_URI in backend/.env` | `backend/.env` was never created or filled. Copy `.env.example` to `.env`. |
| `Could not connect to MongoDB` / hangs then times out | Your IP is not on the Atlas Network Access list. Add it, or allow `0.0.0.0/0`. |
| `Authentication failed` | Wrong **database user** password — not your Atlas website login. These are separate. Re-create the user or edit its password in Atlas, then update `MONGO_URI`. |
| `getaddrinfo ENOTFOUND` | Typo in the cluster hostname, or no network/VPN blocking the connection. |
| Login works but the feed is empty | No posts exist yet, or a category filter is still applied. |
| Browser shows `ECONNREFUSED /api` | The backend is not running. Start it first — Vite proxies to port 5000. |
| `Port already in use` | Change `PORT` in `backend/.env` **and** the proxy target in `frontend/vite.config.js`. |
| Session lost after a while | The JWT has passed `JWT_EXPIRES`. Log in again, or raise the value. |
| Live site hangs ~30–60 s, then works | Render put the free API to sleep. Load `/api/health` to wake it, or upgrade the plan. |
| Live site logs `blocked by CORS policy` | The frontend origin is missing from Render's `CLIENT_URL`. Add it to `render.yaml` and let the blueprint sync. |

## What's next

The MVP is complete and stable. Planned improvements, roughly in order of value:

1. **Automated tests** — a Jest + Supertest suite covering the auth rules and the author-only `403` paths, which are the parts most likely to break during a refactor.
2. **Comments and reactions** so posts become two-way threads rather than notices.
3. **Saved posts** and per-category notification preferences.
4. **Image uploads** for lost & found, using a signed-upload service rather than the database.
5. **Pagination** — the feed currently returns every matching post in one response, which is fine for one campus but should be cursor-paginated before it scales.
6. **Roles** so that club coordinators and the placement cell can pin official announcements.

---

Built as a learning project with the MERN stack. No license file has been added yet.
