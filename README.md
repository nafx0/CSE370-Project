# Team Workload Distribution — Digital Housing Platform

Split by module rather than by layer: each person owns the database table(s), backend controller, and frontend page(s) for their features end-to-end. This keeps the DB/backend/frontend workload equal for both people, rather than one person doing all the backend and the other doing all the UI.

---

## Nafiul — Identity, Properties & Enrollment

| Module | Database | Backend | Frontend |
|---|---|---|---|
| Auth | `User` table | `AuthController` (signup, login, logout, me) | `LoginPage.jsx`, `SignupPage.jsx`, `AuthContext.jsx` |
| Users / Landlords / Tenants | `User`, `Landlord`, `Tenant` tables | `UserController`, `LandlordController`, `TenantController` | shared lookups used across pages (name/email/phone resolution) |
| Properties | `Property` table | `PropertyController` (CRUD + date validation) | `PropertiesPage.jsx` |
| Join Codes | `JoinCode` table | `JoinCodeController` (generate, join, revoke) | `PropertyDetailPage.jsx` — join code + enroll sections |
| Tenancies | `HasTenancy` table | `TenancyController` (create, leave) | `PropertyDetailPage.jsx` — leave-tenancy section, `PropertiesPage.jsx` — enrolled-property card + modal |
| App shell | — | — | `App.jsx` (routing), `ProtectedRoute.jsx`, `ProfilePage.jsx`, `DashboardPage.jsx` |

**Owns in `api.js`:** auth, users, landlords, tenants, properties, join codes, tenancies functions.

## Rahib — Community, Ratings & Finance

| Module | Database | Backend | Frontend |
|---|---|---|---|
| Tenant Ratings | `RatesTenant` table | `TenantRatingController` (create + eligibility check) | `TenantsPage.jsx` |
| Landlord Ratings | `RatesLandlord` table | `LandlordRatingController` (create + eligibility check) | `LandlordsPage.jsx` |
| Announcements | `Announcement` table (composite key) | `AnnouncementController` | `AnnouncementsPage.jsx`, `PropertyDetailPage.jsx` — announcements section |
| Complaints | `Complaint` table (composite key) | `ComplaintController` | `ComplaintsPage.jsx`, `PropertyDetailPage.jsx` — complaints section |
| Bills | `Bill` table | `BillController` | `BillsPage.jsx` — bill creation + list |
| Bill Shares | `BillShare` table | `BillShareController` (create, pay, delete) | `BillsPage.jsx` — share payment, `PropertyDetailPage.jsx` — "my bill share" section |

**Owns in `api.js`:** tenant ratings, landlord ratings, announcements, complaints, bills, bill shares functions.

---

## Shared / joint work

A few things don't split cleanly and are worth doing together (or handing off explicitly) rather than assigning to one person:

- **`PropertyDetailPage.jsx`** — this file contains sections from both people's modules (join codes/tenancy from Nafiul, announcements/complaints/bills from Rahib). Either pair-program this file or merge each person's section in separately — flag this clearly in the report so it's not miscounted as one person's work.
- **`index.css` / design system** — the color tokens, typography, and base component styles (`.btn`, `.card`, `.list-row`, `.badge`, etc.) should be agreed on together once, early, so both people's pages look consistent. After that foundation exists, each person styles their own pages using it.
- **CORS / backend config (`WebConfig.java`)** — a one-time global setup, not tied to any single module; whoever sets up the backend project initially can own this.
- **Database schema / ER diagram** — worth designing together in one sitting even though individual tables are owned separately above, since several tables reference each other (`Property.landlordId`, `HasTenancy.propertyId` + `tenantId`, `BillShare.billId`, etc.).

## Balance check

| | Nafiul | Rahib |
|---|---|---|
| DB tables owned | 5 (User, Landlord, Tenant, Property, JoinCode, HasTenancy — 6 counting the shared marker tables as one group) | 6 (RatesTenant, RatesLandlord, Announcement, Complaint, Bill, BillShare) |
| Backend controllers | 6 | 6 |
| Frontend pages (primary) | 6 (Login, Signup, Dashboard, Properties, Profile, + shared PropertyDetail) | 5 (Tenants, Landlords, Announcements, Complaints, Bills, + shared PropertyDetail) |

Close to even on paper — but Rahib's modules (bill splitting/recalculation, rating eligibility gating) carry more business-logic complexity than raw file count suggests, while Nafiul's modules (auth, routing, protected routes) carry more foundational/setup weight that has to happen first and unblocks everything else. Worth naming that trade-off explicitly in the report rather than relying on the table alone to prove "equal effort."
