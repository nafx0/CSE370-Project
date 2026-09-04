import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import AppShell from "../components/AppShell";
import {
  Building2,
  Users,
  Megaphone,
  ShieldCheck,
  AlertCircle,
  Receipt,
  User,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const isLandlord = user?.role === "landlord";

  return (
    <AppShell>
      <div className="hub dashboard-overview">
        <section className="dashboard-hero">
          <div className="card dashboard-hero-copy">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <Sparkles size={16} className="text-accent" style={{ color: "var(--accent)" }} />
              <p className="dashboard-kicker" style={{ margin: 0 }}>
                {isLandlord ? "LANDLORD COMMAND CENTER" : "RESIDENT OVERVIEW"}
              </p>
            </div>
            <h1>Good day, {user?.name}.</h1>
            <p className="dashboard-copy">
              Manage your properties, community notices, monthly bills, and requests from one unified workspace.
            </p>
            <div className="form-actions">
              <Link to="/properties" className="btn">
                <Building2 size={16} />
                <span>Explore properties</span>
              </Link>
              <Link to="/profile" className="btn btn-ghost">
                <User size={16} />
                <span>Account settings</span>
              </Link>
            </div>
          </div>

          <div className="card dashboard-spotlight">
            <div className="dashboard-spotlight-icon">
              <img src="/icons8-house-48.png" alt="" aria-hidden="true" style={{ width: "24px", height: "24px" }} />
            </div>
            <div className="dashboard-spotlight-title">
              {isLandlord ? "Landlord Deck" : "Tenant Suite"}
            </div>
            <p className="dashboard-copy" style={{ fontSize: "0.88rem", marginBottom: 0 }}>
              {isLandlord
                ? "Oversee your property listings, onboard tenants with join codes, and maintain ledgers."
                : "Browse available homes, enroll with join codes, report issues, and settle utility shares."}
            </p>
          </div>
        </section>

        <section>
          <div className="section-head" style={{ marginBottom: "1.25rem" }}>
            <h2>Quick Navigation</h2>
          </div>

          <div className="hub-grid">
            <Link to="/properties" className="bento-card">
              <div className="bento-card-top">
                <div className="bento-icon-wrapper">
                  <Building2 size={20} />
                </div>
                <ArrowUpRight size={18} style={{ opacity: 0.4 }} />
              </div>
              <div>
                <span className="hub-tile-title">Properties</span>
                <span className="hub-tile-desc">
                  {isLandlord ? "Listings, vacancies, and lease terms" : "Explore listings and active residence"}
                </span>
              </div>
            </Link>

            {isLandlord ? (
              <Link to="/tenants" className="bento-card">
                <div className="bento-card-top">
                  <div className="bento-icon-wrapper">
                    <Users size={20} />
                  </div>
                  <ArrowUpRight size={18} style={{ opacity: 0.4 }} />
                </div>
                <div>
                  <span className="hub-tile-title">Tenants</span>
                  <span className="hub-tile-desc">View resident directory and submit feedback</span>
                </div>
              </Link>
            ) : (
              <Link to="/landlords" className="bento-card">
                <div className="bento-card-top">
                  <div className="bento-icon-wrapper">
                    <ShieldCheck size={20} />
                  </div>
                  <ArrowUpRight size={18} style={{ opacity: 0.4 }} />
                </div>
                <div>
                  <span className="hub-tile-title">Landlords</span>
                  <span className="hub-tile-desc">Past landlord records and rating history</span>
                </div>
              </Link>
            )}

            {isLandlord && (
              <Link to="/announcements" className="bento-card">
                <div className="bento-card-top">
                  <div className="bento-icon-wrapper">
                    <Megaphone size={20} />
                  </div>
                  <ArrowUpRight size={18} style={{ opacity: 0.4 }} />
                </div>
                <div>
                  <span className="hub-tile-title">Announcements</span>
                  <span className="hub-tile-desc">Broadcast updates and notices to residents</span>
                </div>
              </Link>
            )}

            <Link to="/complaints" className="bento-card">
              <div className="bento-card-top">
                <div className="bento-icon-wrapper">
                  <AlertCircle size={20} />
                </div>
                <ArrowUpRight size={18} style={{ opacity: 0.4 }} />
              </div>
              <div>
                <span className="hub-tile-title">Complaints</span>
                <span className="hub-tile-desc">
                  {isLandlord ? "Review and resolve resident inquiries" : "Submit issues and track resolution status"}
                </span>
              </div>
            </Link>

            <Link to="/bills" className="bento-card">
              <div className="bento-card-top">
                <div className="bento-icon-wrapper">
                  <Receipt size={20} />
                </div>
                <ArrowUpRight size={18} style={{ opacity: 0.4 }} />
              </div>
              <div>
                <span className="hub-tile-title">Bills & Utilities</span>
                <span className="hub-tile-desc">
                  {isLandlord ? "Issue utility splits and track payments" : "Inspect outstanding dues and mark paid"}
                </span>
              </div>
            </Link>

            <Link to="/profile" className="bento-card">
              <div className="bento-card-top">
                <div className="bento-icon-wrapper">
                  <User size={20} />
                </div>
                <ArrowUpRight size={18} style={{ opacity: 0.4 }} />
              </div>
              <div>
                <span className="hub-tile-title">Account Profile</span>
                <span className="hub-tile-desc">Personal details, contact information, and role</span>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
