import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  if (!user) return <div className="page"><p className="loading">Loading…</p></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <Link to="/" className="back-link">← Dashboard</Link>
          <h1>Profile</h1>
        </div>
      </div>

      <ul className="profile-list">
        <li><span>Name</span><span>{user.name}</span></li>
        <li><span>Email</span><span>{user.email}</span></li>
        <li><span>Phone</span><span>{user.phone}</span></li>
        <li><span>NID</span><span>{user.NID}</span></li>
        <li><span>Role</span><span>{user.role}</span></li>
      </ul>

      <div className="form-actions" style={{ marginTop: "1.5rem" }}>
        <button className="btn btn-ghost" onClick={handleLogout}>Log out</button>
      </div>
    </div>
  );
}
