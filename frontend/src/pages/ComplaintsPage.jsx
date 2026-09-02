import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { getComplaints, updateComplaint, deleteComplaint, getProperties } from "../api";

const STATUS_OPTIONS = ["pending", "in progress", "resolved"];

function statusBadgeClass(status) {
  if (status === "resolved") return "badge-ok";
  if (status === "pending") return "badge-warn";
  if (status === "in progress") return "badge-progress";
  return "badge-neutral";
}

export default function ComplaintsPage() {
  const { user } = useAuth();
  const isLandlord = user?.role === "landlord";

  const [complaints, setComplaints] = useState([]);
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  function loadAll() {
    Promise.all([getComplaints(), getProperties()])
      .then(([complaintList, propertyList]) => {
        setComplaints(complaintList);
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

  const visibleComplaints = isLandlord
    ? complaints.filter((c) => myPropertyIds.includes(c.propertyId))
    : complaints.filter((c) => c.tenantId === user?.userId);

  async function handleStatusChange(complaint, newStatus) {
    setError("");
    try {
      await updateComplaint(complaint.propertyId, complaint.complaintId, {
        ...complaint,
        status: newStatus,
      });
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(complaint) {
    setError("");
    try {
      await deleteComplaint(complaint.propertyId, complaint.complaintId);
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
          <h1>Complaints</h1>
          <p className="page-subtitle">To file a new one, open the property's page.</p>
        </div>
      </div>

      {error && <p className="banner-error">{error}</p>}

      {visibleComplaints.length === 0 ? (
        <p className="empty-state">No complaints to show.</p>
      ) : (
        <ul className="list">
          {visibleComplaints.map((c) => (
            <li className="list-row" key={`${c.propertyId}-${c.complaintId}`}>
              <div className="list-row-main">
                <span className="list-row-title">{getPropertyAddress(c.propertyId)}</span>
                <div className="list-row-meta">{c.date}</div>
                <div className="list-row-body">{c.message}</div>
              </div>
              <div className="list-row-actions" style={{ flexDirection: "column", alignItems: "flex-end" }}>
                {isLandlord ? (
                  <select
                    value={c.status}
                    onChange={(e) => handleStatusChange(c, e.target.value)}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                ) : (
                  <span className={`badge ${statusBadgeClass(c.status)}`}>{c.status}</span>
                )}
                {isLandlord && (
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c)}>
                    Delete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
