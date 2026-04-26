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
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import SearchIcon from "@mui/icons-material/Search";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import CustomerFormDialog from "./CustomerFormDialog";
import BulkUploadDialog from "./BulkUploadDialog";
import styles from "./CustomerTable.module.css";

const COLUMNS = [
  { id: "id", label: "ID", width: 80 },
  { id: "name", label: "Name", width: 200 },
  { id: "nic", label: "NIC", width: 150 },
  { id: "dob", label: "Date of Birth", width: 150 },
  { id: "actions", label: "Actions", width: 100, align: "center" },
];

function CustomerTable({ rows = [], onAdd, onEdit, onDelete }) {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filtered = rows.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.nic.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedRows = filtered.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  function handleAddClick() {
    setEditTarget(null);
    setDialogOpen(true);
  }

  function handleEditClick(row) {
    setEditTarget(row);
    setDialogOpen(true);
  }

  function handleDialogClose() {
    setDialogOpen(false);
    setEditTarget(null);
  }

  function handleDialogSubmit(data) {
    if (editTarget) {
      onEdit?.({ ...editTarget, ...data });
    } else {
      onAdd?.(data);
    }
    handleDialogClose();
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
            setPage(0);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 18, color: "#9ca3af" }} />
              </InputAdornment>
            ),
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
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className={styles.emptyRow}>
                    <PeopleAltOutlinedIcon className={styles.emptyIcon} />
                    <Typography className={styles.emptyText}>
                      {search ? "No customers match your search" : "No customers yet. Click Create to add one."}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRows.map((row) => (
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
          count={filtered.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Create/Edit Dialog */}
      <CustomerFormDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleDialogSubmit}
        initialData={editTarget}
        allCustomers={rows}
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