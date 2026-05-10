import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  MenuItem,
  Typography,
  InputAdornment,
  useTheme,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  DownloadOutlined as DownloadOutlinedIcon,
  Search as SearchIcon,
  ForumOutlined as ForumOutlinedIcon,
  VisibilityOutlined as VisibilityOutlinedIcon,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import ExcelJS from "exceljs";

import Page from "../../components/Page";
import api from "../../utils/axios";
import { AuthContext } from "../../context/AuthContext";

const PAGE_SIZE = 25;

const buildStudentName = (row) => row?.name || row?.fullName || row?.studentName || "N/A";

const FacultyAlerts = () => {
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE);
  const [detailRow, setDetailRow] = useState(null);
  const [detailAttendance, setDetailAttendance] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadAlerts = useCallback(async () => {
    try {
      setIsLoading(true);
      const [attendanceResponse, menteesResponse] = await Promise.all([
        api.get("/reports/attendance"),
        api.get(`/mentorship/${user._id}/mentees-with-profiles`, { params: { page: 1, limit: 500 } }),
      ]);

      const lowAttendanceRows = attendanceResponse.data?.data?.attendance || [];
      const mentees = Array.isArray(menteesResponse.data?.mentees) ? menteesResponse.data.mentees : [];
      const menteeIds = new Set(mentees.map((mentee) => String(mentee?._id)).filter(Boolean));

      setRows(lowAttendanceRows.filter((row) => menteeIds.has(String(row.userId))));
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || "Unable to load alerts", { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [enqueueSnackbar, user?._id]);

  useEffect(() => {
    if (user?._id) {
      loadAlerts();
    }
  }, [loadAlerts, user?._id]);

  const semesters = useMemo(() => [...new Set(rows.map((row) => row.semester).filter(Boolean))], [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (semesterFilter && String(row.semester) !== String(semesterFilter)) return false;
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        buildStudentName(row).toLowerCase().includes(query) ||
        (row.usn || "").toLowerCase().includes(query) ||
        (row.email || "").toLowerCase().includes(query) ||
        (row.mentorName || "").toLowerCase().includes(query)
      );
    });
  }, [rows, semesterFilter, searchQuery]);

  const pageRows = useMemo(
    () => filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredRows, page, rowsPerPage]
  );

  const handleDownloadExcel = useCallback(async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Faculty Alerts");

      worksheet.columns = [
        { header: "Student Name", key: "name", width: 24 },
        { header: "USN", key: "usn", width: 18 },
        { header: "Email", key: "email", width: 28 },
        { header: "Mentor Name", key: "mentorName", width: 24 },
        { header: "Department", key: "department", width: 18 },
        { header: "Semester", key: "semester", width: 12 },
        { header: "Month", key: "month", width: 12 },
        { header: "Attendance %", key: "overallAttendance", width: 16 },
      ];

      worksheet.addRows(
        filteredRows.map((row) => ({
          ...row,
          name: buildStudentName(row),
          overallAttendance: Number(row.overallAttendance || 0).toFixed(2),
        }))
      );

      worksheet.getRow(1).font = { bold: true };
      worksheet.autoFilter = { from: "A1", to: "H1" };

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "faculty-alerts.xlsx";
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      enqueueSnackbar("Unable to generate Excel file", { variant: "error" });
    }
  }, [enqueueSnackbar, filteredRows]);

  const handleViewDetails = useCallback(async (row) => {
    try {
      setDetailRow(row);
      setDetailAttendance(null);
      setDetailLoading(true);
      const response = await api.get(`/students/attendance/${row.userId}`);
      setDetailAttendance(response.data?.data?.attendance || null);
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || "Unable to load attendance details", { variant: "error" });
      setDetailRow(null);
    } finally {
      setDetailLoading(false);
    }
  }, [enqueueSnackbar]);

  const detailSemesters = useMemo(() => detailAttendance?.semesters || [], [detailAttendance]);

  return (
    <Page title="Faculty Alerts">
      <Box
        sx={{
          minHeight: "100vh",
          py: 3,
          backgroundColor: isLight ? alpha(theme.palette.primary.lighter, 0.3) : alpha(theme.palette.grey[900], 0.18),
        }}
      >
        <Container maxWidth="xl">
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/faculty/dashboard")} sx={{ mb: 2 }}>
            Back to Dashboard
          </Button>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 3, md: 4 },
              mb: 3,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              background: isLight
                ? "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(247,249,252,0.98) 100%)"
                : "linear-gradient(180deg, rgba(17,24,39,0.96) 0%, rgba(15,23,42,0.96) 100%)",
            }}
          >
            <Stack spacing={1}>
              <Typography variant="h4" sx={{ fontWeight: 900 }}>
                Attendance Alerts
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 900, lineHeight: 1.8 }}>
                Low-attendance mentees below 75% are listed here with quick filters, Excel download, and direct thread access.
              </Typography>
            </Stack>
          </Paper>

          <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden", border: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ p: { xs: 2, sm: 3 }, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }}>
                <TextField
                  placeholder="Search by name, USN, email, or mentor"
                  size="small"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setPage(0);
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ minWidth: { xs: "100%", md: 320 } }}
                />

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ width: { xs: "100%", md: "auto" } }}>
                  <TextField
                    select
                    size="small"
                    label="Semester"
                    value={semesterFilter}
                    onChange={(event) => {
                      setSemesterFilter(event.target.value);
                      setPage(0);
                    }}
                    sx={{ minWidth: 140 }}
                  >
                    <MenuItem value="">All Semesters</MenuItem>
                    {semesters.map((semester) => (
                      <MenuItem key={semester} value={semester}>
                        {semester}
                      </MenuItem>
                    ))}
                  </TextField>

                  <Button variant="contained" startIcon={<DownloadOutlinedIcon />} onClick={handleDownloadExcel} disabled={!filteredRows.length}>
                    Download Excel
                  </Button>
                </Stack>
              </Stack>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800 }}>Student</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>USN</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Mentor</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Semester</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Attendance %</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>View</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Thread</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                        Loading alerts...
                      </TableCell>
                    </TableRow>
                  ) : pageRows.length ? (
                    pageRows.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell>{buildStudentName(row)}</TableCell>
                        <TableCell>{row.usn || "N/A"}</TableCell>
                        <TableCell>{row.email || "N/A"}</TableCell>
                        <TableCell>{row.mentorName || "N/A"}</TableCell>
                        <TableCell>{row.semester || "N/A"}</TableCell>
                        <TableCell>
                          <Chip
                            label={`${Number(row.overallAttendance || 0).toFixed(2)}%`}
                            size="small"
                            color={Number(row.overallAttendance || 0) < 60 ? "error" : "warning"}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Button variant="outlined" size="small" startIcon={<VisibilityOutlinedIcon />} onClick={() => handleViewDetails(row)}>
                            View Details
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<ForumOutlinedIcon />}
                            onClick={() => navigate(`/threads?menteeId=${row.userId}`)}
                          >
                            Open Thread
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                        No low-attendance mentees found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={filteredRows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={(_event, newPage) => setPage(newPage)}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[25, 50, 100]}
            />
          </Paper>
        </Container>
      </Box>

      <Dialog open={Boolean(detailRow)} onClose={() => setDetailRow(null)} fullWidth maxWidth="md">
        <DialogTitle sx={{ pr: 6 }}>
          {detailRow?.name || "Attendance Details"}
          <IconButton onClick={() => setDetailRow(null)} sx={{ position: "absolute", right: 12, top: 12 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {detailLoading ? (
            <Typography>Loading attendance details...</Typography>
          ) : detailAttendance ? (
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                USN: {detailRow?.usn || "N/A"} | Mentor: {detailRow?.mentorName || "N/A"} | Email: {detailRow?.email || "N/A"}
              </Typography>

              {detailSemesters.map((semesterEntry) => (
                <Paper key={semesterEntry.semester} variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
                    Semester {semesterEntry.semester}
                  </Typography>
                  <Stack spacing={1.5}>
                    {semesterEntry.months.map((monthEntry) => (
                      <Box key={`${semesterEntry.semester}-${monthEntry.month}`}>
                        <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                          Month {monthEntry.month} - {Number(monthEntry.overallAttendance || 0).toFixed(2)}%
                        </Typography>
                        <TableContainer component={Paper} variant="outlined">
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Subject</TableCell>
                                <TableCell>Attended</TableCell>
                                <TableCell>Total</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {(monthEntry.subjects || []).map((subject, index) => (
                                <TableRow key={`${subject.subjectCode || subject.subjectName || index}`}>
                                  <TableCell>{subject.subjectName || subject.subjectCode || "N/A"}</TableCell>
                                  <TableCell>{subject.attendedClasses ?? "N/A"}</TableCell>
                                  <TableCell>{subject.totalClasses ?? "N/A"}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              ))}
            </Stack>
          ) : (
            <Typography>No attendance data available.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailRow(null)}>Close</Button>
          {detailRow ? (
            <Button variant="contained" startIcon={<ForumOutlinedIcon />} onClick={() => navigate(`/threads?menteeId=${detailRow.userId}`)}>
              Open Thread
            </Button>
          ) : null}
        </DialogActions>
      </Dialog>
    </Page>
  );
};

export default FacultyAlerts;
