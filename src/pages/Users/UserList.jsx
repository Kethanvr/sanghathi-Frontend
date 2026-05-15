import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  TableContainer,
  Paper,
  useTheme,
  Avatar,
  MenuItem,
  Menu,
  Typography,
  TablePagination,
  TextField,
  Button,
  Stack,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
} from "@mui/material";
import { useSnackbar } from "notistack";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import api from "../../utils/axios";
import { AuthContext } from "../../context/AuthContext";
import { getAvatarSrc, getAvatarFallbackText } from "../../utils/avatarResolver";
import ConfirmationDialog from "./ConfirmationDialog";

export default function UserList({ onEdit }) {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { user: currentUser } = useContext(AuthContext);
  const isHodView = currentUser?.roleName === "hod";

  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuUser, setMenuUser] = useState(null);
  const [detailUser, setDetailUser] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      const resp = await api.get("/users", {
        params: { limit: 1000, fields: "_id,name,email,roleName,department,sem,mentor" , includeProfiles: true },
      });
      const data = resp?.data?.data || resp?.data || [];
      // If API returns paged object, try common shapes
      if (Array.isArray(data)) setUsers(data);
      else if (Array.isArray(data.users)) setUsers(data.users);
      else if (Array.isArray(resp?.data?.users)) setUsers(resp.data.users);
      else setUsers([]);
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || "Unable to load users", { variant: "error" });
    }
  }, [enqueueSnackbar]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const filtered = users.filter((u) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (u.name || "").toLowerCase().includes(q) || (u.email || "").toLowerCase().includes(q) || (u.usn || "").toLowerCase().includes(q);
  });

  // selection removed: users are view-only in this listing

  const handleOpenMenu = (event, user) => { setAnchorEl(event.currentTarget); setMenuUser(user); };
  const handleCloseMenu = () => { setAnchorEl(null); setMenuUser(null); };

  const handleOpenDetails = (user) => {
    setDetailUser(user);
  };

  const handleCloseDetails = () => {
    setDetailUser(null);
  };

  const canManageUsers = ["admin", "hod", "director"].includes(
    (currentUser?.roleName || "").toLowerCase()
  );

  const handleEditUser = () => {
    if (menuUser && onEdit && menuUser.roleName === "student") {
      onEdit(menuUser);
    }
    handleCloseMenu();
  };

  const handleDeleteUser = () => {
    if (!menuUser) return;
    setDeletingUser(menuUser);
    setDeleteDialogOpen(true);
    handleCloseMenu();
  };

  const confirmDeleteUser = async () => {
    if (!deletingUser?._id) return;

    try {
      await api.delete(`/users/${deletingUser._id}`);
      enqueueSnackbar("User deleted successfully", { variant: "success" });
      if (detailUser?._id === deletingUser._id) {
        handleCloseDetails();
      }
      await fetchUsers();
    } catch (error) {
      enqueueSnackbar(
        error?.response?.data?.message || "Unable to delete user",
        { variant: "error" }
      );
    } finally {
      setDeleteDialogOpen(false);
      setDeletingUser(null);
    }
  };

  return (
    <Card>
        <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6">View Users</Typography>
          <Typography variant="caption" color="text.secondary">Search and manage users</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          {/* Delete control intentionally hidden per request */}
        </Stack>
      </Box>

      <CardContent>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            placeholder="Search users by name, email or USN"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>, endAdornment: searchQuery ? <InputAdornment position="end"><IconButton size="small" onClick={() => setSearchQuery("")}><ClearIcon /></IconButton></InputAdornment> : null }}
          />
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Semester</TableCell>
                <TableCell>Mentor Assigned</TableCell>
                <TableCell>View Details</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((u) => (
                <TableRow key={u._id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar src={getAvatarSrc(u) || undefined}>{!getAvatarSrc(u) ? getAvatarFallbackText(u.name) : null}</Avatar>
                      <Box>
                        <Typography>{u.name || 'N/A'}</Typography>
                        <Typography variant="caption" color="text.secondary">{u.email || 'N/A'}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{u.email || 'N/A'}</TableCell>
                  <TableCell>{u.department || 'N/A'}</TableCell>
                  <TableCell>{u.sem || 'N/A'}</TableCell>
                  <TableCell>{(u.mentor && (u.mentor.name || u.mentor.fullName)) || u.mentorName || 'Unassigned'}</TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined" onClick={() => handleOpenDetails(u)}>
                      View Details
                    </Button>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton onClick={(event) => handleOpenMenu(event, u)} size="small">
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <TablePagination component="div" count={filtered.length} page={page} onPageChange={(e, p) => setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(0); }} />
        </Box>
      </CardContent>

      <Dialog open={Boolean(detailUser)} onClose={handleCloseDetails} fullWidth maxWidth="sm">
        <DialogTitle>User Details</DialogTitle>
        <DialogContent dividers>
          {detailUser ? (
            <Stack spacing={1.25}>
              <Typography><strong>Name:</strong> {detailUser.name || 'N/A'}</Typography>
              <Typography><strong>Email:</strong> {detailUser.email || 'N/A'}</Typography>
              <Typography><strong>Department:</strong> {detailUser.department || 'N/A'}</Typography>
              <Typography><strong>Semester:</strong> {detailUser.sem || 'N/A'}</Typography>
              <Typography><strong>Mentor Assigned:</strong> {(detailUser.mentor && (detailUser.mentor.name || detailUser.mentor.fullName)) || detailUser.mentorName || 'Unassigned'}</Typography>
              <Typography><strong>USN:</strong> {detailUser.usn || 'N/A'}</Typography>
              <Typography><strong>Role:</strong> {detailUser.roleName || 'N/A'}</Typography>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        <MenuItem onClick={() => { handleOpenDetails(menuUser); handleCloseMenu(); }}>
          View Details
        </MenuItem>
        {onEdit && menuUser?.roleName === "student" && (
          <MenuItem onClick={handleEditUser}>
            <EditIcon fontSize="small" sx={{ mr: 1 }} />
            Edit User
          </MenuItem>
        )}
        {canManageUsers && menuUser && menuUser._id !== currentUser?._id && (
          <MenuItem onClick={handleDeleteUser}>
            <DeleteIcon fontSize="small" sx={{ mr: 1 }} color="error" />
            Delete User
          </MenuItem>
        )}
      </Menu>

      <ConfirmationDialog
        title="Delete User"
        message={
          deletingUser
            ? `Are you sure you want to delete ${deletingUser.name || deletingUser.email || "this user"}? This action cannot be undone.`
            : "Are you sure you want to delete this user?"
        }
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeletingUser(null);
        }}
        onConfirm={confirmDeleteUser}
      />
    </Card>
  );
}
