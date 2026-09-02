import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
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

  // Matches the server rule: can only rate a landlord after leaving
  // (leaveDate set) one of their properties.
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

  // Only show landlords this tenant currently rents from, or has rented
  // from before — derived from every tenancy they've ever had (regardless
  // of leaveDate), joined against which landlord owns each property.
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
    <div className="page">
      <div className="page-header">
        <div>
          <Link to="/" className="back-link">← Dashboard</Link>
          <h1>Landlords</h1>
          <p className="page-subtitle">Landlords you currently or previously rented from</p>
        </div>
      </div>

      {error && <p className="banner-error">{error}</p>}

      {visibleLandlords.length === 0 ? (
        <p className="empty-state">
          You haven't rented from any landlords yet. Enroll in a property to see them here.
        </p>
      ) : (
        <ul className="list">
          {visibleLandlords.map((l) => {
            const info = getUserInfo(l.userId);
            const landlordRatings = getRatingsFor(l.userId);
            const eligible = isEligibleToRate(l.userId);
            const mine = myPastRatingsFor(l.userId);
            return (
              <li className="list-row" key={l.userId} style={{ display: "block" }}>
                <div className="list-row-main">
                  <span className="list-row-title">{info?.name || `User #${l.userId}`}</span>
                  <div className="list-row-meta">{info?.email} · {info?.phone}</div>
                </div>

                {landlordRatings.length > 0 && (
                  <ul className="sublist">
                    {landlordRatings.map((r) => (
                      <li key={r.ratingId}>{r.rating}/5 — {r.comment}</li>
                    ))}
                  </ul>
                )}

                {mine.length > 0 && (
                  <p className="form-hint">You've reviewed this landlord before.</p>
                )}

                {ratingFor !== l.userId ? (
                  <div className="form-actions" style={{ marginTop: "0.6rem", alignItems: "center" }}>
                    {eligible ? (
                      <button className="btn btn-ghost btn-sm" onClick={() => setRatingFor(l.userId)}>
                        Rate this landlord
                      </button>
                    ) : (
                      <span className="form-hint" style={{ marginTop: 0 }}>
                        Eligible to rate after you leave one of their properties.
                      </span>
                    )}
                  </div>
                ) : (
                  <form
                    className="form"
                    style={{ marginTop: "0.8rem" }}
                    onSubmit={handleSubmit(onSubmitRating)}
                  >
                    <div className="field">
                      <label>Rating (1–5)</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        {...register("rating", { required: "Required" })}
                      />
                      {errors.rating && <p className="field-error">{errors.rating.message}</p>}
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
