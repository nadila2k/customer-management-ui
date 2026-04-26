import { useState, useEffect } from "react";
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
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import styles from "./CustomerFormDialog.module.css";

const EMPTY = { name: "", nic: "", dob: "", phones: [{ mobileNumber: "" }], addresses: [{ addressLine1: "", addressLine2: "", cityName: "" }], relatedCustomers: [] };

function CustomerFormDialog({ open, onClose, onSubmit, initialData, allCustomers = [] }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const isEdit = Boolean(initialData);

  useEffect(() => {
    if (open) {
      setForm(initialData ? { 
        name: initialData.name, 
        nic: initialData.nic, 
        dob: initialData.dob || "",
        phones: initialData.phones && initialData.phones.length > 0 ? initialData.phones : [{ mobileNumber: "" }],
        addresses: initialData.addresses && initialData.addresses.length > 0 ? initialData.addresses : [{ addressLine1: "", addressLine2: "", cityName: "" }],
        relatedCustomers: initialData.relatedCustomers || []
      } : EMPTY);
      setErrors({});
    }
  }, [open, initialData]);

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
        // error handling for phones and addresses might be complex based on API. Just generic error display for now
        setErrors(newErrors);
      }
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle className={styles.dialogTitle}>
        <Typography className={styles.titleText}>
          {isEdit ? "Edit Customer" : "New Customer"}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent className={styles.dialogContent}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
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
            />
          </Grid>
          <Grid item xs={12} sm={6}>
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
            />
          </Grid>
          <Grid item xs={12} sm={6}>
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
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              multiple
              options={allCustomers.filter((c) => c.id !== initialData?.id)}
              getOptionLabel={(option) => `${option.name} (${option.nic})`}
              value={allCustomers.filter((c) => form.relatedCustomers.includes(c.id))}
              onChange={(e, newValue) => {
                setForm((prev) => ({ ...prev, relatedCustomers: newValue.map((v) => v.id) }));
              }}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField {...params} label="Related Customers" placeholder="Search customer..." size="small" />
              )}
              fullWidth
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />
        
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle1" fontWeight="bold">Phone Numbers</Typography>
          <IconButton onClick={addPhone} color="primary" size="small">
            <AddIcon />
          </IconButton>
        </Box>
        
        {form.phones.map((phone, index) => (
          <Box key={index} display="flex" alignItems="center" gap={2} mb={2}>
            <TextField
              label={`Mobile Number ${index + 1}`}
              value={phone.mobileNumber}
              onChange={(e) => handlePhoneChange(index, e.target.value)}
              fullWidth
              size="small"
              placeholder="e.g. +91991234562"
            />
            {form.phones.length > 1 && (
              <IconButton onClick={() => removePhone(index)} color="error" size="small">
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
        ))}

        <Divider sx={{ my: 2 }} />

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="subtitle1" fontWeight="bold">Addresses</Typography>
          <IconButton onClick={addAddress} color="primary" size="small">
            <AddIcon />
          </IconButton>
        </Box>

        {form.addresses.map((address, index) => (
          <Box key={index} p={2} mb={2} border={1} borderColor="grey.300" borderRadius={2} position="relative">
            {form.addresses.length > 1 && (
              <IconButton 
                onClick={() => removeAddress(index)} 
                color="error" 
                size="small" 
                sx={{ position: "absolute", top: 8, right: 8 }}
              >
                <DeleteIcon />
              </IconButton>
            )}
            <Typography variant="subtitle2" mb={1}>Address {index + 1}</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Address Line 1"
                  value={address.addressLine1}
                  onChange={(e) => handleAddressChange(index, "addressLine1", e.target.value)}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Address Line 2"
                  value={address.addressLine2}
                  onChange={(e) => handleAddressChange(index, "addressLine2", e.target.value)}
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="City"
                  value={address.cityName}
                  onChange={(e) => handleAddressChange(index, "cityName", e.target.value)}
                  fullWidth
                  size="small"
                />
              </Grid>

            </Grid>
          </Box>
        ))}

      </DialogContent>

      <DialogActions className={styles.dialogActions}>
        <Button variant="outlined" onClick={onClose} className={styles.cancelBtn} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} className={styles.submitBtn} disabled={submitting}>
          {submitting ? "Saving..." : (isEdit ? "Save Changes" : "Create")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CustomerFormDialog;