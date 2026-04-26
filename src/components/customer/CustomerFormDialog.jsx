import { useState, useEffect, useMemo, useRef } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import Autocomplete from "@mui/material/Autocomplete";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import styles from "./CustomerFormDialog.module.css";
import { searchCustomers } from "../../api/customerApi";
import { toastError } from "../../utils/toast";

const EMPTY = { name: "", nic: "", dob: "", phones: [{ mobileNumber: "" }], addresses: [{ addressLine1: "", addressLine2: "", cityName: "" }], relatedCustomers: [] };

function CustomerFormDialog({ open, onClose, onSubmit, initialData, allCustomers = [], readOnly = false }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [searchOptions, setSearchOptions] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const debounceTimeout = useRef(null);
  const latestSearchRef = useRef("");
  const isEdit = Boolean(initialData);
  const isView = Boolean(readOnly);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(initialData ? { 
        name: initialData.name, 
        nic: initialData.nic, 
        dob: initialData.dob || "",
        phones: initialData.phones && initialData.phones.length > 0 ? initialData.phones : [{ mobileNumber: "" }],
        addresses: initialData.addresses && initialData.addresses.length > 0 ? initialData.addresses : [{ addressLine1: "", addressLine2: "", cityName: "" }],
        relatedCustomers: initialData.familyMembers?.length
          ? initialData.familyMembers.map((m) => m.id)
          : (initialData.relatedCustomers || [])
      } : EMPTY);
      setErrors({});

      if (initialData?.familyMembers?.length) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSearchOptions(initialData.familyMembers);
      }
    }
  }, [open, initialData]);

  useEffect(() => {
    if (!open) return;
    const selected = allCustomers.filter((c) => form.relatedCustomers.includes(c.id));
    if (selected.length === 0) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchOptions((prev) => {
      const byId = new Map(prev.map((c) => [c.id, c]));
      for (const c of selected) byId.set(c.id, c);
      return Array.from(byId.values());
    });
  }, [open, allCustomers, form.relatedCustomers]);

  useEffect(() => {
    return () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function handlePhoneChange(index, value) {
    const newPhones = [...form.phones];
    newPhones[index].mobileNumber = value;
    setForm((prev) => ({ ...prev, phones: newPhones }));
  }

  function addPhone() {
    setForm((prev) => ({ ...prev, phones: [...prev.phones, { mobileNumber: "" }] }));
  }

  function removePhone(index) {
    const newPhones = form.phones.filter((_, i) => i !== index);
    setForm((prev) => ({ ...prev, phones: newPhones }));
  }

  function handleAddressChange(index, field, value) {
    const newAddresses = [...form.addresses];
    newAddresses[index][field] = value;
    setForm((prev) => ({ ...prev, addresses: newAddresses }));
  }

  function addAddress() {
    setForm((prev) => ({ ...prev, addresses: [...prev.addresses, { addressLine1: "", addressLine2: "", cityName: "" }] }));
  }

  function removeAddress(index) {
    const newAddresses = form.addresses.filter((_, i) => i !== index);
    setForm((prev) => ({ ...prev, addresses: newAddresses }));
  }

  function validate() {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.nic.trim()) newErrors.nic = "NIC is required";
    else if (!/^[0-9]{9}[vVxX]$|^[0-9]{12}$/.test(form.nic.trim()))
      newErrors.nic = "Enter a valid NIC (e.g. 123456789V or 200012345678)";
    if (!form.dob) newErrors.dob = "Date of Birth is required";
    return newErrors;
  }

  async function handleSubmit() {
    if (isView) return;
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }
    
    setSubmitting(true);
    const result = await onSubmit(form);
    setSubmitting(false);

    if (result && result.error) {
      const serverErr = result.error;
      if (serverErr.data) {
        const newErrors = {};
        if (serverErr.data.nicNumber) newErrors.nic = serverErr.data.nicNumber;
        if (serverErr.data.dateOfBirth) newErrors.dob = serverErr.data.dateOfBirth;
        if (serverErr.data.name) newErrors.name = serverErr.data.name;
        for (const [k, v] of Object.entries(serverErr.data)) {
          const msg = typeof v === "string" ? v : "";
          if (!msg) continue;
          const normalizedKey = k.replace(/\[(\d+)\]/g, ".$1");
          newErrors[normalizedKey] = msg;
        }
        setErrors(newErrors);
      }
    }
  }

  // Replace the handleSearchChange function:
  const handleSearchChange = (event, newInputValue, reason) => {
    if (reason !== "input") return;

    setSearchInput(newInputValue || "");
  
    // Don't clear existing searchOptions when input is cleared —
    // selected items may only exist there, not in allCustomers
    if (!newInputValue) return;
  
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
  
    debounceTimeout.current = setTimeout(async () => {
      setLoadingSearch(true);
      latestSearchRef.current = newInputValue;
      try {
        const res = await searchCustomers(newInputValue);
        // Ignore out-of-order responses (fast typing)
        if (latestSearchRef.current !== newInputValue) return;

        if (res && res.status === "SUCCESS" && res.data) {
          setSearchOptions(res.data);
        }
      } catch (error) {
        console.error("Search failed", error);
        toastError("Search failed");
      } finally {
        if (latestSearchRef.current === newInputValue) setLoadingSearch(false);
      }
    }, 500);
  };

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const relatedOptions = useMemo(() => {
    const byId = new Map();
    const add = (c) => {
      if (!c || c.id == null) return;
      if (initialData?.id != null && c.id === initialData.id) return;
      byId.set(c.id, c);
    };
    for (const c of searchOptions) add(c);
    const selectedIds = new Set(form.relatedCustomers);
    for (const c of allCustomers) {
      if (selectedIds.has(c.id)) add(c);
    }
    return Array.from(byId.values());
  }, [searchOptions, allCustomers, initialData?.id, form.relatedCustomers]);

  const selectedRelatedCustomers = useMemo(() => {
    const selectedIds = new Set(form.relatedCustomers);
    return relatedOptions.filter((c) => selectedIds.has(c.id));
  }, [form.relatedCustomers, relatedOptions]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className={styles.dialogTitle}>
        <Typography className={styles.titleText}>
          {isView ? "View Customer" : (isEdit ? "Edit Customer" : "New Customer")}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent className={styles.dialogContent}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
            alignItems: "start",
          }}
        >
          <Box>
            <TextField
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              error={Boolean(errors.name)}
              helperText={errors.name}
              fullWidth
              size="small"
              autoFocus
              disabled={isView}
            />
          </Box>
          <Box>
            <TextField
              label="NIC Number"
              name="nic"
              value={form.nic}
              onChange={handleChange}
              error={Boolean(errors.nic)}
              helperText={errors.nic || "e.g. 123456789V or 200012345678"}
              fullWidth
              size="small"
              placeholder="123456789V"
              disabled={isView}
            />
          </Box>
          <Box>
            <TextField
              label="Date of Birth"
              name="dob"
              type="date"
              value={form.dob}
              onChange={handleChange}
              error={Boolean(errors.dob)}
              helperText={errors.dob}
              fullWidth
              size="small"
              slotProps={{ inputLabel: { shrink: true } }}
              disabled={isView}
            />
          </Box>
          <Box sx={{ gridColumn: { xs: "1 / -1", sm: "1 / -1" } }}>
            <Autocomplete
              multiple
              options={relatedOptions}
              loading={loadingSearch}
              getOptionLabel={(option) => `${option.name} (${option.nicNumber || option.nic || ""})`}
              value={selectedRelatedCustomers}
              onChange={(e, newValue) => {
                setForm((prev) => ({ ...prev, relatedCustomers: newValue.map((v) => v.id) }));
                setSearchOptions((prev) => {
                  const byId = new Map(prev.map((c) => [c.id, c]));
                  for (const c of newValue) byId.set(c.id, c);
                  return Array.from(byId.values());
                });
              }}
              inputValue={searchInput}
              onInputChange={handleSearchChange}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              sx={{ width: { xs: "100%", sm: 500 } }}
              disabled={isView}
              renderInput={(params) => (
                <TextField {...params} label="Related Customers" placeholder="Search customer..." size="small" />
              )}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">Phone Numbers</Typography>
          {!isView && (
            <IconButton onClick={addPhone} color="primary" size="small">
              <AddIcon />
            </IconButton>
          )}
        </Box>
        
        {form.phones.map((phone, index) => (
          <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <TextField
              label={`Mobile Number ${index + 1}`}
              value={phone.mobileNumber ?? ""}
              onChange={(e) => handlePhoneChange(index, e.target.value)}
              error={Boolean(errors[`phones.${index}.mobileNumber`])}
              helperText={errors[`phones.${index}.mobileNumber`] || ""}
              size="small"
              placeholder="e.g. +91991234562"
              sx={{ width: 260 }}
              disabled={isView}
            />
            {!isView && (
              <IconButton onClick={() => removePhone(index)} color="error" size="small">
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
        ))}

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">Addresses</Typography>
          {!isView && (
            <IconButton onClick={addAddress} color="primary" size="small">
              <AddIcon />
            </IconButton>
          )}
        </Box>

        {form.addresses.map((address, index) => (
          <Box
            key={index}
            sx={{
              p: 2,
              mb: 4,
              border: 1,
              borderColor: "grey.300",
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Typography variant="subtitle2">Address {index + 1}</Typography>
              {!isView && (
                <IconButton onClick={() => removeAddress(index)} color="error" size="small">
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>

            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, flexWrap: "wrap" }}>
              <TextField
                label="Address Line 1"
                value={address.addressLine1 ?? ""}
                onChange={(e) => handleAddressChange(index, "addressLine1", e.target.value)}
                error={Boolean(errors[`addresses.${index}.addressLine1`])}
                helperText={errors[`addresses.${index}.addressLine1`] || ""}
                size="small"
                sx={{ width: 260 }}
                disabled={isView}
              />
              <TextField
                label="Address Line 2"
                value={address.addressLine2 ?? ""}
                onChange={(e) => handleAddressChange(index, "addressLine2", e.target.value)}
                error={Boolean(errors[`addresses.${index}.addressLine2`])}
                helperText={errors[`addresses.${index}.addressLine2`] || ""}
                size="small"
                sx={{ width: 260 }}
                disabled={isView}
              />
              <TextField
                label="City"
                value={address.cityName ?? ""}
                onChange={(e) => handleAddressChange(index, "cityName", e.target.value)}
                error={Boolean(errors[`addresses.${index}.cityName`])}
                helperText={errors[`addresses.${index}.cityName`] || ""}
                size="small"
                sx={{ width: 200 }}
                disabled={isView}
              />
            </Box>
          </Box>
        ))}

      </DialogContent>

      <DialogActions className={styles.dialogActions}>
        <Button variant="outlined" onClick={onClose} className={styles.cancelBtn} disabled={submitting}>
          {isView ? "Close" : "Cancel"}
        </Button>
        {!isView && (
          <Button variant="contained" onClick={handleSubmit} className={styles.submitBtn} disabled={submitting}>
            {submitting ? "Saving..." : (isEdit ? "Save Changes" : "Create")}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default CustomerFormDialog;