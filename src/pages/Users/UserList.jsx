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
  Select,
  TextField,
  Button,
  Checkbox,
  Stack,
  Chip,
  Card,
  CardContent,
  Grid,
  InputAdornment,
} from "@mui/material";
import { useSnackbar } from "notistack";
import DeleteIcon from "@mui/icons-material/Delete";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

import api from "../../utils/axios";
import { AuthContext } from "../../context/AuthContext";
import { getAvatarSrc, getAvatarFallbackText } from "../../utils/avatarResolver";

export default function UserList({ onEdit }) {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { user: currentUser } = useContext(AuthContext);
  const isHodView = currentUser?.roleName === "hod";

  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuUser, setMenuUser] = useState(null);

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

  const handleSelectUser = (id) => {
    setSelectedUsers((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSelectAll = (ev) => {
    if (ev.target.checked) setSelectedUsers(filtered.map((u) => u._id));
    else setSelectedUsers([]);
  };

  const handleOpenMenu = (event, user) => { setAnchorEl(event.currentTarget); setMenuUser(user); };
  const handleCloseMenu = () => { setAnchorEl(null); setMenuUser(null); };

  const handleDeleteSelected = async () => {
    if (!selectedUsers.length) return;
    try {
      await Promise.all(selectedUsers.map(id => api.delete(`/users/${id}`)));
      enqueueSnackbar(`Deleted ${selectedUsers.length} user(s)`, { variant: "success" });
      setSelectedUsers([]);
      fetchUsers();
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || "Unable to delete users", { variant: "error" });
    }
  };

  const handleDeleteOne = async (user) => {
    try {
      await api.delete(`/users/${user._id}`);
      enqueueSnackbar(`Deleted ${user.name || 'user'}`, { variant: "success" });
      fetchUsers();
    } catch (err) {
      enqueueSnackbar(err?.response?.data?.message || "Unable to delete user", { variant: "error" });
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
          <Button variant="contained" color="error" disabled={!selectedUsers.length} onClick={handleDeleteSelected} startIcon={<DeleteIcon />}>
            Delete Selected ({selectedUsers.length})
          </Button>
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
                <TableCell padding="checkbox"><Checkbox checked={selectedUsers.length > 0 && selectedUsers.length === filtered.length} indeterminate={selectedUsers.length > 0 && selectedUsers.length < filtered.length} onChange={handleSelectAll} /></TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Semester</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((u) => (
                <TableRow key={u._id} hover>
                  <TableCell padding="checkbox"><Checkbox checked={selectedUsers.includes(u._id)} onChange={() => handleSelectUser(u._id)} /></TableCell>
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
                  <TableCell>{u.roleName || 'N/A'}</TableCell>
                  <TableCell>{u.department || 'N/A'}</TableCell>
                  <TableCell>{u.sem || 'N/A'}</TableCell>
                  <TableCell>
                    <IconButton onClick={(e) => handleOpenMenu(e, u)}><MoreVertIcon /></IconButton>
                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl) && menuUser?._id === u._id} onClose={handleCloseMenu}>
                      <MenuItem onClick={() => { handleCloseMenu(); if (onEdit) onEdit(u); }}>Edit</MenuItem>
                      <MenuItem onClick={() => { handleCloseMenu(); handleDeleteOne(u); }}>Delete</MenuItem>
                    </Menu>
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
    </Card>
  );
}
