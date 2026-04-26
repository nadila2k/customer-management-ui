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
import Autocomplete from "@mui/material/Autocomplete";
import styles from "./CustomerFormDialog.module.css";

const EMPTY = { name: "", nic: "", dob: "", addressLine1: "", addressLine2: "", city: "", country: "", relatedCustomers: [] };

function CustomerFormDialog({ open, onClose, onSubmit, initialData, allCustomers = [] }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const isEdit = Boolean(initialData);

  useEffect(() => {
    if (open) {
      setForm(initialData ? { 
        name: initialData.name, 
        nic: initialData.nic, 
        dob: initialData.dob || "",
        addressLine1: initialData.addressLine1 || "",
        addressLine2: initialData.addressLine2 || "",
        city: initialData.city || "",
        country: initialData.country || "",
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

  function validate() {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.nic.trim()) newErrors.nic = "NIC is required";
    else if (!/^[0-9]{9}[vVxX]$|^[0-9]{12}$/.test(form.nic.trim()))
      newErrors.nic = "Enter a valid NIC (e.g. 123456789V or 200012345678)";
    if (!form.dob) newErrors.dob = "Date of Birth is required";
    return newErrors;
  }

  function handleSubmit() {
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }
    onSubmit(form);
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm">
      <DialogTitle className={styles.dialogTitle}>
        <Typography className={styles.titleText}>
          {isEdit ? "Edit Customer" : "New Customer"}
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent className={styles.dialogContent}>
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
        />
        <TextField
          label="Address Line 1"
          name="addressLine1"
          value={form.addressLine1}
          onChange={handleChange}
          fullWidth
          size="small"
        />
        <TextField
          label="Address Line 2"
          name="addressLine2"
          value={form.addressLine2}
          onChange={handleChange}
          fullWidth
          size="small"
        />
        <TextField
          label="City"
          name="city"
          value={form.city}
          onChange={handleChange}
          fullWidth
          size="small"
        />
        <TextField
          label="Country"
          name="country"
          value={form.country}
          onChange={handleChange}
          fullWidth
          size="small"
        />
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
      </DialogContent>

      <DialogActions className={styles.dialogActions}>
        <Button variant="outlined" onClick={onClose} className={styles.cancelBtn}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSubmit} className={styles.submitBtn}>
          {isEdit ? "Save Changes" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CustomerFormDialog;