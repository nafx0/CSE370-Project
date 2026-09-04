import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import AppShell from "../components/AppShell";
import { User, Mail, Phone, Shield, CreditCard, LogOut } from "lucide-react";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  if (!user) {
    return (
      <AppShell>
        <div className="page">
          <p className="loading">Loading profile…</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="page">
        <div
          style={{
            maxWidth: "620px",
            margin: "1rem auto 3rem",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Centered Page Header */}
          <div
            style={{
              textAlign: "center",
              marginBottom: "1.75rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <h1>Account Profile</h1>
            <p className="page-subtitle">Your personal account credentials and role permissions</p>
          </div>

          {/* Centered Profile Card */}
          <div className="card" style={{ width: "100%", padding: "2rem 2.25rem" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                paddingBottom: "1.75rem",
                borderBottom: "1px solid var(--line)",
              }}
            >
              <div
                className="app-user-avatar"
                style={{
                  width: "5.25rem",
                  height: "5.25rem",
                  fontSize: "2rem",
                  marginBottom: "1rem",
                  boxShadow: "0 8px 28px rgba(10, 132, 255, 0.4)",
                }}
              >
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <h2 style={{ margin: "0 0 0.4rem 0", fontSize: "1.45rem" }}>{user.name}</h2>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span className="badge badge-progress">{user.role}</span>
                <span style={{ fontSize: "0.82rem", color: "var(--ink-faint)" }}>
                  ID #{user.userId}
                </span>
              </div>
            </div>

            <ul className="profile-list" style={{ marginTop: "1rem" }}>
              <li>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem" }}>
                  <User size={16} style={{ color: "var(--ink-faint)" }} />
                  <span>Full Name</span>
                </span>
                <span>{user.name}</span>
              </li>
              <li>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem" }}>
                  <Mail size={16} style={{ color: "var(--ink-faint)" }} />
                  <span>Email Address</span>
                </span>
                <span>{user.email}</span>
              </li>
              <li>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem" }}>
                  <Phone size={16} style={{ color: "var(--ink-faint)" }} />
                  <span>Contact Phone</span>
                </span>
                <span>{user.phone || "—"}</span>
              </li>
              <li>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem" }}>
                  <Shield size={16} style={{ color: "var(--ink-faint)" }} />
                  <span>National ID (NID)</span>
                </span>
                <span>{user.NID || "—"}</span>
              </li>
              <li>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem" }}>
                  <CreditCard size={16} style={{ color: "var(--ink-faint)" }} />
                  <span>Assigned Role</span>
                </span>
                <span style={{ textTransform: "capitalize" }}>{user.role}</span>
              </li>
            </ul>
          </div>

          {/* Centered Destructive Red Button */}
          <div style={{ marginTop: "2rem", width: "100%", display: "flex", justifyContent: "center" }}>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleLogout}
              style={{ minWidth: "220px", padding: "0.7rem 1.8rem", fontSize: "0.92rem" }}
            >
              <LogOut size={16} />
              <span>Sign Out of Rent Ease</span>
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
