import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
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

  const [allFeedback, setAllFeedback] = useState([]);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [selectedMentorId, setSelectedMentorId] = useState(null);
  const [mentorFeedback, setMentorFeedback] = useState([]);
  const [selectedMenteeId, setSelectedMenteeId] = useState(null);
  const [semesterFilter, setSemesterFilter] = useState("");
  const [roundFilter, setRoundFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Load all feedback data on page load
  const loadAllFeedback = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/feedback/overview");
      const feedbacks = response.data?.data?.feedbacks || [];
      
      // Prepare feedback list with proper formatting
      const formattedFeedbacks = (Array.isArray(feedbacks) ? feedbacks : []).map((fb) => ({
        _id: fb._id,
        mentorId: fb.mentorId || fb.mentor?._id || null,
        studentName: fb.userId?.name || "N/A",
        studentEmail: fb.userId?.email || "N/A",
        mentorName: fb.mentorName || "N/A",
        semester: fb.semester || "N/A",
        feedbackRound: fb.feedbackRound || "N/A",
        averageScore: fb.averageScore || "N/A",
        remarks: fb.remarks || "",
        mentorAccessibility: fb.mentorAccessibility || 0,
        mentorInteraction: fb.mentorInteraction || 0,
        academicHelp: fb.academicHelp || 0,
        mentorConcern: fb.mentorConcern || 0,
        listeningSkills: fb.listeningSkills || 0,
        professionalMotivation: fb.professionalMotivation || 0,
        barrierResolution: fb.barrierResolution || 0,
        systemEffectiveness: fb.systemEffectiveness || 0,
        continuationWillingness: fb.continuationWillingness || 0,
        submittedAt: fb.submittedAt,
      }));
      
      setAllFeedback(formattedFeedbacks);
      // Extract mentors
      const mentorMap = new Map();
      formattedFeedbacks.forEach((f) => {
        if (f.mentorId) {
          if (!mentorMap.has(String(f.mentorId))) {
            mentorMap.set(String(f.mentorId), {
              _id: f.mentorId,
              name: f.mentorName || "N/A",
              email: f.studentEmail || "",
            });
          }
        }
      });
      setMentors(Array.from(mentorMap.values()));
      
      // Auto-select first feedback
      if (formattedFeedbacks.length > 0) {
        setSelectedFeedback(formattedFeedbacks[0]);
      }
      
      if (formattedFeedbacks.length === 0) {
        enqueueSnackbar("No feedback available", { variant: "info" });
      }
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || "Failed to load feedback", { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    loadAllFeedback();
  }, [loadAllFeedback]);

  // Load feedback for a specific mentor (from API)
  const loadMentorFeedback = useCallback(
    async (mentorId) => {
      if (!mentorId) {
        setMentorFeedback([]);
        return;
      }
      try {
        setIsLoading(true);
        const resp = await api.get(`/feedback/by-mentor/${mentorId}`);
        // Backend returns { data: { mentors: [ { mentees: [...] , mentorName, mentorId } ] } }
        const mentorsArr = resp.data?.data?.mentors || [];
        const mentorGroup = Array.isArray(mentorsArr) && mentorsArr.length > 0 ? mentorsArr[0] : null;
        const mentees = mentorGroup?.mentees || [];

        // Flatten mentees.feedbacks into rows
        const rows = [];
        mentees.forEach((m) => {
          (Array.isArray(m.feedbacks) ? m.feedbacks : []).forEach((fb) => {
            rows.push({
              _id: fb._id,
              studentId: m.studentId || m.studentId || (fb.userId && fb.userId._id) || null,
              studentName: m.studentName || fb.userId?.name || "N/A",
              studentEmail: fb.userId?.email || m.studentEmail || "N/A",
              usn: fb.studentUSN || fb.usn || m.usn || "N/A",
              semester: fb.semester || "N/A",
              feedbackRound: fb.feedbackRound || fb.round || "N/A",
              averageScore: fb.averageScore || "N/A",
              submittedAt: fb.submittedAt || fb.createdAt || null,
              remarks: fb.remarks || "",
              mentorName: mentorGroup?.mentorName || resp.data?.data?.mentor?.name || "N/A",
            });
          });
        });

        setMentorFeedback(rows);

        // Auto-set filters to most recent feedback's semester and round
        if (rows.length) {
          const sorted = rows.slice().sort((a, b) => {
            const ta = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
            const tb = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
            return tb - ta;
          });
          const latest = sorted[0];
          if (latest) {
            setSemesterFilter(latest.semester || "");
            setRoundFilter(latest.feedbackRound || "");
          }
        }
        // If any rows miss USN, fetch user profiles to populate USN
        const missingIds = Array.from(new Set(rows.filter(r => !r.usn || r.usn === 'N/A').map(r => r.studentId))).filter(Boolean);
        if (missingIds.length) {
          try {
            await Promise.all(missingIds.map(async (id) => {
              try {
                const uresp = await api.get(`/users/${id}`, { params: { includeProfiles: true } });
                const user = uresp.data?.data?.user;
                const usn = user?.studentProfile?.usn || user?.profile?.usn || user?.registrationNumber || null;
                if (usn) {
                  rows.forEach((r) => {
                    if (String(r.studentId) === String(id)) r.usn = usn;
                  });
                }
              } catch (e) {
                // ignore per-user failures
              }
            }));
            // update state with enriched rows
            setMentorFeedback(rows);
          } catch (e) {
            // ignore
          }
        }
      } catch (error) {
        enqueueSnackbar(error?.response?.data?.message || "Failed to load mentor feedback", { variant: "error" });
        setMentorFeedback([]);
      } finally {
        setIsLoading(false);
      }
    },
    [enqueueSnackbar]
  );

  const filteredRows = useMemo(() => {
    if (!searchQuery) return allFeedback;
    const lowerQuery = searchQuery.toLowerCase();
    return allFeedback.filter((row) => {
      const studentName = row?.studentName || "";
      const mentorName = row?.mentorName || "";
      const studentEmail = row?.studentEmail || "";
      return (
        studentName.toLowerCase().includes(lowerQuery) ||
        mentorName.toLowerCase().includes(lowerQuery) ||
        studentEmail.toLowerCase().includes(lowerQuery)
      );
    });
  }, [allFeedback, searchQuery]);

  // Rows for currently selected mentor (apply semester/round/search filters)
  const mentorFilteredRows = useMemo(() => {
    if (!selectedMentorId) return [];
    let rows = mentorFeedback.slice();
    if (semesterFilter) rows = rows.filter((r) => String(r.semester) === String(semesterFilter));
    if (roundFilter) rows = rows.filter((r) => String(r.feedbackRound) === String(roundFilter));
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter((r) => (r.studentName || "").toLowerCase().includes(q) || (r.studentEmail || "").toLowerCase().includes(q) || (r.usn || "").toLowerCase().includes(q));
    }
    return rows;
  }, [mentorFeedback, selectedMentorId, semesterFilter, roundFilter, searchQuery]);

  // Latest feedback per mentee (one row per mentee) derived from mentorFilteredRows
  const menteeLatestRows = useMemo(() => {
    const map = new Map();
    for (const r of mentorFilteredRows) {
      const id = String(r.studentId || r.studentId || "");
      const existing = map.get(id);
      const currTime = r.submittedAt ? new Date(r.submittedAt).getTime() : 0;
      const existTime = existing && existing.submittedAt ? new Date(existing.submittedAt).getTime() : 0;
      if (!existing || currTime >= existTime) {
        map.set(id, r);
      }
    }
    return Array.from(map.values());
  }, [mentorFilteredRows]);

  const handleDownloadExcel = useCallback(async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Feedback Report");

      worksheet.columns = [
        { header: "Student Name", key: "studentName", width: 24 },
        { header: "Email", key: "studentEmail", width: 28 },
        { header: "Mentor Name", key: "mentorName", width: 24 },
        { header: "Semester", key: "semester", width: 12 },
        { header: "Feedback Round", key: "feedbackRound", width: 14 },
        { header: "Average Score", key: "averageScore", width: 14 },
        { header: "Remarks", key: "remarks", width: 40 },
      ];

      const dataToExport = selectedMentorId ? mentorFilteredRows : allFeedback;
      worksheet.addRows(
        dataToExport.map((row) => ({
          studentName: row?.studentName || "N/A",
          studentEmail: row?.studentEmail || "N/A",
          mentorName: row?.mentorName || row?.mentorName || "N/A",
          semester: row?.semester || "N/A",
          feedbackRound: row?.feedbackRound || row?.feedbackRound || "N/A",
          averageScore: row?.averageScore || row?.averageScore || "N/A",
          remarks: row?.remarks || "",
        }))
      );

      worksheet.getRow(1).font = { bold: true };
      worksheet.autoFilter = { from: "A1", to: "G1" };

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `feedback-report-${selectedMentorId ? selectedMentorId : 'all'}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      enqueueSnackbar("Unable to generate Excel file", { variant: "error" });
    }
  }, [enqueueSnackbar, allFeedback, selectedMentorId, mentorFilteredRows]);

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
                View all feedback responses from students. Click on any feedback to view details and export to Excel.
              </Typography>
            </Stack>
          </Paper>

          {/* If no mentor selected show mentor grid like thread-reports */}
          {!selectedMentorId ? (
            <Grid container spacing={3}>
              {isLoading ? (
                <Grid item xs={12}>
                  <Typography color="text.secondary">Loading mentors...</Typography>
                </Grid>
              ) : mentors.length ? (
                mentors
                  .filter((m) => (m.name || "").toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((mentor) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={mentor._id}>
                      <Card
                        sx={{
                          transition: "all 0.3s ease",
                          borderRadius: 2,
                          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                          height: "100%",
                          backgroundColor: isLight
                            ? alpha(theme.palette.primary.main, 0.02)
                            : alpha(theme.palette.info.main, 0.05),
                        }}
                      >
                        <Box onClick={() => { setSelectedMentorId(mentor._id); loadMentorFeedback(mentor._id); }} sx={{ cursor: "pointer" }}>
                          <CardContent>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                              <Box sx={{ width: 56, height: 56, mr: 2, borderRadius: 28, bgcolor: isLight ? theme.palette.primary.main : theme.palette.info.main, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
                                {mentor.name ? mentor.name.charAt(0) : "M"}
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>{mentor.name || "N/A"}</Typography>
                                <Typography variant="body2" color="text.secondary">{mentor.email || "N/A"}</Typography>
                              </Box>
                            </Box>
                            <Typography variant="caption" color="text.secondary">Click to view mentees and feedback</Typography>
                          </CardContent>
                        </Box>
                      </Card>
                    </Grid>
                  ))
              ) : (
                <Grid item xs={12}>
                  <Paper elevation={0} sx={{ p: 4, textAlign: 'center' }}>
                    <Typography>No mentors found</Typography>
                  </Paper>
                </Grid>
              )}
            </Grid>
          ) : (
            // Mentor selected: show mentees grid and feedback table
            <>
              <Button startIcon={<ArrowBackIcon />} onClick={() => { setSelectedMentorId(null); setMentorFeedback([]); setSelectedMenteeId && setSelectedMenteeId(null); setSelectedFeedback(null); }} sx={{ mb: 2 }}>
                Back to Mentors
              </Button>

              {/* Mentee list table: one row per mentee (latest feedback) with View Details action */}

              {/* Feedback table for selected mentor (and optionally filtered by selectedFeedback/mentee) */}
              <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden", border: `1px solid ${theme.palette.divider}` }}>
                <Box sx={{ p: { xs: 2, sm: 3 }, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems={{ xs: "stretch", md: "center" }}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
                      <TextField
                        placeholder="Search students by name, email, or USN"
                        size="small"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <TextField
                        select
                        size="small"
                        value={semesterFilter}
                        onChange={(e) => setSemesterFilter(e.target.value)}
                        sx={{ minWidth: 140 }}
                      >
                        <MenuItem value="">All Semesters</MenuItem>
                        {[...new Set(mentorFeedback.map((r) => r.semester))].map((s) => (
                          <MenuItem key={s} value={s}>{s}</MenuItem>
                        ))}
                      </TextField>
                      <TextField
                        select
                        size="small"
                        value={roundFilter}
                        onChange={(e) => setRoundFilter(e.target.value)}
                        sx={{ minWidth: 140 }}
                      >
                        <MenuItem value="">All Rounds</MenuItem>
                        {[...new Set(mentorFeedback.map((r) => r.feedbackRound))].map((r) => (
                          <MenuItem key={r} value={r}>{r}</MenuItem>
                        ))}
                      </TextField>
                    </Stack>

                    <Button variant="contained" startIcon={<DownloadOutlinedIcon />} onClick={() => handleDownloadExcel()}>
                      Download Excel
                    </Button>
                  </Stack>
                </Box>

                <Box>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 800 }}>Student Name</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>Email</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>USN</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>Round</TableCell>
                          <TableCell sx={{ fontWeight: 800 }}>Score</TableCell>
                          <TableCell sx={{ fontWeight: 800, textAlign: 'center' }}>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {isLoading ? (
                          <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                              Loading...
                            </TableCell>
                          </TableRow>
                        ) : menteeLatestRows.length ? (
                          menteeLatestRows.map((row) => (
                            <TableRow key={row._id} hover>
                              <TableCell>{row.studentName}</TableCell>
                              <TableCell>{row.studentEmail}</TableCell>
                              <TableCell>{row.usn}</TableCell>
                              <TableCell>{row.feedbackRound}</TableCell>
                              <TableCell>{row.averageScore}</TableCell>
                              <TableCell align="center">
                                <Button size="small" variant="outlined" onClick={() => setSelectedFeedback(row)}>View Details</Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                              No feedback for this mentor.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>

                {/* details panel for selected feedback */}
                {selectedFeedback && (
                  <Box sx={{ p: { xs: 2, sm: 3 } }}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>{selectedFeedback.studentName}</Typography>
                    <Typography variant="caption" color="text.secondary">{selectedFeedback.studentEmail} • {selectedFeedback.usn}</Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Average Score</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 900, color: theme.palette.primary.main }}>{selectedFeedback.averageScore}/5</Typography>
                      {selectedFeedback.remarks && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Remarks</Typography>
                          <Typography variant="body2">{selectedFeedback.remarks}</Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}
              </Paper>
            </>
          )}
        </Container>
      </Box>
    </Page>
  );
};

export default FeedbackReportPage;
