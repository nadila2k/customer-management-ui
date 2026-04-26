import { useState, useRef } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import CircularProgress from "@mui/material/CircularProgress";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import styles from "./BulkUploadDialog.module.css";

function BulkUploadDialog({ open, onClose }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef(null);

  function handleClose() {
    setFile(null);
    setError("");
    setSuccess("");
    setIsUploading(false);
    onClose();
  }

  function handleFileChange(e) {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError("");
      setSuccess("");
    }
  }

  function triggerFileSelect() {
    fileInputRef.current?.click();
  }

  async function handleUpload() {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setIsUploading(true);
    setError("");
    setSuccess("");

    try {
      // Create FormData to send the file
      const formData = new FormData();
      formData.append("file", file);

      // We'll mock the endpoint for now. If you have a real one, replace this URL.
      // const response = await fetch("/api/customers/bulk-upload", {
      //   method: "POST",
      //   body: formData,
      // });
      
      // if (!response.ok) {
      //   throw new Error("Failed to upload the file.");
      // }

      // Simulating a network request delay
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate an error randomly to test error handling (10% chance)
          // if (Math.random() < 0.1) reject(new Error("Network error"));
          resolve();
        }, 1500);
      });

      setSuccess("File uploaded successfully!");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError(err.message || "An error occurred during upload.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle className={styles.dialogTitle}>
        <Typography className={styles.titleText}>Bulk Upload Customers</Typography>
        <IconButton size="small" onClick={handleClose} disabled={isUploading}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent className={styles.dialogContent}>
        <div className={styles.uploadArea} onClick={triggerFileSelect}>
          <CloudUploadOutlinedIcon sx={{ fontSize: 48, color: "#1976d2", mb: 1 }} />
          <Typography>
            Click to browse or drag and drop a file here
          </Typography>
          <Typography variant="body2" sx={{ color: "#6b7280", mt: 0.5 }}>
            Supports .csv, .xlsx
          </Typography>
          
          {file && (
            <Typography className={styles.fileName}>
              Selected: {file.name}
            </Typography>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
          />
        </div>

        {error && <Typography className={styles.errorText}>{error}</Typography>}
        {success && <Typography className={styles.successText}>{success}</Typography>}
      </DialogContent>

      <DialogActions className={styles.dialogActions}>
        <Button variant="outlined" onClick={handleClose} className={styles.cancelBtn} disabled={isUploading}>
          Close
        </Button>
        <Button
          variant="contained"
          onClick={handleUpload}
          className={styles.submitBtn}
          disabled={!file || isUploading}
        >
          {isUploading ? <CircularProgress size={24} color="inherit" /> : "Upload"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default BulkUploadDialog;
