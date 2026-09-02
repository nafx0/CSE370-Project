import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import {
  getTenants,
  getUsers,
  getTenantRatings,
  createTenantRating,
  getProperties,
  getTenancies,
} from "../api";

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

  // Matches the server rule: can only rate a tenant after they've left
  // (leaveDate set) one of this landlord's properties.
  function isEligibleToRate(tenantId) {
    return tenancies.some(
      (t) => t.tenantId === tenantId && myPropertyIds.includes(t.propertyId) && t.leaveDate
    );
  }

  // Only show tenants who currently rent, or have previously rented, one
  // of this landlord's properties — derived from every tenancy on those
  // properties, regardless of leaveDate.
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
    <div className="page">
      <div className="page-header">
        <div>
          <Link to="/" className="back-link">← Dashboard</Link>
          <h1>Tenants</h1>
          <p className="page-subtitle">Tenants who currently or previously rented your properties</p>
        </div>
      </div>

      {error && <p className="banner-error">{error}</p>}

      {visibleTenants.length === 0 ? (
        <p className="empty-state">
          No tenants yet. Once someone enrolls in one of your properties, they'll show up here.
        </p>
      ) : (
        <ul className="list">
          {visibleTenants.map((t) => {
            const info = getUserInfo(t.userId);
            const tenantRatings = getRatingsFor(t.userId);
            const eligible = isEligibleToRate(t.userId);
            return (
              <li className="list-row" key={t.userId} style={{ display: "block" }}>
                <div className="list-row-main">
                  <span className="list-row-title">{info?.name || `User #${t.userId}`}</span>
                  <div className="list-row-meta">{info?.email} · {info?.phone}</div>
                </div>

                {tenantRatings.length > 0 && (
                  <ul className="sublist">
                    {tenantRatings.map((r) => (
                      <li key={r.ratingId}>
                        {r.rentTiming} · {r.flatCondition} — {r.comment}
                      </li>
                    ))}
                  </ul>
                )}

                {ratingFor !== t.userId ? (
                  <div className="form-actions" style={{ marginTop: "0.6rem", alignItems: "center" }}>
                    {eligible ? (
                      <button className="btn btn-ghost btn-sm" onClick={() => setRatingFor(t.userId)}>
                        Rate this tenant
                      </button>
                    ) : (
                      <span className="form-hint" style={{ marginTop: 0 }}>
                        Eligible to rate once they've left one of your properties.
                      </span>
                    )}
                  </div>
                ) : (
                  <form
                    className="form"
                    style={{ marginTop: "0.8rem" }}
                    onSubmit={handleSubmit(onSubmitRating)}
                  >
                    <div className="form-row">
                      <div className="field">
                        <label>Rent timing</label>
                        <input
                          placeholder="e.g. always on time"
                          {...register("rentTiming", { required: "Required" })}
                        />
                        {errors.rentTiming && <p className="field-error">{errors.rentTiming.message}</p>}
                      </div>
                      <div className="field">
                        <label>Flat condition</label>
                        <input
                          placeholder="e.g. kept clean"
                          {...register("flatCondition", { required: "Required" })}
                        />
                        {errors.flatCondition && <p className="field-error">{errors.flatCondition.message}</p>}
                      </div>
                    </div>
                    <div className="field">
                      <label>Comment</label>
                      <textarea rows={2} {...register("comment")} />
                    </div>
                    <div className="form-actions">
                      <button className="btn btn-sm" type="submit" disabled={isSubmitting}>
                        Submit rating
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
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
