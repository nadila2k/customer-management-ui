import { get, post, put, del } from "./apiClient";

export const fetchCustomers = async () => {
  return await get("/customers");
};

export const fetchCustomersPaginated = async (page = 0, size = 10, sortBy = "createdAt", sortDirection = "asc") => {
  return await get(`/customers/paginated?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`);
};

export const createCustomer = async (customerData) => {
  // Format payload according to the requirement
  const payload = {
    name: customerData.name,
    dateOfBirth: customerData.dob,
    nicNumber: customerData.nic,
    phones: [
      {
        mobileNumber: customerData.mobileNumber,
      },
    ],
    addresses: [
      {
        addressLine1: customerData.addressLine1,
        addressLine2: customerData.addressLine2,
        cityName: customerData.city,
        // The mock success response has countryName, though the payload didn't strictly require it. 
        countryName: customerData.country,
      },
    ],
    familyMemberIds: customerData.relatedCustomers || [],
  };

  return await post("/customers", payload);
};

export const updateCustomer = async (id, customerData) => {
  const payload = {
    name: customerData.name,
    dateOfBirth: customerData.dob,
    nicNumber: customerData.nic,
    phones: [
      {
        mobileNumber: customerData.mobileNumber,
      },
    ],
    addresses: [
      {
        addressLine1: customerData.addressLine1,
        addressLine2: customerData.addressLine2,
        cityName: customerData.city,
        countryName: customerData.country,
      },
    ],
    familyMemberIds: customerData.relatedCustomers || [],
  };

  return await put(`/customers/${id}`, payload);
};

export const deleteCustomer = async (id) => {
  return await del(`/customers/${id}`);
};
