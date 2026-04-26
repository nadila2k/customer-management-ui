import { useState } from "react";
import CustomerTable from "../../components/customer/CustomerTable";

const INITIAL_CUSTOMERS = [
  { id: 1, name: "Amal Perera", nic: "199512345678", dob: "1995-05-15", addressLine1: "123 Main St", addressLine2: "Apt 4B", city: "Colombo", country: "Sri Lanka" },
  { id: 2, name: "Nimal Silva", nic: "198876543210", dob: "1988-10-20", addressLine1: "456 Galle Rd", addressLine2: "", city: "Galle", country: "Sri Lanka" },
  { id: 3, name: "Kamani Fernando", nic: "200023456789", dob: "2000-02-10", addressLine1: "789 Kandy Rd", addressLine2: "Suite 12", city: "Kandy", country: "Sri Lanka" },
];

let nextId = INITIAL_CUSTOMERS.length + 1;

function CustomerListPage() {
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);

  function handleAdd(data) {
    setCustomers((prev) => [...prev, { id: nextId++, ...data }]);
  }

  function handleEdit(updated) {
    setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  }

  function handleDelete(id) {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <CustomerTable
      rows={customers}
      onAdd={handleAdd}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
}

export default CustomerListPage;