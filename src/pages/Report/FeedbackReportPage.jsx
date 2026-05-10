import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  DownloadOutlined as DownloadOutlinedIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import ExcelJS from "exceljs";

import Page from "../../components/Page";
import api from "../../utils/axios";

const PAGE_SIZE = 25;

const FeedbackReportPage = () => {
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [mentors, setMentors] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [feedbackData, setFeedbackData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE);
  const [searchQuery, setSearchQuery] = useState("");
  const [detailRow, setDetailRow] = useState(null);

  // Load available mentors from mentorship data
  const loadMentors = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/mentorship/students");
      const students = response.data?.data || [];
      
      // Extract unique mentors from student data
      const mentorMap = new Map();
      (Array.isArray(students) ? students : []).forEach((student) => {
        if (student.mentor?._id && student.mentor?.name) {
          if (!mentorMap.has(String(student.mentor._id))) {
            mentorMap.set(String(student.mentor._id), {
              _id: student.mentor._id,
              name: student.mentor.name,
              email: student.mentor.email || "",
            });
          }
        }
      });
      
      setMentors(Array.from(mentorMap.values()));
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || "Failed to load mentors", { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    loadMentors();
  }, [loadMentors]);

  // Load feedback for selected mentor
  const loadMentorFeedback = useCallback(async (mentorId) => {
    if (!mentorId) {
      setFeedbackData([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.get(`/feedback/by-mentor/${mentorId}`);
      const feedbacks = response.data?.data?.feedbacks || response.data?.data || [];
      const mentor = mentors.find((m) => String(m._id) === String(mentorId));
      
      // Enrich feedback data with mentor info
      const enriched = (Array.isArray(feedbacks) ? feedbacks : [feedbacks]).map((feedback) => ({
        ...feedback,
        mentorName: mentor?.name || "N/A",
      }));
      
      setFeedbackData(enriched);
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || "Failed to load mentor feedback", { variant: "error" });
      setFeedbackData([]);
    } finally {
      setIsLoading(false);
    }
  }, [enqueueSnackbar, mentors]);

  const handleMentorSelect = (mentorId) => {
    setSelectedMentor(mentorId);
    setPage(0);
    loadMentorFeedback(mentorId);
  };

  const filteredRows = useMemo(() => {
    if (!searchQuery) return feedbackData;
    const lowerQuery = searchQuery.toLowerCase();
    return feedbackData.filter((row) => {
      const studentName = row?.studentName || row?.name || "";
      const studentEmail = row?.studentEmail || row?.email || "";
      const studentUSN = row?.studentUSN || row?.usn || "";
      return (
        studentName.toLowerCase().includes(lowerQuery) ||
        studentEmail.toLowerCase().includes(lowerQuery) ||
        studentUSN.toLowerCase().includes(lowerQuery)
      );
    });
  }, [feedbackData, searchQuery]);

  const pageRows = useMemo(
    () => filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredRows, page, rowsPerPage]
  );

  const handleDownloadExcel = useCallback(async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Feedback Report");

      worksheet.columns = [
        { header: "Student Name", key: "studentName", width: 24 },
        { header: "USN", key: "studentUSN", width: 18 },
        { header: "Email", key: "studentEmail", width: 28 },
        { header: "Mentor Name", key: "mentorName", width: 24 },
        { header: "Semester", key: "semester", width: 12 },
        { header: "Feedback Round", key: "round", width: 14 },
        { header: "Score", key: "score", width: 12 },
        { header: "Comments", key: "comments", width: 40 },
        { header: "Status", key: "status", width: 14 },
      ];

      worksheet.addRows(
        filteredRows.map((row) => ({
          studentName: row?.studentName || row?.name || "N/A",
          studentUSN: row?.studentUSN || row?.usn || "N/A",
          studentEmail: row?.studentEmail || row?.email || "N/A",
          mentorName: row?.mentorName || "N/A",
          semester: row?.semester || "N/A",
          round: row?.round || "N/A",
          score: row?.score || "N/A",
          comments: row?.comments || "",
          status: row?.status || "N/A",
        }))
      );

      worksheet.getRow(1).font = { bold: true };
      worksheet.autoFilter = { from: "A1", to: "I1" };

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `feedback-report-${selectedMentor || "all"}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      enqueueSnackbar("Unable to generate Excel file", { variant: "error" });
    }
  }, [enqueueSnackbar, filteredRows, selectedMentor]);

  return (
    <Page title="Feedback Report">
      <Box
        sx={{
          minHeight: "100vh",
          py: 3,
          backgroundColor: isLight ? alpha(theme.palette.primary.lighter, 0.3) : alpha(theme.palette.grey[900], 0.18),
        }}
      >
        <Container maxWidth="xl">
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/report")} sx={{ mb: 2 }}>
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
                Feedback Report
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 900, lineHeight: 1.8 }}>
                View feedback responses from students for each mentor. Select a mentor to see their feedback data and export to Excel.
              </Typography>
            </Stack>
          </Paper>

          <Grid container spacing={3}>
            {/* Mentor Selection Card */}
            <Grid item xs={12} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: theme.palette.background.paper,
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                  Select Mentor
                </Typography>
                <Stack spacing={1.5} sx={{ maxHeight: 600, overflow: "auto" }}>
                  {isLoading ? (
                    <Typography color="text.secondary">Loading mentors...</Typography>
                  ) : mentors.length ? (
                    mentors.map((mentor) => (
                      <Card
                        key={mentor._id}
                        onClick={() => handleMentorSelect(mentor._id)}
                        sx={{
                          cursor: "pointer",
                          backgroundColor:
                            String(selectedMentor) === String(mentor._id)
                              ? alpha(theme.palette.primary.main, 0.12)
                              : "transparent",
                          border:
                            String(selectedMentor) === String(mentor._id)
                              ? `2px solid ${theme.palette.primary.main}`
                              : `1px solid ${theme.palette.divider}`,
                          transition: "all 0.2s",
                          "&:hover": {
                            backgroundColor: alpha(theme.palette.primary.main, 0.08),
                            borderColor: theme.palette.primary.main,
                          },
                        }}
                      >
                        <CardContent sx={{ p: 1.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {mentor.name || "N/A"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {mentor.email || "N/A"}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Typography color="text.secondary">No mentors available</Typography>
                  )}
                </Stack>
              </Paper>
            </Grid>

            {/* Feedback Data Table */}
            <Grid item xs={12} md={9}>
              {selectedMentor ? (
                <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden", border: `1px solid ${theme.palette.divider}` }}>
                  <Box sx={{ p: { xs: 2, sm: 3 }, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }}>
                      <TextField
                        placeholder="Search by name, email, or USN"
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

                      <Button
                        variant="contained"
                        startIcon={<DownloadOutlinedIcon />}
                        onClick={handleDownloadExcel}
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
                          <TableCell sx={{ fontWeight: 800 }}>Student Name</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>Email</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>USN</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>Round</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>Score</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                              Loading feedback...
                            </TableCell>
                          </TableRow>
                        ) : pageRows.length ? (
                          pageRows.map((row) => (
                            <TableRow key={row._id} hover>
                              <TableCell>{row?.studentName || row?.name || "N/A"}</TableCell>
                              <TableCell>{row?.studentEmail || row?.email || "N/A"}</TableCell>
                              <TableCell>{row?.studentUSN || row?.usn || "N/A"}</TableCell>
                              <TableCell>{row?.round || "N/A"}</TableCell>
                              <TableCell>{row?.score || "N/A"}</TableCell>
                              <TableCell>{row?.status || "N/A"}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                              No feedback records found for this mentor.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {feedbackData.length > 0 && (
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
                  )}
                </Paper>
              ) : (
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    textAlign: "center",
                  }}
                >
                  <Typography color="text.secondary">
                    Select a mentor from the list to view their feedback responses.
                  </Typography>
                </Paper>
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Page>
  );
};

export default FeedbackReportPage;
