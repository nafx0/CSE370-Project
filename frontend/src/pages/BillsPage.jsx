import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext";
import {
  getBills,
  createBill,
  deleteBill,
  getBillShares,
  createBillShare,
  payBillShare,
  getProperties,
  getTenancies,
} from "../api";
import AppShell from "../components/AppShell";
import ActionMenu from "../components/ActionMenu";
import { Plus, CreditCard } from "lucide-react";

function isPaid(status) {
  return (status || "").toLowerCase() === "paid";
}

function statusBadgeClass(status) {
  return isPaid(status) ? "badge-ok" : "badge-warn";
}

function paidLabel(status) {
  return isPaid(status) ? "PAID" : "UNPAID";
}

export default function BillsPage() {
  const { user } = useAuth();
  const isLandlord = user?.role === "landlord";

  const [bills, setBills] = useState([]);
  const [shares, setShares] = useState([]);
  const [properties, setProperties] = useState([]);
  const [tenancies, setTenancies] = useState([]);
  const [error, setError] = useState("");
  const [payingShareId, setPayingShareId] = useState(null);
  const [showCreateBill, setShowCreateBill] = useState(false);

  const billForm = useForm();
  const payForm = useForm();

  useEffect(() => {
    loadAll();
  }, []);

  function loadAll() {
    Promise.all([getBills(), getBillShares(), getProperties(), getTenancies()])
      .then(([billList, shareList, propertyList, tenancyList]) => {
        setBills(billList);
        setShares(shareList);
        setProperties(propertyList);
        setTenancies(tenancyList);
      })
      .catch((err) => setError(err.message));
  }

  function getPropertyAddress(propertyId) {
    return properties.find((p) => p.propertyId === propertyId)?.address || `Property #${propertyId}`;
  }

  function getSharesFor(billId) {
    return shares.filter((s) => s.billId === billId);
  }

  const myProperties = properties.filter((p) => p.landlordId === user?.userId);
  const myPropertyIds = myProperties.map((p) => p.propertyId);

  const myEnrolledPropertyIds = tenancies
    .filter((t) => t.tenantId === user?.userId && !t.leaveDate)
    .map((t) => t.propertyId);

  const visibleBills = isLandlord
    ? bills.filter((b) => myPropertyIds.includes(b.propertyId))
    : bills.filter((b) => myEnrolledPropertyIds.includes(b.propertyId));

  const myShares = shares.filter((s) => s.tenantId === user?.userId);

  async function onCreateBill(formData) {
    setError("");
    try {
      const propertyId = Number(formData.propertyId);
      const totalAmount = Number(formData.totalAmount);

      const createdBill = await createBill({
        propertyId,
        type: formData.type,
        totalAmount,
        month: formData.month,
        dueDate: formData.dueDate,
      });

      const enrolledTenantIds = tenancies
        .filter((t) => t.propertyId === propertyId && !t.leaveDate)
        .map((t) => t.tenantId);

      if (enrolledTenantIds.length > 0) {
        const shareAmount =
          Math.round((totalAmount / enrolledTenantIds.length) * 100) / 100;

        await Promise.all(
          enrolledTenantIds.map((tenantId) =>
            createBillShare({ billId: createdBill.billId, tenantId, shareAmount })
          )
        );
      }

      billForm.reset();
      setShowCreateBill(false);
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteBill(id) {
    setError("");
    try {
      await deleteBill(id);
      loadAll();
    } catch (err) {
      if (err.status === 500) {
        setError("Can't delete — this bill still has active share records attached.");
      } else {
        setError(err.message);
      }
    }
  }

  async function onConfirmPay(share, formData) {
    setError("");
    try {
      await payBillShare(share.shareId, formData.transactionId.trim());
      payForm.reset();
      setPayingShareId(null);
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
            <h1>Bills & Utilities</h1>
            <p className="page-subtitle">
              {isLandlord
                ? "Manage utility schedules and view tenant payment statuses"
                : "Your apportioned utility dues and payment confirmations"}
            </p>
          </div>
          {isLandlord && !showCreateBill && (
            <button className="btn" onClick={() => setShowCreateBill(true)}>
              <Plus size={16} />
              <span>Create Bill</span>
            </button>
          )}
        </div>

        {error && <p className="banner-error">{error}</p>}

        {/* Tenant Dues Ledger */}
        {!isLandlord && (
          <div className="section" style={{ marginTop: 0 }}>
            <div className="section-head">
              <h2>Your Individual Dues</h2>
            </div>

            {myShares.length === 0 ? (
              <p className="empty-state">No bills or dues assigned to you yet.</p>
            ) : (
              <ul className="list">
                {myShares.map((s) => (
                  <li className="list-row" key={s.shareId}>
                    <div className="list-row-main">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                        <span className="list-row-title" style={{ margin: 0 }}>
                          Bill #{s.billId} Share
                        </span>
                        <span className={`badge ${statusBadgeClass(s.paidStatus)}`}>
                          {paidLabel(s.paidStatus)}
                        </span>
                      </div>

                      <div style={{ fontSize: "1.25rem", fontWeight: "700", color: "#fff", margin: "0.4rem 0" }}>
                        {s.shareAmount} <span style={{ fontSize: "0.82rem", fontWeight: "400", color: "var(--ink-faint)" }}>BDT</span>
                      </div>

                      {isPaid(s.paidStatus) && s.transactionId && (
                        <div className="list-row-meta">
                          <span>Transaction: {s.transactionId}</span>
                          {s.paidDate && <span>• Paid on {s.paidDate}</span>}
                        </div>
                      )}
                    </div>

                    <div className="list-row-actions" style={{ flexDirection: "column", alignItems: "stretch" }}>
                      {!isPaid(s.paidStatus) && payingShareId !== s.shareId && (
                        <button className="btn btn-sm" onClick={() => setPayingShareId(s.shareId)}>
                          <CreditCard size={14} />
                          <span>Mark as Paid</span>
                        </button>
                      )}

                      {payingShareId === s.shareId && (
                        <form
                          className="form"
                          style={{ width: "100%", marginTop: "0.5rem" }}
                          onSubmit={payForm.handleSubmit((data) => onConfirmPay(s, data))}
                        >
                          <p className="form-hint" style={{ fontSize: "0.78rem" }}>
                            Enter and confirm transaction ID. Once recorded, this action cannot be reversed.
                          </p>

                          <div className="form-row">
                            <div className="field">
                              <label>Transaction ID</label>
                              <input
                                placeholder="TXN-98214"
                                {...payForm.register("transactionId", { required: "Required" })}
                              />
                              {payForm.formState.errors.transactionId && (
                                <p className="field-error">{payForm.formState.errors.transactionId.message}</p>
                              )}
                            </div>

                            <div className="field">
                              <label>Confirm ID</label>
                              <input
                                placeholder="Repeat TXN ID"
                                {...payForm.register("confirmTransactionId", {
                                  required: "Required",
                                  validate: (value, formValues) =>
                                    value === formValues.transactionId || "IDs do not match",
                                })}
                              />
                              {payForm.formState.errors.confirmTransactionId && (
                                <p className="field-error">
                                  {payForm.formState.errors.confirmTransactionId.message}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="form-actions">
                            <button className="btn btn-sm" type="submit">
                              Confirm Settlement
                            </button>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              onClick={() => {
                                setPayingShareId(null);
                                payForm.reset();
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Landlord Create Bill Sheet */}
        {isLandlord && showCreateBill && (
          <div className="section">
            <div className="card">
              <div className="section-head">
                <h2>Create New Utility Bill</h2>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowCreateBill(false)}>
                  Cancel
                </button>
              </div>

              {myProperties.length === 0 ? (
                <p className="empty-state">
                  You have no registered properties. Add a property listing first before creating bills.
                </p>
              ) : (
                <form className="form" onSubmit={billForm.handleSubmit(onCreateBill)}>
                  <div className="form-row">
                    <div className="field">
                      <label>Target Residence</label>
                      <select {...billForm.register("propertyId", { required: true })}>
                        <option value="" disabled>Select a property…</option>
                        {myProperties.map((p) => (
                          <option key={p.propertyId} value={p.propertyId}>{p.address}</option>
                        ))}
                      </select>
                    </div>
                    <div className="field">
                      <label>Bill Type</label>
                      <input
                        placeholder="e.g. Electricity, Water, Gas, Internet"
                        {...billForm.register("type", { required: true })}
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="field">
                      <label>Total Amount (BDT)</label>
                      <input
                        type="number"
                        placeholder="e.g. 4500"
                        {...billForm.register("totalAmount", { required: true })}
                      />
                    </div>
                    <div className="field">
                      <label>Billing Month</label>
                      <input
                        placeholder="e.g. October 2026"
                        {...billForm.register("month", { required: true })}
                      />
                    </div>
                  </div>

                  <div className="field">
                    <label>Due Date</label>
                    <input type="date" {...billForm.register("dueDate", { required: true })} />
                  </div>

                  <div className="form-actions">
                    <button className="btn" type="submit">
                      Issue & Split Bill
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={() => setShowCreateBill(false)}>
                      Cancel
                    </button>
                  </div>
                  <p className="form-hint">
                    The total amount is automatically split equally among all tenants currently residing in this building.
                  </p>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Bills Ledger (Landlords or Overall Property Bills) */}
        <div className="section">
          <div className="section-head">
            <h2>{isLandlord ? "Building Bills & Shares" : "Building Schedules"}</h2>
          </div>

          {visibleBills.length === 0 ? (
            <p className="empty-state">No bills recorded for your properties.</p>
          ) : (
            <ul className="list">
              {visibleBills.map((b) => (
                <li className="list-row" key={b.billId}>
                  <div className="list-row-main">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <span className="badge badge-neutral" style={{ marginBottom: "0.4rem" }}>
                          {b.type}
                        </span>
                        <Link to={`/properties/${b.propertyId}`} className="list-row-title" style={{ display: "block" }}>
                          {getPropertyAddress(b.propertyId)}
                        </Link>
                        <div className="list-row-meta">
                          <span>{b.month}</span>
                          <span>•</span>
                          <span style={{ color: "#fff", fontWeight: "600" }}>{b.totalAmount} BDT</span>
                          <span>•</span>
                          <span>Due {b.dueDate}</span>
                        </div>
                      </div>

                      {isLandlord && (
                        <ActionMenu
                          label="Manage"
                          items={[
                            { label: "Delete Bill", onClick: () => handleDeleteBill(b.billId), danger: true },
                          ]}
                        />
                      )}
                    </div>

                    {isLandlord && getSharesFor(b.billId).length > 0 && (
                      <ul className="sublist" style={{ marginTop: "1rem" }}>
                        {getSharesFor(b.billId).map((s) => (
                          <li key={s.shareId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span>
                              Tenant #{s.tenantId}: {s.shareAmount} BDT
                              {isPaid(s.paidStatus) && s.transactionId ? ` (TXN ${s.transactionId})` : ""}
                            </span>
                            <span className={`badge ${statusBadgeClass(s.paidStatus)}`}>
                              {paidLabel(s.paidStatus)}
                            </span>
                          </li>
                        ))}
                      </ul>
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
