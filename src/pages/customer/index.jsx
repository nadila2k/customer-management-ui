import { useState, useEffect } from "react";
import CustomerTable from "../../components/customer/CustomerTable";
import { fetchCustomersPaginated, createCustomer, updateCustomer, deleteCustomer } from "../../api/customerApi";

function CustomerListPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    loadCustomers();
  }, [page, rowsPerPage]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetchCustomersPaginated(page, rowsPerPage);
      if (response && response.data) {
        // Server side paginated response expects response.data.content
        const items = response.data.content || [];
        setTotalElements(response.data.totalElements || 0);
        
        // Map backend properties to frontend
        const mappedItems = items.map(c => ({
          id: c.id,
          name: c.name,
          nic: c.nicNumber,
          dob: c.dateOfBirth,
          phones: c.phoneNumbers && c.phoneNumbers.length > 0 ? c.phoneNumbers : [{ mobileNumber: "" }],
          addresses: c.addresses && c.addresses.length > 0 ? c.addresses : [{ addressLine1: "", addressLine2: "", cityName: "" }],
          relatedCustomers: c.familyMemberIds || []
        }));

        setCustomers(mappedItems);
      }
    } catch (error) {
      console.error("Failed to load customers", error);
    } finally {
      setLoading(false);
    }
  };

  async function handleAdd(data) {
    try {
      const response = await createCustomer(data);
      if (response && response.status === "SUCCESS") {
        await loadCustomers();
        return { success: true };
      }
    } catch (error) {
      console.error("Failed to create customer", error);
      return { success: false, error: error };
    }
  }

  async function handleEdit(updated) {
    try {
      const response = await updateCustomer(updated.id, updated);
      if (response && response.status === "SUCCESS") {
        await loadCustomers();
        return { success: true };
      }
    } catch (error) {
      console.error("Failed to update customer", error);
      return { success: false, error: error };
    }
  }

  async function handleDelete(id) {
    try {
      await deleteCustomer(id);
      await loadCustomers();
    } catch (error) {
      console.error("Failed to delete customer", error);
    }
  }

  return (
    <CustomerTable
      rows={customers}
      totalElements={totalElements}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={(newPage) => setPage(newPage)}
      onRowsPerPageChange={(newRowsPerPage) => {
        setRowsPerPage(newRowsPerPage);
        setPage(0);
      }}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
      loading={loading}
    />
  );
}

export default CustomerListPage;