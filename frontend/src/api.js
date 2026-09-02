const BASE_URL = "http://localhost:8080";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // some endpoints (logout) return no body
  }

  if (!res.ok) {
    const error = new Error(data?.error || `Request failed (${res.status})`);
    error.status = res.status;
    throw error;
  }

  return data;
}

// ---------- Auth ----------
export const signup = (payload) =>
  request("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const login = (email, password) =>
  request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const logout = () => request("/api/auth/logout", { method: "POST" });

export const getMe = () => request("/api/auth/me");

// ---------- Users ----------
export const getUsers = () => request("/api/users");
export const getUser = (id) => request(`/api/users/${id}`);
export const deleteUser = (id) =>
  request(`/api/users/${id}`, { method: "DELETE" });

// ---------- Landlords ----------
export const getLandlords = () => request("/api/landlords");
export const getLandlord = (id) => request(`/api/landlords/${id}`);
export const deleteLandlord = (id) =>
  request(`/api/landlords/${id}`, { method: "DELETE" });

// ---------- Tenants ----------
export const getTenants = () => request("/api/tenants");
export const getTenant = (id) => request(`/api/tenants/${id}`);
export const deleteTenant = (id) =>
  request(`/api/tenants/${id}`, { method: "DELETE" });

// ---------- Properties ----------
// Server now rejects (400) if expiryDate is not strictly after postedDate.
export const getProperties = () => request("/api/properties");
export const getProperty = (id) => request(`/api/properties/${id}`);
export const createProperty = (payload) =>
  request("/api/properties", { method: "POST", body: JSON.stringify(payload) });
export const updateProperty = (id, payload) =>
  request(`/api/properties/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
export const deleteProperty = (id) =>
  request(`/api/properties/${id}`, { method: "DELETE" });

// ---------- Join Codes ----------
// Codes are reusable now (no usedByTenantId, no single-use flip to "used").
// Landlords generate via /generate; tenants redeem via /join, which both
// validates eligibility server-side AND creates the tenancy row for us.
export const getJoinCodes = () => request("/api/joincodes");
export const getJoinCode = (id) => request(`/api/joincodes/${id}`);

export const generateJoinCode = (propertyId) =>
  request("/api/joincodes/generate", {
    method: "POST",
    body: JSON.stringify({ propertyId }),
  });

export const joinProperty = (tenantId, code) =>
  request("/api/joincodes/join", {
    method: "POST",
    body: JSON.stringify({ tenantId, code }),
  });

// Manual create — doc marks this admin/testing only, not the normal landlord flow.
export const createJoinCodeManual = (payload) =>
  request("/api/joincodes", { method: "POST", body: JSON.stringify(payload) });

export const deleteJoinCode = (id) =>
  request(`/api/joincodes/${id}`, { method: "DELETE" });

// ---------- Tenancies ----------
export const getTenancies = () => request("/api/hastenancies");

// Direct create still exists per the doc, but the tenant-facing enrollment
// flow should go through joinProperty() above, which does the same
// eligibility checks and also validates the code.
export const createTenancy = (payload) =>
  request("/api/hastenancies", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const leaveTenancy = (tenantId, propertyId) =>
  request("/api/hastenancies/leave", {
    method: "PUT",
    body: JSON.stringify({ tenantId, propertyId }),
  });

// ---------- Tenant Ratings ----------
// Server now requires the tenant to have LEFT (leaveDate set) one of this
// landlord's properties before POST succeeds — see createTenantRating.
export const getTenantRatings = () => request("/api/ratestenants");
export const getTenantRating = (id) => request(`/api/ratestenants/${id}`);
export const createTenantRating = (payload) =>
  request("/api/ratestenants", {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const deleteTenantRating = (id) =>
  request(`/api/ratestenants/${id}`, { method: "DELETE" });

// ---------- Landlord Ratings ----------
// Server now requires the tenant to have LEFT (leaveDate set) one of this
// landlord's properties before POST succeeds.
export const getLandlordRatings = () => request("/api/rateslandlords");
export const getLandlordRating = (id) => request(`/api/rateslandlords/${id}`);
export const getLandlordRatingsByTenant = (tenantId) =>
  request(`/api/rateslandlords/tenant/${tenantId}`);
export const createLandlordRating = (payload) =>
  request("/api/rateslandlords", {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const deleteLandlordRating = (id) =>
  request(`/api/rateslandlords/${id}`, { method: "DELETE" });

// ---------- Announcements ----------
export const getAnnouncements = () => request("/api/announcements");
export const createAnnouncement = (payload) =>
  request("/api/announcements", {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const updateAnnouncement = (propertyId, announcementId, payload) =>
  request(`/api/announcements/${propertyId}/${announcementId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
export const deleteAnnouncement = (propertyId, announcementId) =>
  request(`/api/announcements/${propertyId}/${announcementId}`, {
    method: "DELETE",
  });

// ---------- Complaints ----------
export const getComplaints = () => request("/api/complaints");
export const createComplaint = (payload) =>
  request("/api/complaints", { method: "POST", body: JSON.stringify(payload) });
export const updateComplaint = (propertyId, complaintId, payload) =>
  request(`/api/complaints/${propertyId}/${complaintId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
export const deleteComplaint = (propertyId, complaintId) =>
  request(`/api/complaints/${propertyId}/${complaintId}`, { method: "DELETE" });

// ---------- Bills ----------
export const getBills = () => request("/api/bills");
export const getBill = (id) => request(`/api/bills/${id}`);
export const createBill = (payload) =>
  request("/api/bills", { method: "POST", body: JSON.stringify(payload) });
export const deleteBill = (id) =>
  request(`/api/bills/${id}`, { method: "DELETE" });

// ---------- Bill Shares ----------
// POST creates an unpaid share (server sets paidStatus) — only send the
// identifying/amount fields. Payment is confirmed separately via the /pay
// endpoint, which requires a transaction ID and cannot be undone.
export const getBillShares = () => request("/api/billshares");
export const getBillShare = (id) => request(`/api/billshares/${id}`);
export const createBillShare = (payload) =>
  request("/api/billshares", { method: "POST", body: JSON.stringify(payload) });
export const payBillShare = (id, transactionId) =>
  request(`/api/billshares/${id}/pay`, {
    method: "PUT",
    body: JSON.stringify({ transactionId }),
  });
export const deleteBillShare = (id) =>
  request(`/api/billshares/${id}`, { method: "DELETE" });


// Recalculates unpaid shares for every bill on a property, splitting the
// total evenly across whoever is currently enrolled (leaveDate === null).
// PAID shares are left alone — no PUT to edit an amount, and deleting a
// paid share would erase the payment record.
export async function recalcBillSharesForProperty(propertyId) {
  const [bills, shares, tenancies] = await Promise.all([
    getBills(),
    getBillShares(),
    getTenancies(),
  ]);

  const billsForProperty = bills.filter((b) => b.propertyId === propertyId);
  const enrolledTenantIds = tenancies
    .filter((t) => t.propertyId === propertyId && !t.leaveDate)
    .map((t) => t.tenantId);

  for (const bill of billsForProperty) {
    const billShares = shares.filter((s) => s.billId === bill.billId);
    const paidShares = billShares.filter(
      (s) => (s.paidStatus || "").toLowerCase() === "paid",
    );
    const unpaidShares = billShares.filter(
      (s) => (s.paidStatus || "").toLowerCase() !== "paid",
    );
    const paidTenantIds = paidShares.map((s) => s.tenantId);

    await Promise.all(unpaidShares.map((s) => deleteBillShare(s.shareId)));

    if (enrolledTenantIds.length === 0) continue;

    const shareAmount =
      Math.round((bill.totalAmount / enrolledTenantIds.length) * 100) / 100;

    const tenantsNeedingShare = enrolledTenantIds.filter(
      (id) => !paidTenantIds.includes(id),
    );

    await Promise.all(
      tenantsNeedingShare.map((tenantId) =>
        createBillShare({ billId: bill.billId, tenantId, shareAmount }),
      ),
    );
  }
}