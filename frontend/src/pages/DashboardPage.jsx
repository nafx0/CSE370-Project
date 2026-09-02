import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const isLandlord = user?.role === "landlord";

  return (
    <div className="hub">
      <div className="hub-greeting">
        <h1>Welcome, {user?.name}</h1>
        <span className="hub-role">{user?.role}</span>
      </div>

      <div className="hub-grid">
        <Link to="/properties" className="hub-tile">
          <span className="hub-tile-title">Properties</span>
          <span className="hub-tile-desc">
            {isLandlord ? "List and manage your listings" : "Browse and enroll with a code"}
          </span>
        </Link>

        {isLandlord && (
          <Link to="/tenants" className="hub-tile">
            <span className="hub-tile-title">Tenants</span>
            <span className="hub-tile-desc">View and rate your tenants</span>
          </Link>
        )}

        {isLandlord && (
          <Link to="/announcements" className="hub-tile">
            <span className="hub-tile-title">Announcements</span>
            <span className="hub-tile-desc">Notices for your properties</span>
          </Link>
        )}

        {!isLandlord && (
          <Link to="/landlords" className="hub-tile">
            <span className="hub-tile-title">Landlords</span>
            <span className="hub-tile-desc">Browse and rate landlords</span>
          </Link>
        )}

        <Link to="/complaints" className="hub-tile">
          <span className="hub-tile-title">Complaints</span>
          <span className="hub-tile-desc">
            {isLandlord ? "Track issues on your properties" : "Report and track your issues"}
          </span>
        </Link>

        <Link to="/bills" className="hub-tile">
          <span className="hub-tile-title">Bills</span>
          <span className="hub-tile-desc">
            {isLandlord ? "Create bills and track shares" : "See what you owe"}
          </span>
        </Link>

        <Link to="/profile" className="hub-tile">
          <span className="hub-tile-title">Profile</span>
          <span className="hub-tile-desc">Your account details</span>
        </Link>
      </div>

      <div className="hub-logout">
        <button className="btn btn-ghost" onClick={logout}>Log out</button>
      </div>
    </div>
  );
}
