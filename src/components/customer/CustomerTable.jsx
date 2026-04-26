import { useState } from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Tooltip from "@mui/material/Tooltip";
import AddIcon from "@mui/icons-material/Add";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import SearchIcon from "@mui/icons-material/Search";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import CustomerFormDialog from "./CustomerFormDialog";
import BulkUploadDialog from "./BulkUploadDialog";
import styles from "./CustomerTable.module.css";
import { fetchCustomerById } from "../../api/customerApi";

const COLUMNS = [
  { id: "id", label: "ID", width: 80 },
  { id: "name", label: "Name", width: 200 },
  { id: "nic", label: "NIC", width: 150 },
  { id: "dob", label: "Date of Birth", width: 150 },
  { id: "actions", label: "Actions", width: 100, align: "center" },
];

function CustomerTable({ 
  rows = [], 
  totalElements = 0,
  page = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  onAdd, 
  onEdit, 
  onDelete,
  loading 
}) {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [dialogMode, setDialogMode] = useState("create"); // create | edit | view

  const displayRows = rows.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.nic.toLowerCase().includes(search.toLowerCase())
  );

  function handleAddClick() {
    setEditTarget(null);
    setDialogMode("create");
    setDialogOpen(true);
  }

  async function handleViewClick(row) {
    try {
      const res = await fetchCustomerById(row.id);
      if (res && res.status === "SUCCESS" && res.data) {
        const c = res.data;
        const mapped = {
          id: c.id,
          name: c.name,
          nic: c.nicNumber,
          dob: c.dateOfBirth,
          phones: c.phoneNumbers && c.phoneNumbers.length > 0 ? c.phoneNumbers : [{ mobileNumber: "" }],
          addresses: c.addresses && c.addresses.length > 0 ? c.addresses : [{ addressLine1: "", addressLine2: "", cityName: "" }],
          relatedCustomers: (c.familyMembers || []).map((m) => m.id),
          familyMembers: c.familyMembers || [],
        };
        setEditTarget(mapped);
      } else {
        setEditTarget(row);
      }
    } catch (e) {
      console.error("Failed to load customer for view", e);
      setEditTarget(row);
    } finally {
      setDialogMode("view");
      setDialogOpen(true);
    }
  }

  async function handleEditClick(row) {
    try {
      const res = await fetchCustomerById(row.id);
      if (res && res.status === "SUCCESS" && res.data) {
        const c = res.data;
        const mapped = {
          id: c.id,
          name: c.name,
          nic: c.nicNumber,
          dob: c.dateOfBirth,
          phones: c.phoneNumbers && c.phoneNumbers.length > 0 ? c.phoneNumbers : [{ mobileNumber: "" }],
          addresses: c.addresses && c.addresses.length > 0 ? c.addresses : [{ addressLine1: "", addressLine2: "", cityName: "" }],
          relatedCustomers: (c.familyMembers || []).map((m) => m.id),
          familyMembers: c.familyMembers || [],
        };
        setEditTarget(mapped);
      } else {
        setEditTarget(row);
      }
    } catch (e) {
      console.error("Failed to load customer for edit", e);
      setEditTarget(row);
    } finally {
      setDialogMode("edit");
      setDialogOpen(true);
    }
  }

  function handleDialogClose() {
    setDialogOpen(false);
    setEditTarget(null);
    setDialogMode("create");
  }

  async function handleDialogSubmit(data) {
    let result;
    if (editTarget) {
      result = await onEdit?.({ ...editTarget, ...data });
    } else {
      result = await onAdd?.(data);
    }
    
    if (result && result.error) {
      return result;
    }
    
    handleDialogClose();
    return { success: true };
  }

  return (
    <>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className={styles.titleSection}>
          <Typography className={styles.pageTitle}>Customers</Typography>
          <Typography className={styles.pageSubtitle}>
            {rows.length} total customer{rows.length !== 1 ? "s" : ""}
          </Typography>
        </div>
        <div className={styles.actionButtons}>
          <Button
            variant="outlined"
            startIcon={<UploadFileOutlinedIcon />}
            className={styles.bulkBtn}
            onClick={() => setBulkUploadOpen(true)}
          >
            Bulk Upload
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            className={styles.createBtn}
            onClick={handleAddClick}
          >
            Create
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className={styles.searchBar}>
        <TextField
          size="small"
          placeholder="Search by name or NIC..."
          className={styles.searchInput}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            if (onPageChange) onPageChange(0);
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 18, color: "#9ca3af" }} />
                </InputAdornment>
              ),
            },
          }}
        />
      </div>

      {/* Table */}
      <Paper className={styles.tableCard} elevation={0}>
        <TableContainer className={styles.tableContainer}>
          <Table stickyHeader size="medium">
            <TableHead>
              <TableRow>
                {COLUMNS.map((col) => (
                  <TableCell
                    key={col.id}
                    align={col.align || "left"}
                    style={{ width: col.width }}
                  >
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {displayRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className={styles.emptyRow}>
                    <PeopleAltOutlinedIcon className={styles.emptyIcon} />
                    <Typography className={styles.emptyText}>
                      {search ? "No customers match your search" : "No customers yet. Click Create to add one."}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                displayRows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <span className={styles.idCell}>#{row.id}</span>
                    </TableCell>
                    <TableCell>
                      <Typography className={styles.nameCell}>{row.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography className={styles.nicCell}>{row.nic}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography className={styles.nicCell}>{row.dob}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <div className={styles.actionCell}>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            className={styles.editBtn}
                            onClick={() => handleEditClick(row)}
                          >
                            <EditOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View">
                          <IconButton
                            size="small"
                            className={styles.editBtn}
                            onClick={() => handleViewClick(row)}
                          >
                            <VisibilityOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            className={styles.deleteBtn}
                            onClick={() => onDelete?.(row.id)}
                          >
                            <DeleteOutlineOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalElements}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => onPageChange?.(newPage)}
          onRowsPerPageChange={(e) => {
            onRowsPerPageChange?.(parseInt(e.target.value, 10));
          }}
        />
      </Paper>

      {/* Create/Edit Dialog */}
      <CustomerFormDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSubmit={dialogMode === "view" ? undefined : handleDialogSubmit}
        initialData={editTarget}
        allCustomers={rows}
        readOnly={dialogMode === "view"}
      />

      {/* Bulk Upload Dialog */}
      <BulkUploadDialog
        open={bulkUploadOpen}
        onClose={() => setBulkUploadOpen(false)}
      />
    </>
  );
}

export default CustomerTable;