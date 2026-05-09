import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
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
} from "@mui/material";
import {
  AssessmentOutlined as AssessmentOutlinedIcon,
  Close as CloseIcon,
  DownloadOutlined as DownloadOutlinedIcon,
  SchoolOutlined as SchoolOutlinedIcon,
  VisibilityOutlined as VisibilityOutlinedIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import ExcelJS from "exceljs";
import Page from "../../components/Page";
import api from "../../utils/axios";
import { AuthContext } from "../../context/AuthContext";
import { alpha } from "@mui/material/styles";

const PAGE_SIZE = 25;

const formatDate = (value) => {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString();
};

const buildStudentName = (row) => row?.name || row?.fullName || row?.studentName || "N/A";

const ReportCard = ({ title, description, count, icon, active, onClick }) => {
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 3,
        overflow: "hidden",
        border: `1px solid ${active ? theme.palette.primary.main : theme.palette.divider}`,
        background: active
          ? `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`
          : theme.palette.background.paper,
        boxShadow: active ? (isLight ? "0 14px 32px rgba(25,118,210,0.12)" : "0 14px 32px rgba(0,0,0,0.22)") : "none",
      }}
    >
      <CardActionArea onClick={onClick} sx={{ height: "100%" }}>
        <CardContent sx={{ p: 3, minHeight: 150 }}>
          <Stack spacing={2}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: 2,
                  display: "grid",
                  placeItems: "center",
                  color: active ? "primary.main" : "text.secondary",
                  backgroundColor: active ? alpha(theme.palette.primary.main, 0.12) : alpha(theme.palette.text.primary, 0.04),
                }}
              >
                {icon}
              </Box>
              <Chip
                label={`${count} rows`}
                size="small"
                color={active ? "primary" : "default"}
                sx={{ fontWeight: 700 }}
              />
            </Box>

            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                {description}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

