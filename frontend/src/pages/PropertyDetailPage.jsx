import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import AppShell from "../components/AppShell";
import ActionMenu from "../components/ActionMenu";
import Modal from "../components/Modal";
import {
  getProperty,
  getAnnouncements,
  createAnnouncement,
  getComplaints,
  createComplaint,
  getBills,
  getBillShares,
  getJoinCodes,
  generateJoinCode,
  deleteJoinCode,
  joinProperty,
  getTenancies,
  leaveTenancy,
} from "../api";
import {
  ArrowLeft,
  MapPin,
  Key,
  AlertTriangle,
  Megaphone,
  AlertCircle,
  Receipt,
  Plus,
  Calendar,
  Send,
  CheckCircle2,
} from "lucide-react";

function statusBadgeClass(status) {
  const s = (status || "").toLowerCase();
  if (s === "resolved" || s === "paid" || s === "available" || s === "active") return "badge-ok";
  if (s === "pending" || s === "unpaid") return "badge-warn";
  if (s === "in progress" || s === "rented") return "badge-progress";
  return "badge-neutral";
}

function paidLabel(status) {
  return (status || "").toLowerCase() === "paid" ? "PAID" : "UNPAID";
}

export default function PropertyDetailPage() {
  const { id } = useParams();
  const propertyId = Number(id);
  const { user } = useAuth();
  const isLandlord = user?.role === "landlord";

  const [property, setProperty] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [bills, setBills] = useState([]);
  const [billShares, setBillShares] = useState([]);
  const [joinCodes, setJoinCodes] = useState([]);
  const [tenancies, setTenancies] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showVacateModal, setShowVacateModal] = useState(false);

  const announcementForm = useForm();
  const complaintForm = useForm();
  const joinForm = useForm();

  useEffect(() => {
    loadAll();
  }, [id]);

  function loadAll() {
    getProperty(id).then(setProperty).catch((err) => setError(err.message));

    getAnnouncements()
      .then((all) => setAnnouncements(all.filter((a) => a.propertyId === propertyId)))
      .catch((err) => setError(err.message));

    getComplaints()
      .then((all) => setComplaints(all.filter((c) => c.propertyId === propertyId)))
      .catch((err) => setError(err.message));

    getBills()
      .then((all) => setBills(all.filter((b) => b.propertyId === propertyId)))
      .catch((err) => setError(err.message));

    getBillShares().then(setBillShares).catch((err) => setError(err.message));

    getJoinCodes()
      .then((all) => setJoinCodes(all.filter((j) => j.propertyId === propertyId)))
      .catch((err) => setError(err.message));

    getTenancies().then(setTenancies).catch((err) => setError(err.message));
  }

  const isOwner = isLandlord && property?.landlordId === user?.userId;

  const isEnrolled =
    !isLandlord &&
    tenancies.some(
      (t) => t.propertyId === propertyId && t.tenantId === user?.userId && !t.leaveDate
    );

  const hasActiveTenancyElsewhere =
    !isLandlord &&
    !isEnrolled &&
    tenancies.some((t) => t.tenantId === user?.userId && !t.leaveDate);

  const canSeePrivateInfo = isOwner || isEnrolled;

  async function onEnroll(formData) {
    setError("");
    setNotice("");
    try {
      await joinProperty(user.userId, formData.code.trim());
      joinForm.reset();
      setNotice("Successfully joined this property.");
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleLeave() {
    setError("");
    setNotice("");
    try {
      await leaveTenancy(user.userId, propertyId);
      setNotice("You have vacated this property.");
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function onCreateAnnouncement(formData) {
    setError("");
    try {
      await createAnnouncement({
        propertyId,
        landlordId: user.userId,
        message: formData.message,
      });
      announcementForm.reset();
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function onCreateComplaint(formData) {
    setError("");
    try {
      await createComplaint({
        propertyId,
        tenantId: user.userId,
        message: formData.message,
        status: "pending",
      });
      complaintForm.reset();
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleGenerateJoinCode() {
    setError("");
    try {
      await generateJoinCode(propertyId);
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRevokeJoinCode(codeId) {
    setError("");
    try {
      await deleteJoinCode(codeId);
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  if (!property) {
    return (
      <AppShell>
        <div className="page">
          <p className="loading">Loading residence details…</p>
        </div>
      </AppShell>
    );
  }

  const visibleComplaints = isOwner
    ? complaints
    : complaints.filter((c) => c.tenantId === user?.userId);

  const myBillShares = billShares.filter(
    (s) => s.tenantId === user?.userId && bills.some((b) => b.billId === s.billId)
  );

  return (
    <AppShell>
      <div className="page">
        {/* Header Breadcrumb & Actions */}
        <div className="page-header">
          <div>
            <Link to="/properties" className="back-link">
              <ArrowLeft size={14} /> Back to Properties
            </Link>
            <h1>{property.address}</h1>
            <div className="list-row-meta" style={{ fontSize: "0.92rem", gap: "0.6rem" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                <MapPin size={14} /> {property.area}
              </span>
              <span>•</span>
              <span style={{ fontWeight: "600", color: "#fff" }}>{property.rent} BDT / month</span>
              <span>•</span>
              <span className={`badge ${statusBadgeClass(property.status)}`}>{property.status}</span>
            </div>
          </div>

          {!isLandlord && isEnrolled && (
            <button className="btn btn-danger btn-sm" onClick={() => setShowVacateModal(true)}>
              Vacate Residence
            </button>
          )}
        </div>

        {/* Vacate Residence Confirmation Modal */}
        <Modal isOpen={showVacateModal} onClose={() => setShowVacateModal(false)}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem", color: "#ff6b61" }}>
            <AlertTriangle size={20} />
            <h2 style={{ margin: 0 }}>Vacate this residence?</h2>
          </div>
          <p>
            You will lose access to all announcements, incident reports, and billing records for this property. This action cannot be undone until you re-enroll with a valid pass code.
          </p>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setShowVacateModal(false)}>
              Cancel
            </button>
            <button
              className="btn btn-danger"
              onClick={() => {
                setShowVacateModal(false);
                handleLeave();
              }}
            >
              Confirm Vacate
            </button>
          </div>
        </Modal>

        {error && <p className="banner-error">{error}</p>}
        {notice && (
          <div className="badge badge-ok" style={{ marginBottom: "1.5rem", padding: "0.5rem 1rem" }}>
            <CheckCircle2 size={15} /> {notice}
          </div>
        )}

        {/* Unenrolled Tenant Join Code Prompt */}
        {!isLandlord && !isEnrolled && (
          <div className="section">
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <Key size={18} style={{ color: "var(--accent)" }} />
                <h2 style={{ margin: 0 }}>Enroll in this Property</h2>
              </div>
              <p className="form-hint" style={{ marginBottom: "1rem" }}>
                Enter the access pass code issued by the landlord to unlock announcements, incident filing, and billing.
              </p>

              {hasActiveTenancyElsewhere && (
                <p className="field-error" style={{ marginBottom: "0.85rem" }}>
                  You currently have an active tenancy elsewhere. Vacate your current property before enrolling here.
                </p>
              )}

              <form className="inline-form" onSubmit={joinForm.handleSubmit(onEnroll)}>
                <input
                  placeholder="Enter 6-character code"
                  style={{ maxWidth: "260px" }}
                  {...joinForm.register("code", { required: true })}
                />
                <button className="btn" type="submit" disabled={hasActiveTenancyElsewhere}>
                  Enroll Now
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Landlord Join Codes Management */}
        {isOwner && (
          <div className="section">
            <div className="section-head">
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Key size={18} style={{ color: "var(--accent)" }} />
                <h2>Access Pass Codes</h2>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={handleGenerateJoinCode}>
                <Plus size={14} />
                <span>Generate Pass</span>
              </button>
            </div>

            {joinCodes.length === 0 ? (
              <p className="empty-state">No active pass codes generated yet.</p>
            ) : (
              <ul className="list">
                {joinCodes.map((j) => (
                  <li className="list-row" key={j.codeId}>
                    <div className="list-row-main">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                        <span className="list-row-title" style={{ fontFamily: "monospace", letterSpacing: "0.08em", fontSize: "1.1rem" }}>
                          {j.codeValue}
                        </span>
                        <span className={`badge ${statusBadgeClass(j.status)}`}>{j.status}</span>
                      </div>
                      <div className="list-row-meta">
                        <span>Valid until {j.expiryDate}</span>
                      </div>
                    </div>
                    <div className="list-row-actions">
                      <ActionMenu
                        label="Revoke"
                        items={[
                          { label: "Revoke Pass", onClick: () => handleRevokeJoinCode(j.codeId), danger: true },
                        ]}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {canSeePrivateInfo ? (
          <>
            {/* Announcements */}
            <div className="section">
              <div className="section-head">
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Megaphone size={18} style={{ color: "var(--accent)" }} />
                  <h2>Announcements</h2>
                </div>
              </div>

              {isOwner && (
                <div className="card" style={{ marginBottom: "1rem" }}>
                  <form className="inline-form" onSubmit={announcementForm.handleSubmit(onCreateAnnouncement)}>
                    <input
                      placeholder="Broadcast a notice to all tenants in this building..."
                      style={{ flex: 1, minWidth: "240px" }}
                      {...announcementForm.register("message", { required: true })}
                    />
                    <button className="btn btn-sm" type="submit">
                      <Send size={13} />
                      <span>Post Notice</span>
                    </button>
                  </form>
                </div>
              )}

              {announcements.length === 0 ? (
                <p className="empty-state">No notices posted for this property.</p>
              ) : (
                <ul className="list">
                  {announcements.map((a) => (
                    <li className="list-row" key={a.announcementId}>
                      <div className="list-row-main">
                        <div className="list-row-meta" style={{ marginBottom: "0.35rem" }}>
                          <Calendar size={13} /> {a.date}
                        </div>
                        <div className="list-row-body" style={{ marginTop: 0 }}>
                          {a.message}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Complaints */}
            <div className="section">
              <div className="section-head">
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <AlertCircle size={18} style={{ color: "var(--accent)" }} />
                  <h2>Maintenance & Inquiries</h2>
                </div>
              </div>

              {isEnrolled && (
                <div className="card" style={{ marginBottom: "1rem" }}>
                  <form className="inline-form" onSubmit={complaintForm.handleSubmit(onCreateComplaint)}>
                    <input
                      placeholder="Describe the maintenance issue or inquiry..."
                      style={{ flex: 1, minWidth: "240px" }}
                      {...complaintForm.register("message", { required: true })}
                    />
                    <button className="btn btn-sm" type="submit">
                      <Send size={13} />
                      <span>Report Issue</span>
                    </button>
                  </form>
                </div>
              )}

              {visibleComplaints.length === 0 ? (
                <p className="empty-state">No complaints reported.</p>
              ) : (
                <ul className="list">
                  {visibleComplaints.map((c) => (
                    <li className="list-row" key={c.complaintId}>
                      <div className="list-row-main">
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.4rem" }}>
                          <div className="list-row-meta" style={{ margin: 0 }}>
                            <Calendar size={13} /> {c.date}
                          </div>
                          <span className={`badge ${statusBadgeClass(c.status)}`}>{c.status}</span>
                        </div>
                        <div className="list-row-body" style={{ marginTop: 0 }}>
                          {c.message}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Bills Overview */}
            <div className="section">
              <div className="section-head">
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Receipt size={18} style={{ color: "var(--accent)" }} />
                  <h2>Utility Schedules</h2>
                </div>
                <Link to="/bills" className="btn btn-ghost btn-sm">
                  <span>Open Bills Center</span>
                </Link>
              </div>

              {bills.length === 0 ? (
                <p className="empty-state">No utility schedules recorded.</p>
              ) : (
                <ul className="list">
                  {bills.map((b) => (
                    <li className="list-row" key={b.billId}>
                      <div className="list-row-main">
                        <span className="list-row-title">{b.type}</span>
                        <div className="list-row-meta">
                          <span>{b.month}</span>
                          <span>•</span>
                          <span style={{ color: "#fff", fontWeight: "600" }}>{b.totalAmount} BDT</span>
                          <span>•</span>
                          <span>Due {b.dueDate}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {isEnrolled && myBillShares.length > 0 && (
                <div style={{ marginTop: "1.5rem" }}>
                  <h3 style={{ marginBottom: "0.75rem" }}>Your Individual Dues</h3>
                  <ul className="list">
                    {myBillShares.map((s) => (
                      <li className="list-row" key={s.shareId}>
                        <div className="list-row-main">
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span className="list-row-title" style={{ fontSize: "0.95rem" }}>
                              Bill #{s.billId} Share
                            </span>
                            <span className={`badge ${statusBadgeClass(s.paidStatus)}`}>
                              {paidLabel(s.paidStatus)}
                            </span>
                          </div>
                          <div className="list-row-meta" style={{ marginTop: "0.25rem" }}>
                            <span>Amount: {s.shareAmount} BDT</span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="empty-state" style={{ marginTop: "2rem" }}>
            <p style={{ margin: 0 }}>Enroll with an access pass code to view private building notices, incidents, and utility ledgers.</p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
