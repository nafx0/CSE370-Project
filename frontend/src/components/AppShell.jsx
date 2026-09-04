import { NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import {
  LayoutDashboard,
  Building2,
  AlertCircle,
  Receipt,
  User,
  Users,
  Megaphone,
  ShieldCheck,
  LogOut,
  ChevronRight,
} from "lucide-react";

const baseNavItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/properties", label: "Properties", icon: Building2 },
  { to: "/complaints", label: "Complaints", icon: AlertCircle },
  { to: "/bills", label: "Bills", icon: Receipt },
  { to: "/profile", label: "Profile", icon: User },
];

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const roleItems =
    user?.role === "landlord"
      ? [
          { to: "/tenants", label: "Tenants", icon: Users },
          { to: "/announcements", label: "Announcements", icon: Megaphone },
        ]
      : [{ to: "/landlords", label: "Landlords", icon: ShieldCheck }];

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  // Derive human-readable page name for Apple breadcrumb topbar
  function getCurrentPageName() {
    const p = location.pathname;
    if (p === "/") return "Dashboard";
    if (p.startsWith("/properties/")) return "Property Details";
    if (p.startsWith("/properties")) return "Properties";
    if (p.startsWith("/complaints")) return "Complaints";
    if (p.startsWith("/bills")) return "Bills";
    if (p.startsWith("/profile")) return "Profile";
    if (p.startsWith("/tenants")) return "Tenants";
    if (p.startsWith("/announcements")) return "Announcements";
    if (p.startsWith("/landlords")) return "Landlords";
    return "Workspace";
  }

  return (
    <div className="app-shell">
      {/* macOS-style Sidebar */}
      <aside className="app-sidebar">
        <Link to="/" className="app-brand">
          <img
            src="/icons8-house-48.png"
            alt=""
            aria-hidden="true"
            className="app-brand-icon"
          />
          <div>
            <span className="app-brand-name">Rent Ease BD.</span>
            <span className="app-brand-subtitle">Housing Control Center</span>
          </div>
        </Link>

        <nav className="app-nav" aria-label="Primary">
          {baseNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `app-nav-link${isActive ? " is-active" : ""}`
                }
              >
                <Icon size={18} strokeWidth={1.8} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <div className="app-nav-group">
            <div className="app-nav-group-label">
              {user?.role === "landlord" ? "Landlord Tools" : "Tenant Tools"}
            </div>
            {roleItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `app-nav-link${isActive ? " is-active" : ""}`
                  }
                >
                  <Icon size={18} strokeWidth={1.8} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        <div className="app-user-card">
          <div className="app-user-card-top">
            <span className="app-user-avatar" aria-hidden="true">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="app-user-name" title={user?.name}>
                {user?.name || "User"}
              </div>
              <div className="app-user-meta" title={user?.email}>
                {user?.email}
              </div>
            </div>
          </div>
          <div className="app-user-chip">{user?.role}</div>
          <button
            type="button"
            className="btn btn-ghost btn-sm app-logout"
            onClick={handleLogout}
          >
            <LogOut size={14} style={{ marginRight: "0.25rem" }} />
            Log out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="app-main">
        <header className="app-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <nav className="app-topbar-breadcrumb" aria-label="Breadcrumbs">
              <span>Rent Ease</span>
              <ChevronRight size={14} strokeWidth={2} style={{ opacity: 0.5 }} />
              <span className="current">{getCurrentPageName()}</span>
            </nav>
          </div>

          <div className="app-topbar-actions">
            <Link to="/properties" className="btn btn-ghost btn-sm">
              <Building2 size={14} />
              <span>Properties</span>
            </Link>
          </div>
        </header>

        <main className="app-stage">{children}</main>
      </div>
    </div>
  );
}
