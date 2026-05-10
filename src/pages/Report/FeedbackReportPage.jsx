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

      worksheet.addRows(
        allFeedback.map((row) => ({
          studentName: row?.studentName || "N/A",
          studentEmail: row?.studentEmail || "N/A",
          mentorName: row?.mentorName || "N/A",
          semester: row?.semester || "N/A",
          feedbackRound: row?.feedbackRound || "N/A",
          averageScore: row?.averageScore || "N/A",
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
      link.download = `feedback-report-all.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      enqueueSnackbar("Unable to generate Excel file", { variant: "error" });
    }
  }, [enqueueSnackbar, allFeedback]);

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

          <Grid container spacing={3}>
            {/* Feedback List Card */}
            <Grid item xs={12} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: theme.palette.background.paper,
                  height: "fit-content",
                }}
              >
                <Stack spacing={2}>
                  <TextField
                    placeholder="Search feedback..."
                    size="small"
                    value={searchQuery}
                    onChange={(event) => {
                      setSearchQuery(event.target.value);
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ width: "100%" }}
                  />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.secondary" }}>
                    Total: {filteredRows.length} feedback
                  </Typography>
                </Stack>
                <Stack spacing={1.5} sx={{ maxHeight: 600, overflow: "auto", mt: 2 }}>
                  {isLoading ? (
                    <Typography color="text.secondary">Loading feedback...</Typography>
                  ) : filteredRows.length ? (
                    filteredRows.map((feedback) => (
                      <Card
                        key={feedback._id}
                        onClick={() => setSelectedFeedback(feedback)}
                        sx={{
                          cursor: "pointer",
                          backgroundColor:
                            String(selectedFeedback?._id) === String(feedback._id)
                              ? alpha(theme.palette.primary.main, 0.12)
                              : "transparent",
                          border:
                            String(selectedFeedback?._id) === String(feedback._id)
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
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                            {feedback.studentName || "N/A"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {feedback.mentorName}
                          </Typography>
                          <Typography variant="caption" sx={{ display: "block", mt: 0.5, color: "text.secondary" }}>
                            Round {feedback.feedbackRound} • Score: {feedback.averageScore}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Typography color="text.secondary">No feedback found</Typography>
                  )}
                </Stack>
              </Paper>
            </Grid>

            {/* Feedback Details Panel */}
            <Grid item xs={12} md={9}>
              {selectedFeedback ? (
                <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden", border: `1px solid ${theme.palette.divider}` }}>
                  <Box sx={{ p: { xs: 2, sm: 3 }, borderBottom: `1px solid ${theme.palette.divider}`, backgroundColor: alpha(theme.palette.primary.main, 0.03) }}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }}>
                      <Stack spacing={0.5}>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                          {selectedFeedback.studentName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Mentor: {selectedFeedback.mentorName} • Round: {selectedFeedback.feedbackRound}
                        </Typography>
                      </Stack>

                      <Button
                        variant="contained"
                        startIcon={<DownloadOutlinedIcon />}
                        onClick={handleDownloadExcel}
                        disabled={!allFeedback.length}
                      >
                        Download Excel
                      </Button>
                    </Stack>
                  </Box>

                  <Box sx={{ p: { xs: 2, sm: 3 } }}>
                    <Grid container spacing={3}>
                      {/* Basic Info */}
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                          Email
                        </Typography>
                        <Typography variant="body2">{selectedFeedback.studentEmail}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                          Semester
                        </Typography>
                        <Typography variant="body2">{selectedFeedback.semester}</Typography>
                      </Grid>

                      {/* Ratings */}
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                          Ratings (1-5 scale)
                        </Typography>
                        <Grid container spacing={2}>
                          {[
                            { label: "Mentor Accessibility", key: "mentorAccessibility" },
                            { label: "Mentor Interaction", key: "mentorInteraction" },
                            { label: "Academic Help", key: "academicHelp" },
                            { label: "Mentor Concern", key: "mentorConcern" },
                            { label: "Listening Skills", key: "listeningSkills" },
                            { label: "Professional Motivation", key: "professionalMotivation" },
                            { label: "Barrier Resolution", key: "barrierResolution" },
                            { label: "System Effectiveness", key: "systemEffectiveness" },
                            { label: "Continuation Willingness", key: "continuationWillingness" },
                          ].map((item) => (
                            <Grid item xs={12} sm={6} md={4} key={item.key}>
                              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                                {item.label}
                              </Typography>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 30 }}>
                                  {selectedFeedback[item.key]}/5
                                </Typography>
                                <Box sx={{ width: "100%", height: 6, backgroundColor: alpha(theme.palette.primary.main, 0.1), borderRadius: 3, overflow: "hidden" }}>
                                  <Box sx={{ width: `${(selectedFeedback[item.key] / 5) * 100}%`, height: "100%", backgroundColor: theme.palette.primary.main }} />
                                </Box>
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      </Grid>

                      {/* Average Score */}
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                          Average Score
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: theme.palette.primary.main }}>
                          {selectedFeedback.averageScore}/5
                        </Typography>
                      </Grid>

                      {/* Remarks */}
                      {selectedFeedback.remarks && (
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                            Remarks
                          </Typography>
                          <Typography variant="body2">{selectedFeedback.remarks}</Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
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
                    {isLoading ? "Loading feedback..." : "Select feedback from the list to view details."}
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
