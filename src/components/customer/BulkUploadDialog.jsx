import { useState, useRef } from "react";
import { uploadBulkCustomers } from "../../api/customerApi";
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
      const response = await uploadBulkCustomers(file);

      if (response && response.status === "SUCCESS" && response.data) {
        const jobStatus = response.data.status;
        
        if (jobStatus === "COMPLETED") {
          setSuccess(`Upload completed successfully! Processed ${response.data.processedRecords} out of ${response.data.totalRecords} records.`);
        } else if (jobStatus === "COMPLETED_WITH_ERRORS") {
          setError(`Upload completed with errors. Processed ${response.data.processedRecords}/${response.data.totalRecords}, Failed: ${response.data.failedRecords}.`);
        } else if (jobStatus === "FAILED") {
          setError(`Upload failed. ${response.data.errorDetails || ""}`);
        } else if (jobStatus === "PENDING" || jobStatus === "PROCESSING") {
          setSuccess(`Upload started and is currently ${jobStatus}. Job ID: ${response.data.jobId}.`);
        } else {
          setSuccess(response.message || "File uploaded successfully!");
        }
        
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        throw new Error(response?.message || "Failed to upload the file.");
      }
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
