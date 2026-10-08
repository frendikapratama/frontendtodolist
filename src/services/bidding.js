import api from "../api/axios";

/**
 * Get all biddings for a project
 */
export async function getBiddingsByProject(projectId) {
  const res = await api.get(`/biddings/project/${projectId}`);
  return res.data;
}

/**
 * Get single bidding detail by id
 */
export async function getBiddingById(id) {
  const res = await api.get(`/biddings/${id}`);
  return res.data;
}

/**
 * Create a new bidding
 */
export async function createBidding(data) {
  const res = await api.post("/biddings", data);
  return res.data;
}

/**
 * Update general bidding information
 */
export async function updateBidding(id, data) {
  const res = await api.put(`/biddings/${id}`, data);
  return res.data;
}

/**
 * Delete a bidding
 */
export async function deleteBidding(id) {
  const res = await api.delete(`/biddings/${id}`);
  return res.data;
}

/**
 * Update BOQ items attached to bidding
 */
export async function updateBiddingItems(id, boqItemIds) {
  const res = await api.patch(`/biddings/${id}/items`, { boqItemIds });
  return res.data;
}

/**
 * Update participating suppliers for bidding
 */
export async function updateBiddingSuppliers(id, supplierIds) {
  const res = await api.patch(`/biddings/${id}/suppliers`, { supplierIds });
  return res.data;
}

/**
 * Update supplier quotation prices and metadata
 */
export async function updateBiddingQuotations(id, quoteData) {
  const res = await api.patch(`/biddings/${id}/quotations`, quoteData);
  return res.data;
}

/**
 * Update selected supplier winners and reasons
 */
export async function updateBiddingSelections(id, selectionData) {
  const res = await api.patch(`/biddings/${id}/selections`, selectionData);
  return res.data;
}

/**
 * Finalize / finish bidding
 */
export async function finishBidding(id) {
  const res = await api.post(`/biddings/${id}/finish`);
  return res.data;
}
