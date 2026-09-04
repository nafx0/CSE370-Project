# Digital Housing Platform

A web app connecting landlords and tenants in Bangladesh — property listings, join-code enrollment, complaints, announcements, split bills, and two-way ratings, all under one roof.

Built as a college project: a React (Vite) frontend talking to a Spring Boot + MySQL backend over a cookie-based session.

---

## Table of contents

- [What it does](#what-it-does)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Design system](#design-system)
- [Known limitations](#known-limitations)

---

## What it does

Two roles, one platform:

**Landlords**
- List properties with rent, area, and posting/expiry dates
- Generate join codes so tenants can enroll themselves
- Post announcements and track complaints on their properties
- Create bills — the total is split automatically across every tenant currently enrolled, and rebalances if someone joins or leaves before it's paid
- Rate tenants once they've moved out

**Tenants**
- Browse every listed property, see the landlord's name and average rating
- Enroll with a join code (one active tenancy at a time)
- File complaints and read announcements for their property
- See their share of each bill and confirm payment with a transaction ID
- Rate their landlord once they've left

Nothing here uses a navbar — navigation happens through a single dashboard hub and in-page links back to it.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React 18 + Vite |
| Routing | react-router-dom |
| Forms | react-hook-form |
| Styling | Plain CSS, no framework — a small custom design system in `index.css` |
| Backend | Spring Boot |
| Database | MySQL |
| Auth | Session cookie (`credentials: 'include'`) — no JWT |

## Project structure

```
src/
├── main.jsx            # mounts <App /> — routing/auth providers live in App.jsx
├── App.jsx             # routes + AuthProvider, no navbar
├── api.js              # every API call, grouped by resource
├── AuthContext.jsx      # current user, login/signup/logout, session check on load
├── index.css            # design tokens + every page's styling
│
├── components/
│   └── ProtectedRoute.jsx
│
└── pages/
    ├── LoginPage.jsx
    ├── SignupPage.jsx
    ├── DashboardPage.jsx        # role-aware hub, no navbar needed
    ├── PropertiesPage.jsx       # browse/manage listings, enrolled-property card
    ├── PropertyDetailPage.jsx   # one property's announcements/complaints/bills
    ├── TenantsPage.jsx          # landlord: current & past tenants, ratings
    ├── LandlordsPage.jsx        # tenant: current & past landlords, ratings
    ├── ComplaintsPage.jsx
    ├── AnnouncementsPage.jsx
    ├── BillsPage.jsx            # bill creation, auto-split, payment confirmation
    └── ProfilePage.jsx
```

## Getting started

**Prerequisites:** Node.js, a running instance of the backend (`http://localhost:8080` by default), and a MySQL database it can connect to.

```bash
# 1. Clone the project (skip if already scaffolded)
git clone https://github.com/nafx0/CSE370-Project.git

# 2. Create the database using name '

# 2. Install dependencies
npm install

# 3. Run the dev server
npm run dev
```

The app expects the backend at `http://localhost:8080` with CORS configured to allow credentials from the Vite dev origin (`http://localhost:5173`). If you're on Windows and `npm` is blocked by PowerShell's execution policy, run:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Full endpoint reference lives in the API documentation handed off alongside this project.

## Design system

A quiet, ledger-inspired look — flat surfaces and hairline dividers instead of stacked cards, one accent color (`#1f4d3d`) for primary actions, and a single amber tone reserved for anything awaiting action. `Fraunces` carries headings, `Plus Jakarta Sans` carries everything else. The one place the design gets to be bold is the dashboard: a Pinterest-style bento grid that adapts to however many tiles a role has, with zero leftover empty space.

Motion is deliberate rather than decorative — one fade on page load, and animation elsewhere only in response to something the person did (opening a modal, confirming a payment).

## Known limitations

Carried over from the API itself, not introduced by the frontend:

- Passwords are stored and compared in plain text — fine for coursework, not for production
- No pagination — every list endpoint returns all rows at once
- No input validation beyond what MySQL enforces, so malformed input can surface as a raw 500 instead of a clean error
- Bill shares can't be edited once created, only deleted and recreated — this is how the frontend implements dynamic re-splitting when enrollment changes, and it means a share's amount is frozen the moment it's paid
