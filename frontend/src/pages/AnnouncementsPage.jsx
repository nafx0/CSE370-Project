import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { getAnnouncements, deleteAnnouncement, getProperties, getTenancies } from "../api";
import AppShell from "../components/AppShell";
import ActionMenu from "../components/ActionMenu";
import { Calendar } from "lucide-react";

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const isLandlord = user?.role === "landlord";

  const [announcements, setAnnouncements] = useState([]);
  const [properties, setProperties] = useState([]);
  const [tenancies, setTenancies] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  function loadAll() {
    Promise.all([getAnnouncements(), getProperties(), getTenancies()])
      .then(([announcementList, propertyList, tenancyList]) => {
        setAnnouncements(announcementList);
        setProperties(propertyList);
        setTenancies(tenancyList);
      })
      .catch((err) => setError(err.message));
  }

  function getPropertyAddress(propertyId) {
    return properties.find((p) => p.propertyId === propertyId)?.address || `Property #${propertyId}`;
  }

  // Landlords see announcements on their own properties.
  // Tenants only see announcements on properties they are/were enrolled in.
  const myPropertyIds = isLandlord
    ? properties.filter((p) => p.landlordId === user?.userId).map((p) => p.propertyId)
    : tenancies.filter((t) => t.tenantId === user?.userId).map((t) => t.propertyId);

  const visibleAnnouncements = announcements.filter((a) =>
    myPropertyIds.includes(a.propertyId)
  );

  async function handleDelete(announcement) {
    setError("");
    try {
      await deleteAnnouncement(announcement.propertyId, announcement.announcementId);
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <AppShell>
      <div className="page">
        <div className="page-header">
          <div>
            <h1>Announcements</h1>
            <p className="page-subtitle">
              {isLandlord
                ? "Broadcast notices posted across your buildings"
                : "Official notices and updates from your landlords"}
            </p>
          </div>
          {isLandlord && (
            <Link to="/properties" className="btn btn-ghost btn-sm">
              <span>Post on Property Page</span>
            </Link>
          )}
        </div>

        {error && <p className="banner-error">{error}</p>}

        {visibleAnnouncements.length === 0 ? (
          <p className="empty-state">
            No announcements found. To publish an announcement, open the specific property page.
          </p>
        ) : (
          <ul className="list">
            {visibleAnnouncements.map((a) => (
              <li className="list-row" key={`${a.propertyId}-${a.announcementId}`}>
                <div className="list-row-main">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--ink-faint)", fontSize: "0.82rem", marginBottom: "0.4rem" }}>
                    <Calendar size={13} /> {a.date}
                  </div>

                  <Link to={`/properties/${a.propertyId}`} className="list-row-title">
                    {getPropertyAddress(a.propertyId)}
                  </Link>

                  <div className="list-row-body">
                    {a.message}
                  </div>
                </div>

                {isLandlord && (
                  <div className="list-row-actions" style={{ justifyContent: "flex-end" }}>
                    <ActionMenu
                      label="Manage"
                      items={[
                        { label: "Delete Notice", onClick: () => handleDelete(a), danger: true },
                      ]}
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
