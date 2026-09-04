import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import AppShell from "../components/AppShell";
import ActionMenu from "../components/ActionMenu";
import Modal from "../components/Modal";
import {
  getProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  getTenancies,
  leaveTenancy,
  getUsers,
  getLandlordRatings,
  recalcBillSharesForProperty,
} from "../api";
import {
  MapPin,
  Plus,
  ArrowRight,
  LogOut,
  AlertTriangle,
} from "lucide-react";
import { ADDRESS_PATTERN, AREA_PATTERN } from "../utils/validation";

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
  const [showAddForm, setShowAddForm] = useState(false);

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
      setShowAddForm(false);
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  function startEdit(property) {
    setEditingId(property.propertyId);
    setShowAddForm(true);
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
    setShowAddForm(false);
    reset({ address: "", area: "", rent: "", status: "", postedDate: "", expiryDate: "" });
  }

  async function handleDelete(id) {
    setError("");
    try {
      await deleteProperty(id);
      loadAll();
    } catch (err) {
      if (err.status === 500) {
        setError("Can't delete — this property is still referenced in other records.");
      } else {
        setError(err.message);
      }
    }
  }

  async function handleConfirmLeave() {
    if (!myTenancy) {
      setShowLeaveModal(false);
      return;
    }
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

  const myTenancy = !isLandlord
    ? tenancies.find((t) => t.tenantId === user?.userId && !t.leaveDate)
    : null;
  const myEnrolledProperty = myTenancy
    ? properties.find((p) => p.propertyId === myTenancy.propertyId)
    : null;

  const otherProperties = myEnrolledProperty
    ? myProperties.filter((p) => p.propertyId !== myEnrolledProperty.propertyId)
    : myProperties;

  return (
    <AppShell>
      <div className="page">
        <div className="page-header">
          <div>
            <h1>Properties</h1>
            <p className="page-subtitle">
              {isLandlord ? "Manage your housing assets and listings" : "Browse available homes and manage your residency"}
            </p>
          </div>
          {isLandlord && !showAddForm && (
            <button className="btn" onClick={() => setShowAddForm(true)}>
              <Plus size={16} />
              <span>Add Property</span>
            </button>
          )}
        </div>

        {error && <p className="banner-error">{error}</p>}

        {/* Tenant Active Residence Banner */}
        {myEnrolledProperty && (
          <div className="section" style={{ marginTop: 0 }}>
            <div className="highlight-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                <div>
                  <span className="badge badge-ok" style={{ marginBottom: "0.6rem" }}>
                    Active Residence
                  </span>
                  <Link to={`/properties/${myEnrolledProperty.propertyId}`} className="list-row-title" style={{ fontSize: "1.3rem", display: "block" }}>
                    {myEnrolledProperty.address}
                  </Link>
                  <div className="list-row-meta" style={{ marginTop: "0.4rem" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                      <MapPin size={14} /> {myEnrolledProperty.area}
                    </span>
                    <span>•</span>
                    <span>{myEnrolledProperty.rent} BDT / month</span>
                    <span>•</span>
                    <span>
                      Landlord: {getLandlordName(myEnrolledProperty.landlordId)}
                      {getAvgRating(myEnrolledProperty.landlordId) && (
                        <span style={{ marginLeft: "0.3rem", color: "var(--warn)" }}>
                          ★ {getAvgRating(myEnrolledProperty.landlordId)}/5
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                  <Link to={`/properties/${myEnrolledProperty.propertyId}`} className="btn btn-ghost btn-sm">
                    <span>Manage Residence</span>
                    <ArrowRight size={14} />
                  </Link>
                  <button className="btn btn-danger btn-sm" onClick={() => setShowLeaveModal(true)}>
                    <LogOut size={14} />
                    <span>Leave</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leave Property Confirmation Modal */}
        <Modal isOpen={showLeaveModal} onClose={() => setShowLeaveModal(false)}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem", color: "#ff6b61" }}>
            <AlertTriangle size={20} />
            <h2 style={{ margin: 0 }}>Leave this property?</h2>
          </div>
          <p>
            You will lose access to active announcements, complaints, and bill schedules for this residence until you enroll again.
          </p>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setShowLeaveModal(false)}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={handleConfirmLeave}>
              Confirm & Leave
            </button>
          </div>
        </Modal>

        {/* Add / Edit Form Card */}
        {isLandlord && showAddForm && (
          <div className="section">
            <div className="card">
              <div className="section-head">
                <h2>{editingId ? "Edit Property" : "Add New Property"}</h2>
                <button type="button" className="btn btn-ghost btn-sm" onClick={cancelEdit}>
                  Cancel
                </button>
              </div>
              <form className="form" onSubmit={handleSubmit(onSubmit)}>
                <div className="field">
                  <label>Full Address</label>
                  <input
                    placeholder="e.g. Flat 4B, House 12, Road 5, Dhanmondi"
                    {...register("address", {
                      required: "Address is required",
                      minLength: {
                        value: 5,
                        message: "Address must be at least 5 characters.",
                      },
                      pattern: {
                        value: ADDRESS_PATTERN,
                        message: "Please use a valid address format.",
                      },
                    })}
                  />
                  {errors.address && <p className="field-error">{errors.address.message}</p>}
                </div>

                <div className="form-row">
                  <div className="field">
                    <label>Area / Neighborhood</label>
                    <input
                      placeholder="e.g. Dhanmondi, Dhaka"
                      {...register("area", {
                        required: "Area is required",
                        minLength: {
                          value: 2,
                          message: "Area must be at least 2 characters.",
                        },
                        pattern: {
                          value: AREA_PATTERN,
                          message: "Use letters, numbers, spaces, and common punctuation only.",
                        },
                      })}
                    />
                    {errors.area && <p className="field-error">{errors.area.message}</p>}
                  </div>

                  <div className="field">
                    <label>Monthly Rent (BDT)</label>
                    <input
                      type="number"
                      min="1"
                      step="100"
                      placeholder="e.g. 28000"
                      {...register("rent", {
                        required: "Rent is required",
                        valueAsNumber: true,
                        min: {
                          value: 1,
                          message: "Rent must be greater than 0.",
                        },
                      })}
                    />
                    {errors.rent && <p className="field-error">{errors.rent.message}</p>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="field">
                    <label>Occupancy Status</label>
                    <select {...register("status", { required: "Status is required" })}>
                      <option value="available">Available</option>
                      <option value="rented">Rented</option>
                    </select>
                    {errors.status && <p className="field-error">{errors.status.message}</p>}
                  </div>
                  <div />
                </div>

                <div className="form-row">
                  <div className="field">
                    <label>Posted Date</label>
                    <input
                      type="date"
                      {...register("postedDate", { required: "Posted date is required" })}
                    />
                    {errors.postedDate && <p className="field-error">{errors.postedDate.message}</p>}
                  </div>
                  <div className="field">
                    <label>Expiry Date</label>
                    <input
                      type="date"
                      {...register("expiryDate", {
                        required: "Expiry date is required",
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
                    {editingId ? "Update Property" : "Save Listing"}
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={cancelEdit}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Listings Section */}
        <div className="section">
          <div className="section-head">
            <h2>{isLandlord ? "Your Listings" : "Available Listings"}</h2>
            <span style={{ fontSize: "0.86rem", color: "var(--ink-faint)" }}>
              {otherProperties.length} {otherProperties.length === 1 ? "listing" : "listings"}
            </span>
          </div>

          {loading ? (
            <p className="loading">Loading properties…</p>
          ) : otherProperties.length === 0 ? (
            <p className="empty-state">No listings currently registered.</p>
          ) : (
            <ul className="list">
              {otherProperties.map((p) => (
                <li className="list-row" key={p.propertyId}>
                  <div className="list-row-main">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.5rem" }}>
                      <span className={`badge ${statusBadgeClass(p.status)}`}>{p.status}</span>
                      <span style={{ fontSize: "0.95rem", fontWeight: "700", color: "#fff" }}>
                        {p.rent} <span style={{ fontSize: "0.75rem", fontWeight: "400", color: "var(--ink-faint)" }}>BDT/mo</span>
                      </span>
                    </div>

                    <Link to={`/properties/${p.propertyId}`} className="list-row-title">
                      {p.address}
                    </Link>

                    <div className="list-row-meta">
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                        <MapPin size={13} /> {p.area}
                      </span>
                    </div>

                    {!isLandlord && (
                      <div className="list-row-meta" style={{ marginTop: "0.4rem" }}>
                        <span>Host: {getLandlordName(p.landlordId)}</span>
                        {getAvgRating(p.landlordId) && (
                          <span style={{ color: "var(--warn)", display: "inline-flex", alignItems: "center", gap: "0.2rem" }}>
                            ★ {getAvgRating(p.landlordId)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="list-row-actions" style={{ justifyContent: "space-between" }}>
                    <Link to={`/properties/${p.propertyId}`} className="btn btn-ghost btn-sm" style={{ padding: "0.35rem 0.75rem" }}>
                      <span>Details</span>
                      <ArrowRight size={13} />
                    </Link>

                    {isLandlord && (
                      <ActionMenu
                        label="Manage"
                        items={[
                          { label: "Edit listing", onClick: () => startEdit(p) },
                          { label: "Delete listing", onClick: () => handleDelete(p.propertyId), danger: true },
                        ]}
                      />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  );
}
