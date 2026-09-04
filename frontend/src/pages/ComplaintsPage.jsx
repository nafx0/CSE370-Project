import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { getComplaints, updateComplaint, deleteComplaint, getProperties } from "../api";
import AppShell from "../components/AppShell";
import { Calendar, Trash2 } from "lucide-react";

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
        propertyId: complaint.propertyId,
        tenantId: complaint.tenantId,
        message: complaint.message,
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
    <AppShell>
      <div className="page">
        <div className="page-header">
          <div>
            <h1>Complaints & Maintenance</h1>
            <p className="page-subtitle">
              {isLandlord
                ? "Incident tickets reported across your properties"
                : "Your reported maintenance inquiries and resolution tracking"}
            </p>
          </div>
          {!isLandlord && (
            <Link to="/properties" className="btn btn-ghost btn-sm">
              <span>Report New on Property</span>
            </Link>
          )}
        </div>

        {error && <p className="banner-error">{error}</p>}

        {visibleComplaints.length === 0 ? (
          <p className="empty-state">
            No incident reports registered. To report an issue, visit your enrolled property page.
          </p>
        ) : (
          <ul className="list">
            {visibleComplaints.map((c) => (
              <li className="list-row" key={`${c.propertyId}-${c.complaintId}`}>
                <div className="list-row-main">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--ink-faint)", fontSize: "0.82rem" }}>
                      <Calendar size={13} /> {c.date}
                    </div>
                    {!isLandlord && (
                      <span className={`badge ${statusBadgeClass(c.status)}`}>{c.status}</span>
                    )}
                  </div>

                  <Link to={`/properties/${c.propertyId}`} className="list-row-title">
                    {getPropertyAddress(c.propertyId)}
                  </Link>

                  <div className="list-row-body">
                    {c.message}
                  </div>
                </div>

                <div className="list-row-actions" style={{ justifyContent: "space-between", alignItems: "center" }}>
                  {isLandlord ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", width: "100%", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ fontSize: "0.82rem", color: "var(--ink-faint)" }}>Status:</span>
                        <select
                          value={c.status}
                          onChange={(e) => handleStatusChange(c, e.target.value)}
                          style={{ padding: "0.35rem 1.8rem 0.35rem 0.65rem", fontSize: "0.82rem" }}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(c)}
                        title="Delete ticket"
                      >
                        <Trash2 size={13} />
                        <span>Delete</span>
                      </button>
                    </div>
                  ) : (
                    <div className="list-row-meta">
                      <span>Ticket #{c.complaintId}</span>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
