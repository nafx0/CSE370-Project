# Rent Ease BD — Frontend

React + Vite single-page application for the **Digital Housing Platform** (CSE 370 project).  
Communicates with the Spring Boot backend at `http://localhost:8080` via a cookie-based session.

---

## Tech Stack

| Tool | Purpose |
|---|---|
| React 19 | UI framework |
| Vite 8 | Dev server & bundler |
| React Router 7 | Client-side routing |
| React Hook Form 7 | Form state & validation |
| Axios | HTTP client (utility imports) |
| Tailwind CSS 4 | Utility CSS |
| GSAP 3 | Page entrance animations |
| Lenis | Smooth scroll |
| Lucide React | Icon set |

---

## Project Structure

```
src/
├── api.js                  # All fetch calls to the backend REST API
├── App.jsx                 # Router & route tree
├── AuthContext.jsx         # Global auth state (login, signup, logout, me)
├── main.jsx                # React DOM entry point
├── index.css               # Design tokens, base styles, component classes
│
├── components/
│   ├── AppShell.jsx        # Sidebar nav + layout wrapper
│   ├── ActionMenu.jsx      # Dropdown action menu (edit / delete)
│   ├── Modal.jsx           # Reusable modal dialog
│   ├── ProtectedRoute.jsx  # Redirects to /login if unauthenticated
│   └── SmoothScrollProvider.jsx  # Lenis scroll setup
│
├── pages/
│   ├── LoginPage.jsx
│   ├── SignupPage.jsx
│   ├── DashboardPage.jsx
│   ├── PropertiesPage.jsx
│   ├── PropertyDetailPage.jsx   # Join codes, tenancies, announcements, complaints, bill shares
│   ├── TenantsPage.jsx
│   ├── LandlordsPage.jsx
│   ├── AnnouncementsPage.jsx
│   ├── ComplaintsPage.jsx
│   ├── BillsPage.jsx
│   └── ProfilePage.jsx
│
└── utils/
    └── validation.js       # Shared regex patterns (email, phone, NID, password)
```

---

## Routes

| Path | Page | Auth |
|---|---|---|
| `/login` | LoginPage | Public |
| `/signup` | SignupPage | Public |
| `/` | DashboardPage | Protected |
| `/properties` | PropertiesPage | Protected |
| `/properties/:id` | PropertyDetailPage | Protected |
| `/tenants` | TenantsPage | Protected |
| `/landlords` | LandlordsPage | Protected |
| `/announcements` | AnnouncementsPage | Protected |
| `/complaints` | ComplaintsPage | Protected |
| `/bills` | BillsPage | Protected |
| `/profile` | ProfilePage | Protected |

---

## Form Validation

Validation patterns live in [`src/utils/validation.js`](src/utils/validation.js) and are applied via React Hook Form.

| Field | Rule |
|---|---|
| Email | Must match standard email format |
| Phone | Bangladeshi mobile number (`+88017XXXXXXXX`, etc.) |
| NID | 10–17 digits (spaces/hyphens allowed) |
| Password | 6–20 characters |

---

## Getting Started

### Prerequisites
- Node.js 18+
- Backend running on `http://localhost:8080`

### Install & Run

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev
```

### Other Scripts

```bash
npm run build     # Production build → dist/
npm run preview   # Serve the production build locally
npm run lint      # Run ESLint
```

---

## Backend API Base URL

Hardcoded in [`src/api.js`](src/api.js):

```js
const BASE_URL = "http://localhost:8080";
```

All requests are sent with `credentials: "include"` so the session cookie is forwarded automatically.
