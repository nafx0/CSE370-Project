import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
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

function statusBadgeClass(status) {
  const s = (status || "").toLowerCase();
  if (s === "resolved" || s === "paid" || s === "available" || s === "active") return "badge-ok";
  if (s === "pending" || s === "unpaid") return "badge-warn";
  if (s === "in progress" || s === "rented") return "badge-progress";
  return "badge-neutral";
}

// The backend only sets paidStatus once a share is actually paid — a
// freshly created share comes back as paidStatus: null, which would
// otherwise render as a badge with the right color but no text.
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

  // A tenant can't enroll anywhere new while they still have an active
  // tenancy elsewhere — the server enforces this too, but flagging it here
  // avoids a pointless failed submit.
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
      setNotice("You've joined this property.");
      loadAll();
    } catch (err) {
      // server messages already explain: expired/inactive code, already
      // enrolled here, or an active tenancy elsewhere
      setError(err.message);
    }
  }

  async function handleLeave() {
    setError("");
    setNotice("");
    try {
      await leaveTenancy(user.userId, propertyId);
      setNotice("You've left this property.");
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

  if (!property) return <div className="page"><p className="loading">Loading…</p></div>;

  const visibleComplaints = isOwner
    ? complaints
    : complaints.filter((c) => c.tenantId === user?.userId);

  const myBillShares = billShares.filter(
    (s) => s.tenantId === user?.userId && bills.some((b) => b.billId === s.billId)
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <Link to="/properties" className="back-link">← Properties</Link>
          <h1>{property.address}</h1>
          <p className="page-subtitle">
            {property.area} · {property.rent} BDT/month ·{" "}
            <span className={`badge ${statusBadgeClass(property.status)}`}>{property.status}</span>
          </p>
        </div>
      </div>

      {error && <p className="banner-error">{error}</p>}
      {notice && <p className="badge badge-ok" style={{ marginBottom: "1.5rem" }}>{notice}</p>}

      {!isLandlord && !isEnrolled && (
        <div className="section">
          <div className="card">
            <h2>Enroll in this property</h2>
            {hasActiveTenancyElsewhere && (
              <p className="form-hint">
                You already have an active tenancy elsewhere — leave it from that property's page
                before joining this one.
              </p>
            )}
            <form className="inline-form" onSubmit={joinForm.handleSubmit(onEnroll)}>
              <input
                placeholder="Join code"
                {...joinForm.register("code", { required: true })}
              />
              <button className="btn" type="submit" disabled={hasActiveTenancyElsewhere}>
                Enroll
              </button>
            </form>
          </div>
        </div>
      )}

      {!isLandlord && isEnrolled && (
        <div className="section">
          <div className="card">
            <h2>Your tenancy</h2>
            <p className="form-hint">
              Leaving is required before you can join another property, and before you're
              eligible to rate this landlord.
            </p>
            <button className="btn btn-ghost" onClick={handleLeave}>Leave this property</button>
          </div>
        </div>
      )}

      {isOwner && (
        <div className="section">
          <div className="section-head">
            <h2>Join codes</h2>
            <button className="btn btn-ghost btn-sm" onClick={handleGenerateJoinCode}>
              Generate code
            </button>
          </div>
          <p className="form-hint" style={{ marginBottom: "0.8rem" }}>
            Codes are reusable by any tenant until they expire or you revoke them.
          </p>
          {joinCodes.length === 0 ? (
            <p className="empty-state">No active join codes.</p>
          ) : (
            <ul className="list">
              {joinCodes.map((j) => (
                <li className="list-row" key={j.codeId}>
                  <div className="list-row-main">
                    <span className="list-row-title">{j.codeValue}</span>
                    <div className="list-row-meta">
                      expires {j.expiryDate} ·{" "}
                      <span className={`badge ${statusBadgeClass(j.status)}`}>{j.status}</span>
                    </div>
                  </div>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleRevokeJoinCode(j.codeId)}
                  >
                    Revoke
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {canSeePrivateInfo ? (
        <>
          <div className="section">
            <h2>Announcements</h2>
            {isOwner && (
              <div className="card" style={{ marginBottom: "1rem" }}>
                <form className="inline-form" onSubmit={announcementForm.handleSubmit(onCreateAnnouncement)}>
                  <input
                    placeholder="Post an announcement"
                    style={{ flex: 1, minWidth: "200px" }}
                    {...announcementForm.register("message", { required: true })}
                  />
                  <button className="btn" type="submit">Post</button>
                </form>
              </div>
            )}
            {announcements.length === 0 ? (
              <p className="empty-state">No announcements yet.</p>
            ) : (
              <ul className="list">
                {announcements.map((a) => (
                  <li className="list-row" key={a.announcementId}>
                    <div className="list-row-main">
                      <div className="list-row-meta">{a.date}</div>
                      <div className="list-row-body">{a.message}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="section">
            <h2>Complaints</h2>
            {isEnrolled && (
              <div className="card" style={{ marginBottom: "1rem" }}>
                <form className="inline-form" onSubmit={complaintForm.handleSubmit(onCreateComplaint)}>
                  <input
                    placeholder="Describe the issue"
                    style={{ flex: 1, minWidth: "200px" }}
                    {...complaintForm.register("message", { required: true })}
                  />
                  <button className="btn" type="submit">Submit</button>
                </form>
              </div>
            )}
            {visibleComplaints.length === 0 ? (
              <p className="empty-state">No complaints filed.</p>
            ) : (
              <ul className="list">
                {visibleComplaints.map((c) => (
                  <li className="list-row" key={c.complaintId}>
                    <div className="list-row-main">
                      <div className="list-row-meta">{c.date}</div>
                      <div className="list-row-body">{c.message}</div>
                    </div>
                    <span className={`badge ${statusBadgeClass(c.status)}`}>{c.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="section">
            <h2>Bills</h2>
            {bills.length === 0 ? (
              <p className="empty-state">No bills yet.</p>
            ) : (
              <ul className="list">
                {bills.map((b) => (
                  <li className="list-row" key={b.billId}>
                    <div className="list-row-main">
                      <span className="list-row-title">{b.type}</span>
                      <div className="list-row-meta">
                        {b.month} · {b.totalAmount} BDT · due {b.dueDate}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {isEnrolled && (
              <div className="section">
                <h2>My bill share</h2>
                {myBillShares.length === 0 ? (
                  <p className="empty-state">No shares assigned to you yet.</p>
                ) : (
                  <ul className="list">
                    {myBillShares.map((s) => (
                      <li className="list-row" key={s.shareId}>
                        <div className="list-row-main">Bill #{s.billId}: {s.shareAmount} BDT</div>
                        <span className={`badge ${statusBadgeClass(s.paidStatus)}`}>{paidLabel(s.paidStatus)}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="form-hint">Pay or confirm a share from the Bills page.</p>
              </div>
            )}
          </div>
        </>
      ) : (
        <p className="empty-state">
          Enroll with a join code to see announcements, complaints, and bills for this property.
        </p>
      )}
    </div>
  );
}
