import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { getAnnouncements, deleteAnnouncement, getProperties } from "../api";

export default function AnnouncementsPage() {
  const { user } = useAuth();
  const isLandlord = user?.role === "landlord";

  const [announcements, setAnnouncements] = useState([]);
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  function loadAll() {
    Promise.all([getAnnouncements(), getProperties()])
      .then(([announcementList, propertyList]) => {
        setAnnouncements(announcementList);
        setProperties(propertyList);
      })
      .catch((err) => setError(err.message));
  }

  function getPropertyAddress(propertyId) {
    return properties.find((p) => p.propertyId === propertyId)?.address || `Property #${propertyId}`;
  }

  const myPropertyIds = properties
    .filter((p) => p.landlordId === user?.userId)
    .map((p) => p.propertyId);

  const visibleAnnouncements = isLandlord
    ? announcements.filter((a) => myPropertyIds.includes(a.propertyId))
    : announcements;

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
    <div className="page">
      <div className="page-header">
        <div>
          <Link to="/" className="back-link">← Dashboard</Link>
          <h1>Announcements</h1>
          <p className="page-subtitle">
            {isLandlord ? "To post a new one, open the property's page." : "Notices from your landlords."}
          </p>
        </div>
      </div>

      {error && <p className="banner-error">{error}</p>}

      {visibleAnnouncements.length === 0 ? (
        <p className="empty-state">No announcements to show.</p>
      ) : (
        <ul className="list">
          {visibleAnnouncements.map((a) => (
            <li className="list-row" key={`${a.propertyId}-${a.announcementId}`}>
              <div className="list-row-main">
                <span className="list-row-title">{getPropertyAddress(a.propertyId)}</span>
                <div className="list-row-meta">{a.date}</div>
                <div className="list-row-body">{a.message}</div>
              </div>
              {isLandlord && (
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a)}>
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
