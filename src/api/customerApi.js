import { get, post, put, del } from "./apiClient";

export const fetchCustomers = async () => {
  return await get("/customers");
};

export const fetchCustomersPaginated = async (page = 0, size = 10, sortBy = "createdAt", sortDirection = "asc") => {
  return await get(`/customers/paginated?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`);
};

const normalizePhones = (phones) => {
  const list = Array.isArray(phones) ? phones : [];
  const cleaned = list
    .map((p) => ({ mobileNumber: (p?.mobileNumber || "").trim() }))
    .filter((p) => p.mobileNumber.length > 0);
  return cleaned;
};

const normalizeAddresses = (addresses) => {
  const list = Array.isArray(addresses) ? addresses : [];
  const cleaned = list
    .map((a) => ({
      addressLine1: (a?.addressLine1 || "").trim(),
      addressLine2: a?.addressLine2 == null ? "" : String(a.addressLine2).trim(),
      cityName: (a?.cityName || "").trim(),
    }))
    .filter((a) => a.addressLine1 || a.addressLine2 || a.cityName);
  return cleaned;
};

export const createCustomer = async (customerData) => {
  const payload = {
    name: customerData.name,
    dateOfBirth: customerData.dob,
    nicNumber: customerData.nic,
    phones: normalizePhones(customerData.phones),
    addresses: normalizeAddresses(customerData.addresses),
    familyMemberIds: customerData.relatedCustomers || [],
  };

  return await post("/customers", payload);
};

export const updateCustomer = async (id, customerData) => {
  const payload = {
    name: customerData.name,
    dateOfBirth: customerData.dob,
    nicNumber: customerData.nic,
    phones: normalizePhones(customerData.phones),
    addresses: normalizeAddresses(customerData.addresses),
    familyMemberIds: customerData.relatedCustomers || [],
  };

  return await put(`/customers/${id}`, payload);
};

export const deleteCustomer = async (id) => {
  return await del(`/customers/${id}`);
};
export const uploadBulkCustomers = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return await post("/customers/bulk/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const searchCustomers = async (keyword) => {
  const q = encodeURIComponent(keyword ?? "");
  return await get(`/customers/search?keyword=${q}`);
};

export const fetchCustomerById = async (id) => {
  return await get(`/customers/${id}`);
};
