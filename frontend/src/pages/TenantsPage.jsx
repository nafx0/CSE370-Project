import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../AuthContext";
import {
  getTenants,
  getUsers,
  getTenantRatings,
  createTenantRating,
  getProperties,
  getTenancies,
} from "../api";
import AppShell from "../components/AppShell";
import { Mail, Phone, Star } from "lucide-react";

export default function TenantsPage() {
  const { user } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [users, setUsers] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [tenancies, setTenancies] = useState([]);
  const [error, setError] = useState("");
  const [ratingFor, setRatingFor] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    loadAll();
  }, []);

  function loadAll() {
    Promise.all([getTenants(), getUsers(), getTenantRatings(), getProperties(), getTenancies()])
      .then(([tenantList, userList, ratingList, propertyList, tenancyList]) => {
        setTenants(tenantList);
        setUsers(userList);
        setRatings(ratingList);
        setProperties(propertyList);
        setTenancies(tenancyList);
      })
      .catch((err) => setError(err.message));
  }

  function getUserInfo(userId) {
    return users.find((u) => u.userId === userId);
  }

  function getRatingsFor(tenantId) {
    return ratings.filter((r) => r.tenantId === tenantId);
  }

  const myPropertyIds = properties
    .filter((p) => p.landlordId === user?.userId)
    .map((p) => p.propertyId);

  function isEligibleToRate(tenantId) {
    return tenancies.some(
      (t) => t.tenantId === tenantId && myPropertyIds.includes(t.propertyId) && t.leaveDate
    );
  }

  const myTenantIds = new Set(
    tenancies
      .filter((t) => myPropertyIds.includes(t.propertyId))
      .map((t) => t.tenantId)
  );
  const visibleTenants = tenants.filter((t) => myTenantIds.has(t.userId));

  async function onSubmitRating(formData) {
    setError("");
    try {
      await createTenantRating({
        landlordId: user.userId,
        tenantId: ratingFor,
        rentTiming: formData.rentTiming,
        flatCondition: formData.flatCondition,
        comment: formData.comment,
      });
      reset();
      setRatingFor(null);
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
            <h1>Tenants</h1>
            <p className="page-subtitle">Residents who currently or previously occupied your properties</p>
          </div>
        </div>

        {error && <p className="banner-error">{error}</p>}

        {visibleTenants.length === 0 ? (
          <p className="empty-state">
            No resident records found. Once a tenant enrolls using your access pass codes, their records will appear here.
          </p>
        ) : (
          <ul className="list">
            {visibleTenants.map((t) => {
              const info = getUserInfo(t.userId);
              const tenantRatings = getRatingsFor(t.userId);
              const eligible = isEligibleToRate(t.userId);

              return (
                <li className="list-row" key={t.userId}>
                  <div className="list-row-main">
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                      <div className="app-user-avatar" style={{ width: "2rem", height: "2rem", fontSize: "0.82rem" }}>
                        {info?.name?.charAt(0)?.toUpperCase() || "T"}
                      </div>
                      <div>
                        <span className="list-row-title" style={{ margin: 0 }}>
                          {info?.name || `Tenant #${t.userId}`}
                        </span>
                      </div>
                    </div>

                    <div className="list-row-meta" style={{ gap: "0.75rem" }}>
                      {info?.email && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                          <Mail size={13} /> {info.email}
                        </span>
                      )}
                      {info?.phone && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                          <Phone size={13} /> {info.phone}
                        </span>
                      )}
                    </div>

                    {tenantRatings.length > 0 && (
                      <ul className="sublist" style={{ marginTop: "1rem" }}>
                        {tenantRatings.map((r) => (
                          <li key={r.ratingId} style={{ fontSize: "0.82rem", color: "var(--ink-soft)" }}>
                            <span style={{ color: "#fff", fontWeight: "500" }}>{r.rentTiming}</span> • {r.flatCondition}
                            {r.comment && <div style={{ color: "var(--ink-faint)", marginTop: "0.2rem" }}>"{r.comment}"</div>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="list-row-actions">
                    {ratingFor !== t.userId ? (
                      eligible ? (
                        <button className="btn btn-ghost btn-sm" onClick={() => setRatingFor(t.userId)}>
                          <Star size={13} />
                          <span>Rate Past Tenant</span>
                        </button>
                      ) : (
                        <span className="form-hint" style={{ fontSize: "0.78rem" }}>
                          Eligible to review after lease completion.
                        </span>
                      )
                    ) : (
                      <form
                        className="form"
                        style={{ width: "100%", marginTop: "0.5rem" }}
                        onSubmit={handleSubmit(onSubmitRating)}
                      >
                        <div className="form-row">
                          <div className="field">
                            <label>Payment Timing</label>
                            <input
                              placeholder="e.g. Always on time"
                              {...register("rentTiming", { required: "Required" })}
                            />
                            {errors.rentTiming && <p className="field-error">{errors.rentTiming.message}</p>}
                          </div>
                          <div className="field">
                            <label>Premises Upkeep</label>
                            <input
                              placeholder="e.g. Clean & maintained"
                              {...register("flatCondition", { required: "Required" })}
                            />
                            {errors.flatCondition && <p className="field-error">{errors.flatCondition.message}</p>}
                          </div>
                        </div>
                        <div className="field">
                          <label>Evaluation Comment</label>
                          <textarea rows={2} placeholder="Optional detailed remark..." {...register("comment")} />
                        </div>
                        <div className="form-actions">
                          <button className="btn btn-sm" type="submit" disabled={isSubmitting}>
                            Save Rating
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => setRatingFor(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AppShell>
  );
}
