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

function isPaid(status) {
  return (status || "").toLowerCase() === "paid";
}

function statusBadgeClass(status) {
  return isPaid(status) ? "badge-ok" : "badge-warn";
}

// The backend only ever sets paidStatus once a share is actually paid —
// a freshly created share comes back as paidStatus: null. Without this
// fallback the badge renders with the right color but no text at all.
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

      // Auto-split the total evenly across tenants currently enrolled in
      // this property. The server sets each share to unpaid by default —
      // we only send the identifying fields and amount.
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
        setError("Can't delete — this bill still has shares assigned to it.");
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
      // e.g. "already paid" or missing transaction ID
      setError(err.message);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <Link to="/" className="back-link">← Dashboard</Link>
          <h1>Bills</h1>
        </div>
      </div>

      {error && <p className="banner-error">{error}</p>}

      {isLandlord && (
        <div className="section">
          <div className="card">
            <h2>Create a bill</h2>
            <form className="form" onSubmit={billForm.handleSubmit(onCreateBill)}>
              <div className="form-row">
                <div className="field">
                  <label>Property</label>
                  <select {...billForm.register("propertyId", { required: true })}>
                    {myProperties.map((p) => (
                      <option key={p.propertyId} value={p.propertyId}>{p.address}</option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Type</label>
                  <input
                    placeholder="e.g. electricity"
                    {...billForm.register("type", { required: true })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="field">
                  <label>Total amount (BDT)</label>
                  <input type="number" {...billForm.register("totalAmount", { required: true })} />
                </div>
                <div className="field">
                  <label>Month</label>
                  <input
                    placeholder="e.g. July 2026"
                    {...billForm.register("month", { required: true })}
                  />
                </div>
              </div>

              <div className="field">
                <label>Due date</label>
                <input type="date" {...billForm.register("dueDate", { required: true })} />
              </div>

              <div className="form-actions">
                <button className="btn" type="submit">Create bill</button>
              </div>
              <p className="form-hint">
                The total is split evenly among tenants currently enrolled in the property.
              </p>
            </form>
          </div>
        </div>
      )}

      <div className="section">
        <h2>{isLandlord ? "My property bills" : "Bills for my properties"}</h2>
        {visibleBills.length === 0 ? (
          <p className="empty-state">No bills yet.</p>
        ) : (
          <ul className="list">
            {visibleBills.map((b) => (
              <li className="list-row" key={b.billId} style={{ display: "block" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div className="list-row-main">
                    <span className="list-row-title">{getPropertyAddress(b.propertyId)}</span>
                    <div className="list-row-meta">
                      {b.type} · {b.month} · {b.totalAmount} BDT · due {b.dueDate}
                    </div>
                  </div>
                  {isLandlord && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteBill(b.billId)}>
                      Delete
                    </button>
                  )}
                </div>

                {isLandlord && getSharesFor(b.billId).length > 0 && (
                  <ul className="sublist">
                    {getSharesFor(b.billId).map((s) => (
                      <li key={s.shareId}>
                        Tenant #{s.tenantId}: {s.shareAmount} BDT —{" "}
                        <span className={`badge ${statusBadgeClass(s.paidStatus)}`}>{paidLabel(s.paidStatus)}</span>
                        {isPaid(s.paidStatus) && s.transactionId ? ` · txn ${s.transactionId}` : ""}
                        {isPaid(s.paidStatus) && s.paidDate ? ` (paid ${s.paidDate})` : ""}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {!isLandlord && (
        <div className="section">
          <h2>My bill shares</h2>
          {myShares.length === 0 ? (
            <p className="empty-state">No shares assigned to you yet.</p>
          ) : (
            <ul className="list">
              {myShares.map((s) => (
                <li className="list-row" key={s.shareId} style={{ display: "block" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div className="list-row-main">
                      Bill #{s.billId}: {s.shareAmount} BDT
                      {isPaid(s.paidStatus) && s.transactionId && (
                        <div className="list-row-meta">
                          txn {s.transactionId} · paid {s.paidDate}
                        </div>
                      )}
                    </div>
                    <div className="list-row-actions">
                      <span className={`badge ${statusBadgeClass(s.paidStatus)}`}>{paidLabel(s.paidStatus)}</span>
                      {!isPaid(s.paidStatus) && payingShareId !== s.shareId && (
                        <button className="btn btn-sm" onClick={() => setPayingShareId(s.shareId)}>
                          Mark as paid
                        </button>
                      )}
                    </div>
                  </div>

                  {payingShareId === s.shareId && (
                    <form
                      className="form"
                      style={{ marginTop: "0.8rem" }}
                      onSubmit={payForm.handleSubmit((data) => onConfirmPay(s, data))}
                    >
                      <p className="form-hint">
                        This can't be undone once confirmed. Enter the transaction ID twice to confirm.
                      </p>
                      <div className="form-row">
                        <div className="field">
                          <label>Transaction ID</label>
                          <input
                            {...payForm.register("transactionId", { required: "Required" })}
                          />
                          {payForm.formState.errors.transactionId && (
                            <p className="field-error">{payForm.formState.errors.transactionId.message}</p>
                          )}
                        </div>
                        <div className="field">
                          <label>Confirm transaction ID</label>
                          <input
                            {...payForm.register("confirmTransactionId", {
                              required: "Required",
                              validate: (value, formValues) =>
                                value === formValues.transactionId || "Doesn't match",
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
                        <button className="btn btn-sm" type="submit">Confirm payment</button>
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
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
