import { get, post, put, del } from "./apiClient";

export const fetchCustomers = async () => {
  return await get("/customers");
};

export const fetchCustomersPaginated = async (page = 0, size = 10, sortBy = "createdAt", sortDirection = "asc") => {
  return await get(`/customers/paginated?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`);
};

export const createCustomer = async (customerData) => {
  const payload = {
    name: customerData.name,
    dateOfBirth: customerData.dob,
    nicNumber: customerData.nic,
    phones: customerData.phones && customerData.phones.length > 0 ? customerData.phones : [{ mobileNumber: "" }],
    addresses: customerData.addresses && customerData.addresses.length > 0 ? customerData.addresses : [{ addressLine1: "", addressLine2: "", cityName: "" }],
    familyMemberIds: customerData.relatedCustomers || [],
  };

  return await post("/customers", payload);
};

export const updateCustomer = async (id, customerData) => {
  const payload = {
    name: customerData.name,
    dateOfBirth: customerData.dob,
    nicNumber: customerData.nic,
    phones: customerData.phones && customerData.phones.length > 0 ? customerData.phones : [{ mobileNumber: "" }],
    addresses: customerData.addresses && customerData.addresses.length > 0 ? customerData.addresses : [{ addressLine1: "", addressLine2: "", cityName: "" }],
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
