import React, { useState, useCallback, useEffect } from "react";
import {
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  useTheme,
  Typography,
  TablePagination,
  TextField,
  Button,
  Stack,
  Card,
  CardContent,
  InputAdornment,
  alpha,
  Chip,
  Avatar,
  Select,
  MenuItem,
} from "@mui/material";
import { useSnackbar } from "notistack";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";
import FilterListIcon from "@mui/icons-material/FilterList";
import { useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Page from "../../components/Page";
import api from "../../utils/axios";
import { AuthContext } from "../../context/AuthContext";
import { getAvatarSrc, getAvatarFallbackText } from "../../utils/avatarResolver";

import logger from "../../utils/logger.js";
function DirectorViewMentors() {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const routePrefix =
    user?.roleName === "hod" || location.pathname.startsWith("/hod")
      ? "/hod"
      : "/director";
  const [mentors, setMentors] = useState([]);
  const [page, setPage] = useState(0);
  const rowsPerPageOptions = [10, 20, 25];
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);
  const { enqueueSnackbar } = useSnackbar();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const tableHeaderColor = isLight ? theme.palette.primary.main : theme.palette.info.main;

  const getAllMentors = useCallback(async () => {
    try {
      const response = await api.get("/mentors/mentors-with-mentees", {
        params: {
          page: 1,
          limit: 500,
        },
      });

      if (response.data?.mentors) {
        setMentors(response.data.mentors);
        logger.info("Fetched mentors with mentee counts:", response.data.mentors);
      } else {
        throw new Error("Error fetching mentors");
      }
    } catch (error) {
      logger.info(error);
      enqueueSnackbar("Error fetching mentors", { variant: "error" });
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    getAllMentors();
  }, [getAllMentors]);

  const handleViewMentees = (mentor) => {
    navigate(`${routePrefix}/mentor/${mentor._id}/mentees`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setFilterDepartment("all");
  };

  const filteredMentors = mentors.filter((mentor) => {
    const matchesSearch = mentor.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mentor.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = filterDepartment === "all" || mentor.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const uniqueDepartments = ["all", ...new Set(mentors.map(m => m.department).filter(Boolean))];

  const paginatedMentors = filteredMentors.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Page title="View All Mentors">
      <Card>
        <Box 
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 3,
            py: 2
          }}
        >
          <Typography variant="h6" component="h1" sx={{ fontWeight: 500 }}>
            All Faculty Mentors
          </Typography>
          <Stack direction="row" spacing={1}>
            <Chip 
              icon={<SchoolIcon />}
              label={`${filteredMentors.length} Mentors`}
              color={isLight ? "primary" : "info"}
              variant="outlined"
            />
            <Button
              variant="outlined"
              onClick={() => setShowFilters(!showFilters)}
              startIcon={<FilterListIcon />}
              size="small"
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
          </Stack>
        </Box>
        <CardContent>
          <Stack spacing={2}>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <TextField
                fullWidth
                placeholder="Search mentors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <Button size="small" onClick={() => setSearchQuery("")}>
                        <ClearIcon />
                      </Button>
                    </InputAdornment>
                  ),
                }}
              />
              {(searchQuery || filterDepartment !== "all") && (
                <Button
                  variant="text"
                  onClick={clearFilters}
                  startIcon={<ClearIcon />}
                >
                  Clear
                </Button>
              )}
            </Box>

            {showFilters && (
              <Box sx={{ 
                p: 2, 
                backgroundColor: isLight ? alpha(theme.palette.primary.main, 0.05) : alpha(theme.palette.info.main, 0.05),
                borderRadius: 1
              }}>
                <Stack direction="row" spacing={2}>
                  <Select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    sx={{ minWidth: 200 }}
                    size="small"
                  >
                    {uniqueDepartments.map((dept) => (
                      <MenuItem key={dept} value={dept}>
                        {dept === "all" ? "All Departments" : dept}
                      </MenuItem>
                    ))}
                  </Select>
                </Stack>
              </Box>
            )}

            <TableContainer component={Paper}>
              <Table>
                <TableHead sx={{ backgroundColor: alpha(tableHeaderColor, 0.1) }}>
                  <TableRow>
                    <TableCell>Avatar</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell align="center">Mentees</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedMentors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography color="text.secondary">
                          No mentors found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedMentors.map((mentor) => {
                      const avatarSrc = getAvatarSrc(mentor);

                      return (
                      <TableRow 
                        key={mentor._id}
                        hover
                        sx={{ 
                          '&:hover': { 
                            backgroundColor: isLight 
                              ? alpha(theme.palette.primary.main, 0.05) 
                              : alpha(theme.palette.info.main, 0.05)
                          } 
                        }}
                      >
                        <TableCell>
                          <Avatar 
                            alt={mentor.name}
                            src={avatarSrc || undefined}
                            sx={{ 
                              backgroundColor: isLight 
                                ? theme.palette.primary.main 
                                : theme.palette.info.main 
                            }}
                          >
                            {!avatarSrc ? getAvatarFallbackText(mentor.name) : null}
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {mentor.name}
                          </Typography>
                        </TableCell>
                        <TableCell>{mentor.email}</TableCell>
                        <TableCell>{mentor.phone || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip 
                            label={mentor.department || 'N/A'} 
                            size="small"
                            sx={{
                              backgroundColor: isLight 
                                ? alpha(theme.palette.primary.main, 0.1) 
                                : alpha(theme.palette.info.main, 0.15)
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            icon={<PeopleIcon />}
                            label={mentor.menteeCount || 0}
                            size="small"
                            color={mentor.menteeCount > 0 ? "success" : "default"}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="contained"
                            size="small"
                            color={isLight ? "primary" : "info"}
                            onClick={() => handleViewMentees(mentor)}
                            disabled={!mentor.menteeCount || mentor.menteeCount === 0}
                          >
                            View Mentees
                          </Button>
                        </TableCell>
                      </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              rowsPerPageOptions={rowsPerPageOptions}
              component="div"
              count={filteredMentors.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Stack>
        </CardContent>
      </Card>
    </Page>
  );
}

export default React.memo(DirectorViewMentors);
