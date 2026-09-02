import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import {
  getProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  getTenancies,
  leaveTenancy,
  getUsers,
  getLandlordRatings,
  recalcBillSharesForProperty
} from "../api";

function statusBadgeClass(status) {
  const s = (status || "").toLowerCase();
  if (s === "available") return "badge-ok";
  if (s === "rented") return "badge-progress";
  return "badge-neutral";
}

export default function PropertiesPage() {
  const { user } = useAuth();
  const isLandlord = user?.role === "landlord";

  const [properties, setProperties] = useState([]);
  const [tenancies, setTenancies] = useState([]);
  const [users, setUsers] = useState([]);
  const [landlordRatings, setLandlordRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const postedDate = watch("postedDate");

  useEffect(() => {
    loadAll();
  }, []);

  function loadAll() {
    setLoading(true);
    Promise.all([getProperties(), getTenancies(), getUsers(), getLandlordRatings()])
      .then(([propertyList, tenancyList, userList, ratingList]) => {
        setProperties(propertyList);
        setTenancies(tenancyList);
        setUsers(userList);
        setLandlordRatings(ratingList);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  function getLandlordName(landlordId) {
    return users.find((u) => u.userId === landlordId)?.name || `Landlord #${landlordId}`;
  }

  function getAvgRating(landlordId) {
    const rs = landlordRatings.filter((r) => r.landlordId === landlordId);
    if (rs.length === 0) return null;
    return (rs.reduce((sum, r) => sum + r.rating, 0) / rs.length).toFixed(1);
  }

  async function onSubmit(formData) {
    setError("");
    const payload = {
      ...formData,
      landlordId: Number(user.userId),
      rent: Number(formData.rent),
    };

    try {
      if (editingId) {
        await updateProperty(editingId, payload);
      } else {
        await createProperty(payload);
      }
      reset();
      setEditingId(null);
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(property) {
    setEditingId(property.propertyId);
    reset({
      address: property.address,
      area: property.area,
      rent: property.rent,
      status: property.status,
      postedDate: property.postedDate,
      expiryDate: property.expiryDate,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    reset({ address: "", area: "", rent: "", status: "", postedDate: "", expiryDate: "" });
  }

  async function handleDelete(id) {
    setError("");
    try {
      await deleteProperty(id);
      loadAll();
    } catch (err) {
      if (err.status === 500) {
        setError("Can't delete — this property is still in use elsewhere.");
      } else {
        setError(err.message);
      }
    }
  }

  async function handleConfirmLeave() {
    setError("");
    try {
      await leaveTenancy(user.userId, myTenancy.propertyId);
      await recalcBillSharesForProperty(myTenancy.propertyId);
      setShowLeaveModal(false);
      loadAll();
    } catch (err) {
      setError(err.message);
      setShowLeaveModal(false);
    }
  }

  const myProperties = isLandlord
    ? properties.filter((p) => p.landlordId === user.userId)
    : properties;

  // Tenant's currently active tenancy, if any
  const myTenancy = !isLandlord
    ? tenancies.find((t) => t.tenantId === user?.userId && !t.leaveDate)
    : null;
  const myEnrolledProperty = myTenancy
    ? properties.find((p) => p.propertyId === myTenancy.propertyId)
    : null;

  // Don't repeat the enrolled property in the general listing below
  const otherProperties = myEnrolledProperty
    ? myProperties.filter((p) => p.propertyId !== myEnrolledProperty.propertyId)
    : myProperties;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <Link to="/" className="back-link">← Dashboard</Link>
          <h1>Properties</h1>
          <p className="page-subtitle">
            {isLandlord ? "Manage your listings" : "Browse listings, enroll with a join code"}
          </p>
        </div>
      </div>

      {error && <p className="banner-error">{error}</p>}

      {myEnrolledProperty && (
        <div className="section">
          <h2>Your property</h2>
          <div className="highlight-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
              <div>
                <Link to={`/properties/${myEnrolledProperty.propertyId}`} className="list-row-title">
                  {myEnrolledProperty.address}
                </Link>
                <div className="list-row-meta">
                  {myEnrolledProperty.area} · {myEnrolledProperty.rent} BDT/month
                </div>
                <div className="list-row-meta">
                  Landlord: {getLandlordName(myEnrolledProperty.landlordId)}
                  {getAvgRating(myEnrolledProperty.landlordId) && (
                    <> · {getAvgRating(myEnrolledProperty.landlordId)}/5</>
                  )}
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowLeaveModal(true)}>
                Leave property
              </button>
            </div>
          </div>
        </div>
      )}

      {showLeaveModal && (
        <div className="modal-overlay" onClick={() => setShowLeaveModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Leave this property?</h2>
            <p>
              You'll lose access to its announcements, complaints, and bills until you enroll
              again. This is required before you can join another property.
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowLeaveModal(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleConfirmLeave}>
                Leave property
              </button>
            </div>
          </div>
        </div>
      )}

      {isLandlord && (
        <div className="section">
          <div className="card">
            <h2>{editingId ? "Edit property" : "Add a property"}</h2>
            <form className="form" onSubmit={handleSubmit(onSubmit)}>
              <div className="field">
                <label>Address</label>
                <input {...register("address", { required: "Address is required" })} />
                {errors.address && <p className="field-error">{errors.address.message}</p>}
              </div>

              <div className="form-row">
                <div className="field">
                  <label>Area</label>
                  <input {...register("area", { required: "Area is required" })} />
                  {errors.area && <p className="field-error">{errors.area.message}</p>}
                </div>

                <div className="field">
                  <label>Rent (BDT/month)</label>
                  <input
                    type="number"
                    {...register("rent", { required: "Rent is required" })}
                  />
                  {errors.rent && <p className="field-error">{errors.rent.message}</p>}
                </div>
              </div>

              <div className="form-row">
                <div className="field">
                  <label>Status</label>
                  <select {...register("status", { required: true })}>
                    <option value="available">Available</option>
                    <option value="rented">Rented</option>
                  </select>
                </div>
                <div />
              </div>

              <div className="form-row">
                <div className="field">
                  <label>Posted date</label>
                  <input type="date" {...register("postedDate", { required: true })} />
                </div>
                <div className="field">
                  <label>Expiry date</label>
                  <input
                    type="date"
                    {...register("expiryDate", {
                      required: true,
                      validate: (value) => {
                        if (!postedDate || !value) return true;
                        return (
                          new Date(value) > new Date(postedDate) ||
                          "Expiry date must be after the posted date."
                        );
                      },
                    })}
                  />
                  {errors.expiryDate && <p className="field-error">{errors.expiryDate.message}</p>}
                </div>
              </div>

              <div className="form-actions">
                <button className="btn" type="submit" disabled={isSubmitting}>
                  {editingId ? "Save changes" : "Add property"}
                </button>
                {editingId && (
                  <button type="button" className="btn btn-ghost" onClick={cancelEdit}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="section">
        <h2>{isLandlord ? "My properties" : "All properties"}</h2>
        {loading ? (
          <p className="loading">Loading…</p>
        ) : otherProperties.length === 0 ? (
          <p className="empty-state">No properties yet.</p>
        ) : (
          <ul className="list">
            {otherProperties.map((p) => (
              <li className="list-row" key={p.propertyId}>
                <div className="list-row-main">
                  <Link to={`/properties/${p.propertyId}`} className="list-row-title">
                    {p.address}
                  </Link>
                  <div className="list-row-meta">
                    {p.area} · {p.rent} BDT/month{" "}
                    <span className={`badge ${statusBadgeClass(p.status)}`}>{p.status}</span>
                  </div>
                  {!isLandlord && (
                    <div className="list-row-meta">
                      Landlord: {getLandlordName(p.landlordId)}
                      {getAvgRating(p.landlordId) && <> · {getAvgRating(p.landlordId)}/5</>}
                    </div>
                  )}
                </div>
                {isLandlord && (
                  <div className="list-row-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => startEdit(p)}>
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(p.propertyId)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
