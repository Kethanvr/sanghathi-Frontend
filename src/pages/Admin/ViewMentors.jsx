import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  TablePagination,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ConfirmationDialog from "../Users/ConfirmationDialog";
import UserFormDialog from "../Users/UserFormDialog"; // I will create this or use UserForm in a Dialog
import Page from "../../components/Page";
import api from "../../utils/axios";
import { useSnackbar } from "notistack";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import logger from "../../utils/logger.js";

export default function ViewMentors() {
  const { state: authState } = useContext(AuthContext);
  const currentUser = authState?.user;
  
  // Fallback to localStorage if context not available
  const userDepartment = currentUser?.department || (() => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.department;
      }
    } catch (e) {
      logger.warn("Could not get department from localStorage", e);
    }
    return null;
  })();
  
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [total, setTotal] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchMentors();
  }, [page, rowsPerPage, searchQuery]);

  const fetchMentors = async () => {
    setLoading(true);
    try {
      const params = {
        role: "faculty",
        page: page + 1,
        limit: rowsPerPage,
        fields: "_id,name,email,department,phone,avatar",
        includeProfiles: true,
      };

      if (searchQuery.trim()) {
        // backend expects `q` for free-text search
        params.q = searchQuery.trim();
      }

      const response = await api.get("/users", { params });

      // Response shape can be { status, results, pagination, data: { users } }
      const payload = response.data?.data || response.data;
      const users = (payload && payload.users) || [];
      const totalCount = response.data?.pagination?.total || payload?.total || 0;

      setMentors(users);
      setTotal(totalCount);
    } catch (error) {
      logger.error("Failed to fetch mentors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleClick = (event, mentor) => {
    setSelectedMentor(mentor);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    setOpenEdit(true);
    handleClose();
  };

  const handleDelete = () => {
    setOpenConfirm(true);
    handleClose();
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/users/${selectedMentor._id}`);
      // Also delete faculty profile
      await api.delete(`/faculty/profile/${selectedMentor._id}`).catch(() => {});
      
      enqueueSnackbar(`Successfully deleted mentor ${selectedMentor.name}`, { variant: "success" });
      setMentors((prev) => prev.filter((m) => m._id !== selectedMentor._id));
      setTotal((prev) => prev - 1);
    } catch (error) {
      logger.error("Failed to delete mentor:", error);
      enqueueSnackbar("Failed to delete mentor", { variant: "error" });
    } finally {
      setOpenConfirm(false);
    }
  };

  return (
    <Page title="View Mentors">
      <Container maxWidth="lg" sx={{ px: { xs: 1.5, sm: 3 }, py: { xs: 2, sm: 3 } }}>
        <Stack spacing={3}>
          {/* Header */}
          <Card>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Mentors Directory
                  </Typography>
                  <Chip
                    label={`${userDepartment || "All"}`}
                    color="primary"
                    variant="outlined"
                  />
                </Stack>
                <TextField
                  fullWidth
                  placeholder="Search by name, email, or department..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <Typography variant="body2" color="textSecondary">
                  Total Mentors: <strong>{total}</strong>
                </Typography>
              </Stack>
            </CardContent>
          </Card>

          {/* Mentors Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: (theme) => theme.palette.grey[100] }}>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Phone</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Typography>Loading mentors...</Typography>
                    </TableCell>
                  </TableRow>
                ) : mentors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <Typography color="textSecondary">No mentors found</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  mentors.map((mentor) => (
                    <TableRow key={mentor._id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar 
                            src={mentor.avatar || mentor.photo} 
                            sx={{ width: 32, height: 32, mr: 1.5, bgcolor: 'primary.main' }}
                          >
                            {mentor.name.charAt(0)}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {mentor.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {mentor.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={mentor.department || "N/A"}
                          size="small"
                          variant="filled"
                          sx={{ 
                            borderRadius: 1,
                            backgroundColor: mentor.department === userDepartment 
                              ? (theme) => alpha(theme.palette.primary.main, 0.1) 
                              : (theme) => alpha(theme.palette.grey[500], 0.1),
                            color: mentor.department === userDepartment ? 'primary.main' : 'text.secondary',
                            fontWeight: 600,
                            border: 'none'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{mentor.phone || "N/A"}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={(e) => handleClick(e, mentor)}>
                          <MoreVertIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {mentors.length > 0 && (
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={total}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            )}
          </TableContainer>
        </Stack>
      </Container>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={openConfirm}
        title="Delete Mentor"
        message={`Are you sure you want to delete ${selectedMentor?.name}? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onClose={() => setOpenConfirm(false)}
      />

      {/* Edit Dialog */}
      <UserFormDialog
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        editingUser={selectedMentor}
        onSuccess={fetchMentors}
      />
    </Page>
  );
}
