import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../AuthContext";
import {
  getLandlords,
  getUsers,
  getLandlordRatings,
  getLandlordRatingsByTenant,
  createLandlordRating,
  getProperties,
  getTenancies,
} from "../api";
import AppShell from "../components/AppShell";
import { Mail, Phone, Star } from "lucide-react";

export default function LandlordsPage() {
  const { user } = useAuth();
  const [landlords, setLandlords] = useState([]);
  const [users, setUsers] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [myRatings, setMyRatings] = useState([]);
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
    Promise.all([
      getLandlords(),
      getUsers(),
      getLandlordRatings(),
      getProperties(),
      getTenancies(),
      user ? getLandlordRatingsByTenant(user.userId) : Promise.resolve([]),
    ])
      .then(([landlordList, userList, ratingList, propertyList, tenancyList, myRatingList]) => {
        setLandlords(landlordList);
        setUsers(userList);
        setRatings(ratingList);
        setProperties(propertyList);
        setTenancies(tenancyList);
        setMyRatings(myRatingList);
      })
      .catch((err) => setError(err.message));
  }

  function getUserInfo(userId) {
    return users.find((u) => u.userId === userId);
  }

  function getRatingsFor(landlordId) {
    return ratings.filter((r) => r.landlordId === landlordId);
  }

  function isEligibleToRate(landlordId) {
    const landlordPropertyIds = properties
      .filter((p) => p.landlordId === landlordId)
      .map((p) => p.propertyId);
    return tenancies.some(
      (t) =>
        t.tenantId === user?.userId &&
        landlordPropertyIds.includes(t.propertyId) &&
        t.leaveDate
    );
  }

  function myPastRatingsFor(landlordId) {
    return myRatings.filter((r) => r.landlordId === landlordId);
  }

  const myPropertyIdsEver = tenancies
    .filter((t) => t.tenantId === user?.userId)
    .map((t) => t.propertyId);
  const myLandlordIds = new Set(
    properties
      .filter((p) => myPropertyIdsEver.includes(p.propertyId))
      .map((p) => p.landlordId)
  );
  const visibleLandlords = landlords.filter((l) => myLandlordIds.has(l.userId));

  async function onSubmitRating(formData) {
    setError("");
    try {
      await createLandlordRating({
        tenantId: user.userId,
        landlordId: ratingFor,
        rating: Number(formData.rating),
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
            <h1>Landlords</h1>
            <p className="page-subtitle">Property managers you currently or previously leased from</p>
          </div>
        </div>

        {error && <p className="banner-error">{error}</p>}

        {visibleLandlords.length === 0 ? (
          <p className="empty-state">
            No landlord associations yet. Enroll in a residence to see your landlord contacts here.
          </p>
        ) : (
          <ul className="list">
            {visibleLandlords.map((l) => {
              const info = getUserInfo(l.userId);
              const landlordRatings = getRatingsFor(l.userId);
              const eligible = isEligibleToRate(l.userId);
              const mine = myPastRatingsFor(l.userId);

              return (
                <li className="list-row" key={l.userId}>
                  <div className="list-row-main">
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                      <div className="app-user-avatar" style={{ width: "2rem", height: "2rem", fontSize: "0.82rem", background: "linear-gradient(135deg, #30d158 0%, #0a84ff 100%)" }}>
                        {info?.name?.charAt(0)?.toUpperCase() || "L"}
                      </div>
                      <div>
                        <span className="list-row-title" style={{ margin: 0 }}>
                          {info?.name || `Host #${l.userId}`}
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

                    {landlordRatings.length > 0 && (
                      <ul className="sublist" style={{ marginTop: "1rem" }}>
                        {landlordRatings.map((r) => (
                          <li key={r.ratingId} style={{ fontSize: "0.82rem", color: "var(--ink-soft)" }}>
                            <span style={{ color: "var(--warn)", fontWeight: "600" }}>★ {r.rating}/5</span>
                            {r.comment && <span> — "{r.comment}"</span>}
                          </li>
                        ))}
                      </ul>
                    )}

                    {mine.length > 0 && (
                      <p className="form-hint" style={{ marginTop: "0.6rem" }}>
                        You have previously reviewed this property host.
                      </p>
                    )}
                  </div>

                  <div className="list-row-actions">
                    {ratingFor !== l.userId ? (
                      eligible ? (
                        <button className="btn btn-ghost btn-sm" onClick={() => setRatingFor(l.userId)}>
                          <Star size={13} />
                          <span>Rate Landlord</span>
                        </button>
                      ) : (
                        <span className="form-hint" style={{ fontSize: "0.78rem" }}>
                          Eligible to review after completing your tenancy.
                        </span>
                      )
                    ) : (
                      <form
                        className="form"
                        style={{ width: "100%", marginTop: "0.5rem" }}
                        onSubmit={handleSubmit(onSubmitRating)}
                      >
                        <div className="field">
                          <label>Score (1 to 5 Stars)</label>
                          <input
                            type="number"
                            min="1"
                            max="5"
                            placeholder="5"
                            {...register("rating", { required: "Required" })}
                          />
                          {errors.rating && <p className="field-error">{errors.rating.message}</p>}
                        </div>

                        <div className="field">
                          <label>Written Review</label>
                          <textarea rows={2} placeholder="Share your experience..." {...register("comment")} />
                        </div>

                        <div className="form-actions">
                          <button className="btn btn-sm" type="submit" disabled={isSubmitting}>
                            Post Review
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