const Report = () => {
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";
  const { enqueueSnackbar } = useSnackbar();
  const { user } = React.useContext(AuthContext);

  const [selectedReport, setSelectedReport] = useState("competition");
  const [competitionRows, setCompetitionRows] = useState([]);
  const [attendanceRows, setAttendanceRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [competitionPage, setCompetitionPage] = useState(0);
  const [attendancePage, setAttendancePage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE);
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [attendanceDetail, setAttendanceDetail] = useState(null);
  const [attendanceDetailLoading, setAttendanceDetailLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const loadReports = useCallback(async () => {
    try {
      setIsLoading(true);
      const [competitionResponse, attendanceResponse] = await Promise.all([
        api.get("/reports/competitions"),
        api.get("/reports/attendance"),
      ]);

      setCompetitionRows(competitionResponse.data?.data?.competitions || []);
      setAttendanceRows(attendanceResponse.data?.data?.attendance || []);
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || "Failed to load reports", { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const activeRows = selectedReport === "competition" ? competitionRows : attendanceRows;
  const activePage = selectedReport === "competition" ? competitionPage : attendancePage;
  const pageRows = useMemo(
    () => activeRows.slice(activePage * rowsPerPage, activePage * rowsPerPage + rowsPerPage),
    [activeRows, activePage, rowsPerPage]
  );

  const handleChangePage = (_event, newPage) => {
    if (selectedReport === "competition") {
      setCompetitionPage(newPage);
    } else {
      setAttendancePage(newPage);
    }
  };

  const handleChangeRowsPerPage = (event) => {
    const nextRows = parseInt(event.target.value, 10);
    setRowsPerPage(nextRows);
    setCompetitionPage(0);
    setAttendancePage(0);
  };

  const handleSelectReport = (reportKey) => {
    setSelectedReport(reportKey);
  };

  const handleDownloadCompetitionExcel = useCallback(async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Competition Report");

      worksheet.columns = [
        { header: "Student Name", key: "name", width: 24 },
        { header: "USN", key: "usn", width: 18 },
        { header: "Email", key: "email", width: 28 },
        { header: "Mentor Name", key: "mentorName", width: 24 },
        { header: "Department", key: "department", width: 18 },
        { header: "Semester", key: "sem", width: 12 },
        { header: "Event Name", key: "eventName", width: 28 },
        { header: "Organized By", key: "organizedBy", width: 24 },
        { header: "Event Date", key: "eventDate", width: 16 },
        { header: "Status", key: "status", width: 16 },
        { header: "Level", key: "level", width: 14 },
        { header: "Event Affiliation", key: "eventAffiliation", width: 18 },
      ];

      worksheet.addRows(
        competitionRows.map((row) => ({
          ...row,
          eventDate: formatDate(row.eventDate),
        }))
      );

      worksheet.getRow(1).font = { bold: true };
      worksheet.autoFilter = {
        from: "A1",
        to: "L1",
      };

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "competition-report.xlsx";
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      enqueueSnackbar("Unable to generate Excel file", { variant: "error" });
    }
  }, [competitionRows, enqueueSnackbar]);

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
    <Page title="Reports">
      <Box
        sx={{
          minHeight: "100vh",
          py: 3,
          backgroundColor: isLight ? alpha(theme.palette.primary.lighter, 0.3) : alpha(theme.palette.grey[900], 0.18),
        }}
      >
        <Container maxWidth="xl">
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
              <Chip label={`Signed in as ${user?.roleName || "user"}`} size="small" sx={{ width: "fit-content" }} />
              <Typography variant="h4" sx={{ fontWeight: 900 }}>
                Reports
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 820, lineHeight: 1.8 }}>
                Review competition entries from Career Review and track students whose latest attendance has dropped below the 75% threshold.
              </Typography>
            </Stack>
          </Paper>

          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <ReportCard
                title="Competition Report"
                description="Students who submitted competition entries in Career Review. Click to browse the records and export them to Excel."
                count={competitionRows.length}
                icon={<AssessmentOutlinedIcon />}
                active={selectedReport === "competition"}
                onClick={() => handleSelectReport("competition")}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ReportCard
                title="Attendance Report"
                description="Students whose latest uploaded attendance is below 75%, with mentor and student details for quick review."
                count={attendanceRows.length}
                icon={<SchoolOutlinedIcon />}
                active={selectedReport === "attendance"}
                onClick={() => handleSelectReport("attendance")}
              />
            </Grid>
          </Grid>

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
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {selectedReport === "competition" ? "Competition Records" : "Attendance Below 75%"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Showing {Math.min(activeRows.length, rowsPerPage)} of {activeRows.length} records per page.
                  </Typography>
                </Box>

                {selectedReport === "competition" && (
                  <Button
                    variant="contained"
                    startIcon={<DownloadOutlinedIcon />}
                    onClick={handleDownloadCompetitionExcel}
                    disabled={!competitionRows.length}
                  >
                    Download Excel
                  </Button>
                )}
              </Stack>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  {selectedReport === "competition" ? (
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800 }}>Student</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>USN</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Mentor</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Department</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Event</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                    </TableRow>
                  ) : (
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
                  )}
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
                        {selectedReport === "competition" ? (
                          <>
                            <TableCell>{buildStudentName(row)}</TableCell>
                            <TableCell>{row.usn || "N/A"}</TableCell>
                            <TableCell>{row.email || "N/A"}</TableCell>
                            <TableCell>{row.mentorName || "N/A"}</TableCell>
                            <TableCell>{row.department || "N/A"}</TableCell>
                            <TableCell>{row.eventName || "N/A"}</TableCell>
                            <TableCell>{formatDate(row.eventDate)}</TableCell>
                            <TableCell>{row.status || "N/A"}</TableCell>
                          </>
                        ) : (
                          <>
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
                          </>
                        )}
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
              count={activeRows.length}
              rowsPerPage={rowsPerPage}
              page={activePage}
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

export default Report;