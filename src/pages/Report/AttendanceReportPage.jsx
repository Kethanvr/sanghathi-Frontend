import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Container,
  Dialog,
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
  Typography,
  useTheme,
  TextField,
  InputAdornment
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  DownloadOutlined as DownloadOutlinedIcon,
  Search as SearchIcon,
  VisibilityOutlined as VisibilityOutlinedIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import ExcelJS from "exceljs";
import Page from "../../components/Page";
import api from "../../utils/axios";
import { alpha } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 25;

const buildStudentName = (row) => row?.name || row?.fullName || row?.studentName || "N/A";

const AttendanceReportPage = () => {
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [attendanceRows, setAttendanceRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [attendanceDetail, setAttendanceDetail] = useState(null);
  const [attendanceDetailLoading, setAttendanceDetailLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const loadReports = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/reports/attendance");
      setAttendanceRows(response.data?.data?.attendance || []);
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || "Failed to load reports", { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const filteredRows = useMemo(() => {
    if (!searchQuery) return attendanceRows;
    const lowerQuery = searchQuery.toLowerCase();
    return attendanceRows.filter((row) => 
      buildStudentName(row).toLowerCase().includes(lowerQuery) ||
      (row.usn || "").toLowerCase().includes(lowerQuery) ||
      (row.email || "").toLowerCase().includes(lowerQuery) ||
      (row.department || "").toLowerCase().includes(lowerQuery)
    );
  }, [attendanceRows, searchQuery]);

  const pageRows = useMemo(
    () => filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredRows, page, rowsPerPage]
  );

  const handleChangePage = (_event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDownloadAttendanceExcel = useCallback(async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Attendance Report");

      worksheet.columns = [
        { header: "Student Name", key: "name", width: 24 },
        { header: "USN", key: "usn", width: 18 },
        { header: "Email", key: "email", width: 28 },
        { header: "Mentor Name", key: "mentorName", width: 24 },
        { header: "Department", key: "department", width: 18 },
        { header: "Semester", key: "semester", width: 12 },
        { header: "Attendance %", key: "overallAttendance", width: 16 },
      ];

      worksheet.addRows(
        filteredRows.map((row) => ({
          ...row,
          name: buildStudentName(row),
          overallAttendance: Number(row.overallAttendance).toFixed(2),
        }))
      );

      worksheet.getRow(1).font = { bold: true };
      worksheet.autoFilter = {
        from: "A1",
        to: "G1",
      };

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "attendance-report.xlsx";
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      enqueueSnackbar("Unable to generate Excel file", { variant: "error" });
    }
  }, [filteredRows, enqueueSnackbar]);

  const handleViewAttendance = useCallback(async (row) => {
    try {
      setSelectedStudent(row);
      setAttendanceDialogOpen(true);
      setAttendanceDetailLoading(true);
      const response = await api.get(`/students/attendance/${row.userId}`);
      setAttendanceDetail(response.data?.data?.attendance || null);
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || "Unable to load attendance details", { variant: "error" });
      setAttendanceDialogOpen(false);
    } finally {
      setAttendanceDetailLoading(false);
    }
  }, [enqueueSnackbar]);

  const attendanceDetailRows = useMemo(() => {
    const semesters = attendanceDetail?.semesters || [];

    return semesters.map((semesterEntry) => ({
      semester: semesterEntry.semester,
      months: Array.isArray(semesterEntry.months) ? semesterEntry.months : [],
    }));
  }, [attendanceDetail]);

  return (
    <Page title="Attendance Report">
      <Box
        sx={{
          minHeight: "100vh",
          py: 3,
          backgroundColor: isLight ? alpha(theme.palette.primary.lighter, 0.3) : alpha(theme.palette.grey[900], 0.18),
        }}
      >
        <Container maxWidth="xl">
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate("/report")}
            sx={{ mb: 2 }}
          >
            Back to Reports
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
                Attendance Below 75%
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 820, lineHeight: 1.8 }}>
                Review students whose latest uploaded attendance is below 75%, with mentor and student details.
              </Typography>
            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <Box sx={{ p: { xs: 2, sm: 3 }, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
              >
                <TextField
                  placeholder="Search by name, USN, email, department..."
                  variant="outlined"
                  size="small"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(0);
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ minWidth: { xs: "100%", sm: 300 } }}
                />
                <Button
                  variant="contained"
                  startIcon={<DownloadOutlinedIcon />}
                  onClick={handleDownloadAttendanceExcel}
                  disabled={!filteredRows.length}
                >
                  Download Excel
                </Button>
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
                    <TableCell sx={{ fontWeight: 800 }}>Department</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Semester</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Attendance %</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>View</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                        Loading report data...
                      </TableCell>
                    </TableRow>
                  ) : pageRows.length ? (
                    pageRows.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell>{buildStudentName(row)}</TableCell>
                        <TableCell>{row.usn || "N/A"}</TableCell>
                        <TableCell>{row.email || "N/A"}</TableCell>
                        <TableCell>{row.mentorName || "N/A"}</TableCell>
                        <TableCell>{row.department || "N/A"}</TableCell>
                        <TableCell>{row.semester || "N/A"}</TableCell>
                        <TableCell>
                          <Chip
                            label={`${Number(row.overallAttendance).toFixed(2)}%`}
                            size="small"
                            color={Number(row.overallAttendance) < 60 ? "error" : "warning"}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<VisibilityOutlinedIcon />}
                            onClick={() => handleViewAttendance(row)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                        No records found.
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
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[25, 50, 100]}
            />
          </Paper>
        </Container>
      </Box>

      <Dialog
        open={attendanceDialogOpen}
        onClose={() => setAttendanceDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ pr: 6 }}>
          {selectedStudent?.name || "Attendance Details"}
          <IconButton
            onClick={() => setAttendanceDialogOpen(false)}
            sx={{ position: "absolute", right: 12, top: 12 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {attendanceDetailLoading ? (
            <Typography>Loading attendance details...</Typography>
          ) : attendanceDetail ? (
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                USN: {selectedStudent?.usn || "N/A"} | Mentor: {selectedStudent?.mentorName || "N/A"} | Email: {selectedStudent?.email || "N/A"}
              </Typography>

              {attendanceDetailRows.map((semesterEntry) => (
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
            <Typography>No attendance data found for this student.</Typography>
          )}
        </DialogContent>
      </Dialog>
    </Page>
  );
};

export default AttendanceReportPage;
