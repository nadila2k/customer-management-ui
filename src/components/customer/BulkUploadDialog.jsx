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
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import styles from "./BulkUploadDialog.module.css";
import { toastError, toastSuccess, toastWarning } from "../../utils/toast";

function BulkUploadDialog({ open, onClose }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [jobResult, setJobResult] = useState(null);
  const fileInputRef = useRef(null);

  function handleClose() {
    setFile(null);
    setError("");
    setSuccess("");
    setIsUploading(false);
    setJobResult(null);
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

  function formatJobSummary(data) {
    const total = Number.isFinite(data?.totalRecords) ? data.totalRecords : undefined;
    const inserted = Number.isFinite(data?.insertedCount) ? data.insertedCount : 0;
    const updated = Number.isFinite(data?.updatedCount) ? data.updatedCount : 0;
    const failed = Number.isFinite(data?.failedRecords) ? data.failedRecords : 0;
    const processed = inserted + updated + failed;

    const parts = [];
    if (typeof total === "number") parts.push(`Total: ${total}`);
    parts.push(`Inserted: ${inserted}`);
    parts.push(`Updated: ${updated}`);
    parts.push(`Failed: ${failed}`);
    if (processed > 0 && typeof total === "number") parts.push(`Processed: ${processed}/${total}`);

    return parts.join(", ");
  }

  function buildJobResult(data) {
    const total = Number.isFinite(data?.totalRecords) ? data.totalRecords : undefined;
    const inserted = Number.isFinite(data?.insertedCount) ? data.insertedCount : 0;
    const updated = Number.isFinite(data?.updatedCount) ? data.updatedCount : 0;
    const failed = Number.isFinite(data?.failedRecords) ? data.failedRecords : 0;
    const processed = inserted + updated + failed;

    const errors = Array.isArray(data?.errors?.items) ? data.errors.items : [];
    const totalErrors = Number.isFinite(data?.errors?.totalErrors) ? data.errors.totalErrors : errors.length;

    return {
      status: data?.status,
      jobId: data?.jobId,
      total,
      inserted,
      updated,
      failed,
      processed,
      totalErrors,
      errors,
      createdAt: data?.createdAt,
      updatedAt: data?.updatedAt,
    };
  }

  async function handleUpload() {
    if (!file) {
      toastWarning("Please select a file first");
      return;
    }

    setIsUploading(true);
    setError("");
    setSuccess("");

    try {
      const response = await uploadBulkCustomers(file);

      if (response && response.status === "SUCCESS" && response.data) {
        const jobStatus = response.data.status;
        setJobResult(buildJobResult(response.data));
        
        if (jobStatus === "COMPLETED") {
          toastSuccess("Upload completed successfully.");
        } else if (jobStatus === "COMPLETED_WITH_ERRORS") {
          toastWarning("Upload completed with errors.");
        } else if (jobStatus === "FAILED") {
          toastError(`Upload failed. ${response.data.errorDetails || ""}`.trim());
        } else if (jobStatus === "PENDING" || jobStatus === "PROCESSING") {
          toastSuccess(`Upload started and is currently ${jobStatus}. Job ID: ${response.data.jobId}.`);
        } else {
          toastSuccess(response.message || "File uploaded successfully!");
        }
        
        setFile(null);
        setError("");
        setSuccess("");
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        throw new Error(response?.message || "Failed to upload the file.");
      }
    } catch (err) {
      toastError(err.message || "An error occurred during upload.");
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

          <div className={styles.templateRow} onClick={(e) => e.stopPropagation()}>
            <a className={styles.templateLink} href="/sample-customers.csv" download>
              Download sample CSV template
            </a>
          </div>
          
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

        {jobResult && (
          <div className={styles.resultPanel}>
            <Alert
              severity={jobResult.status === "COMPLETED_WITH_ERRORS" ? "warning" : jobResult.status === "COMPLETED" ? "success" : "info"}
              className={styles.resultAlert}
            >
              <div className={styles.resultHeader}>
                <Typography className={styles.resultTitle}>
                  {jobResult.status || "Upload result"}
                </Typography>
                {jobResult.jobId ? (
                  <Typography className={styles.resultSub}>
                    Job ID: {jobResult.jobId}
                  </Typography>
                ) : null}
                <Typography className={styles.resultSub}>
                  {formatJobSummary({
                    totalRecords: jobResult.total,
                    insertedCount: jobResult.inserted,
                    updatedCount: jobResult.updated,
                    failedRecords: jobResult.failed,
                  })}
                </Typography>
              </div>
            </Alert>

            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" className={styles.chipRow}>
              <Chip size="small" label={`Total: ${jobResult.total ?? "-"}`} />
              <Chip size="small" color="success" label={`Inserted: ${jobResult.inserted}`} />
              <Chip size="small" color="info" label={`Updated: ${jobResult.updated}`} />
              <Chip size="small" color={jobResult.failed > 0 ? "warning" : "default"} label={`Failed: ${jobResult.failed}`} />
              {jobResult.totalErrors ? <Chip size="small" color="warning" label={`Errors: ${jobResult.totalErrors}`} /> : null}
            </Stack>

            {jobResult.errors.length > 0 && (
              <div className={styles.errorList}>
                <Typography className={styles.errorListTitle}>
                  Showing first {Math.min(jobResult.errors.length, 10)} error(s)
                </Typography>
                <ul className={styles.errorUl}>
                  {jobResult.errors.slice(0, 10).map((it, idx) => (
                    <li key={`${it.row ?? "row"}-${idx}`} className={styles.errorLi}>
                      <span className={styles.errorRow}>Row {it.row ?? "?"}:</span>{" "}
                      <span className={styles.errorMsg}>{it.message || "Unknown error"}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
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
