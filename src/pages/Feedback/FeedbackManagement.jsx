import React, { useContext, useEffect, useState, useMemo } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
  Drawer,
  FormControlLabel,
  Radio,
  RadioGroup,
  Tabs,
  Tab,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { alpha, useTheme } from "@mui/material/styles";
import { useSnackbar } from "notistack";
import { Controller, useForm } from "react-hook-form";
import { AuthContext } from "../../context/AuthContext";
import api from "../../utils/axios";
import Page from "../../components/Page";
import { FormProvider, RHFTextField } from "../../components/hook-form";
import logger from "../../utils/logger.js";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

const roundOptions = [
  { value: 1, label: "Feedback 1" },
  { value: 2, label: "Feedback 2" },
];

const RATING_OPTIONS = [
  { value: 1, label: "Strongly Disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly Agree" },
];

const FEEDBACK_QUESTIONS = [
  { field: "mentorAccessibility", label: "Mentor accessibility & availability" },
  { field: "mentorInteraction", label: "Mentor interaction frequency" },
  { field: "academicHelp", label: "Academic help provided" },
  { field: "mentorConcern", label: "Mentor concern/interest" },
  { field: "listeningSkills", label: "Listening skills" },
  { field: "professionalMotivation", label: "Professional development motivation" },
  { field: "barrierResolution", label: "Barrier resolution" },
  { field: "systemEffectiveness", label: "System effectiveness" },
  { field: "continuationWillingness", label: "Continuation willingness" },
];

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const FeedbackManagement = () => {
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useContext(AuthContext);
  const canEditWindow = user?.roleName === "admin";
  const isHodOrDirector = user?.roleName === "hod" || user?.roleName === "director";

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedbackWindow, setFeedbackWindow] = useState(null);
  const [stats, setStats] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [semesterFilter, setSemesterFilter] = useState("");
  const [selectedFeedbackRound, setSelectedFeedbackRound] = useState(1);
  const [mentorFilter, setMentorFilter] = useState("");
  const [semesterDraft, setSemesterDraft] = useState("");
  const [roundDraft, setRoundDraft] = useState(1);
  const [enabledDraft, setEnabledDraft] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentFeedbacks, setStudentFeedbacks] = useState({});
  const [selectedRound, setSelectedRound] = useState(0);
  const [drillDownOpen, setDrillDownOpen] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [mentorGroups, setMentorGroups] = useState([]);
  const [expandedMentors, setExpandedMentors] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const editorMethods = useForm({
    defaultValues: {
      mentorAccessibility: "",
      mentorInteraction: "",
      academicHelp: "",
      mentorConcern: "",
      listeningSkills: "",
      professionalMotivation: "",
      barrierResolution: "",
      systemEffectiveness: "",
      continuationWillingness: "",
      awareOfPST: "",
      awareOfPLT: "",
      remarks: "",
    },
  });

  const loadFeedbackData = async (query = {}) => {
    setLoading(true);

    try {
      const [windowResponse, overviewResponse] = await Promise.all([
        api.get("/feedback/window"),
        api.get("/feedback/overview", { params: query }),
      ]);

      const windowData = windowResponse.data?.data?.window || null;
      const overviewData = overviewResponse.data?.data || {};

      setFeedbackWindow(windowData);
      setFeedbacks(overviewData.feedbacks || []);

      const activeSem = query.semester || windowData?.semester || "";
      const activeRound = query.feedbackRound || selectedFeedbackRound || 1;

      if (activeSem) {
        try {
          const statsResponse = await api.get(`/feedback/stats/${activeSem}/${activeRound}`);
          setStats(statsResponse.data?.data || null);
        } catch (err) {
          logger.error("Error fetching stats:", err);
        }
      }

      if (isHodOrDirector) {
        try {
          const mentorResponse = await api.get(`/feedback/by-mentor/${user._id}`, {
            params: {
              semester: activeSem,
              round: activeRound,
            },
          });
          setMentorGroups(mentorResponse.data?.data?.mentors || []);
        } catch (err) {
          logger.error("Error fetching mentor groups:", err);
        }
      }

      setSemesterDraft(windowData?.semester || "");
      setRoundDraft(windowData?.feedbackRound || 1);
      setEnabledDraft(Boolean(windowData?.isEnabled));
    } catch (error) {
      logger.error("Error loading feedback management data:", error);
      enqueueSnackbar("Unable to load feedback data", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedbackData();
  }, []);

  const handleSaveWindow = async () => {
    try {
      if (enabledDraft && !semesterDraft.trim()) {
        enqueueSnackbar("Semester is required to enable feedback", { variant: "error" });
        return;
      }

      setSaving(true);

      await api.patch("/feedback/window", {
        isEnabled: enabledDraft,
        semester: semesterDraft.trim(),
        feedbackRound: roundDraft,
      });

      enqueueSnackbar("Feedback window updated", { variant: "success" });
      await loadFeedbackData({
        semester: semesterFilter.trim() || undefined,
        feedbackRound: selectedFeedbackRound,
      });
    } catch (error) {
      logger.error("Error updating feedback window:", error);
      enqueueSnackbar(error.response?.data?.message || "Failed to update feedback window", {
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleApplyFilters = async () => {
    if (!semesterFilter.trim()) {
      enqueueSnackbar("Please select a semester first", { variant: "warning" });
      return;
    }
    await loadFeedbackData({
      semester: semesterFilter.trim(),
      feedbackRound: selectedFeedbackRound,
    });
  };

  const handleOpenDrillDown = async (student) => {
    setSelectedStudent(student);
    setSelectedRound(0);
    try {
      const response = await api.get(`/feedback/student/${student.studentId}`, {
        params: {
          semester: semesterFilter,
        },
      });
      setStudentFeedbacks(response.data?.data?.feedbackByRound || {});
      setDrillDownOpen(true);
    } catch (err) {
      enqueueSnackbar("Error fetching student feedback details", { variant: "error" });
    }
  };

  const handleCloseDrillDown = () => {
    setDrillDownOpen(false);
    setSelectedStudent(null);
    setStudentFeedbacks({});
  };

  const handleOpenSidebarEditor = (feedback = null) => {
    setEditingFeedback(feedback);
    if (feedback) {
      editorMethods.reset({
        mentorAccessibility: feedback.mentorAccessibility?.toString() || "",
        mentorInteraction: feedback.mentorInteraction?.toString() || "",
        academicHelp: feedback.academicHelp?.toString() || "",
        mentorConcern: feedback.mentorConcern?.toString() || "",
        listeningSkills: feedback.listeningSkills?.toString() || "",
        professionalMotivation: feedback.professionalMotivation?.toString() || "",
        barrierResolution: feedback.barrierResolution?.toString() || "",
        systemEffectiveness: feedback.systemEffectiveness?.toString() || "",
        continuationWillingness: feedback.continuationWillingness?.toString() || "",
        awareOfPST: feedback.awareOfPST ? "yes" : "no",
        awareOfPLT: feedback.awareOfPLT ? "yes" : "no",
        remarks: feedback.remarks || "",
      });
    }
    setSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    setEditingFeedback(null);
    editorMethods.reset();
  };

  const handleSidebarSubmit = async (formData) => {
    try {
      if (editingFeedback) {
        await api.patch(`/feedback/${editingFeedback._id}`, {
          mentorAccessibility: Number(formData.mentorAccessibility),
          mentorInteraction: Number(formData.mentorInteraction),
          academicHelp: Number(formData.academicHelp),
          mentorConcern: Number(formData.mentorConcern),
          listeningSkills: Number(formData.listeningSkills),
          professionalMotivation: Number(formData.professionalMotivation),
          barrierResolution: Number(formData.barrierResolution),
          systemEffectiveness: Number(formData.systemEffectiveness),
          continuationWillingness: Number(formData.continuationWillingness),
          awareOfPST: formData.awareOfPST === "yes",
          awareOfPLT: formData.awareOfPLT === "yes",
          remarks: formData.remarks,
        });
        enqueueSnackbar("Feedback updated successfully", { variant: "success" });
      }
      handleCloseSidebar();
      await loadFeedbackData({
        semester: semesterFilter.trim(),
        feedbackRound: selectedFeedbackRound,
      });
    } catch (error) {
      logger.error("Error saving feedback:", error);
      enqueueSnackbar(error.response?.data?.message || "Error saving feedback", { variant: "error" });
    }
  };

  const filteredStudents = useMemo(() => {
    if (!searchTerm) return feedbacks;
    return feedbacks.filter((f) =>
      f.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [feedbacks, searchTerm]);

  const filteredMentorGroups = useMemo(() => {
    if (!searchTerm) return mentorGroups;
    return mentorGroups.map((group) => ({
      ...group,
      mentees: group.mentees.filter((m) =>
        m.studentName?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }));
  }, [mentorGroups, searchTerm]);

  return (
    <Page title="Feedback Management">
      <Box
        sx={{
          minHeight: "100vh",
          py: 3,
          backgroundColor: isLight
            ? alpha(theme.palette.primary.lighter, 0.35)
            : alpha(theme.palette.grey[900], 0.22),
        }}
      >
        <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 1.5, sm: 2.5 } }}>
          {/* Header */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 3 },
              borderRadius: 4,
              mb: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.08)} 100%)`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
            }}
          >
            <Stack spacing={2.5}>
              <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap">
                <Box>
                  <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: 1.4 }}>
                    Feedback Control Center
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, lineHeight: 1.15 }}>
                    Semester feedback windows and response review
                  </Typography>
                </Box>
                <Chip
                  label={canEditWindow ? "Admin control enabled" : "Read-only review"}
                  color={canEditWindow ? "primary" : "default"}
                  sx={{ fontWeight: 800, ml: "auto" }}
                />
              </Stack>

              {/* Semester Selection (Required) */}
              <Card sx={{ p: 2, borderRadius: 3, backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
                <Stack spacing={2}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Select Semester to View Feedback *
                  </Typography>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="flex-end">
                    <FormControl required sx={{ flex: 1, minWidth: 200 }}>
                      <InputLabel>Semester</InputLabel>
                      <Select
                        label="Semester"
                        value={semesterFilter}
                        onChange={(event) => setSemesterFilter(event.target.value)}
                      >
                        <MenuItem value="">
                          <em>Select a semester</em>
                        </MenuItem>
                        {user?.department === "MCA"
                          ? [1, 2, 3, 4].map((sem) => (
                              <MenuItem key={sem} value={`${sem}-2026`}>
                                Semester {sem} - 2026
                              </MenuItem>
                            ))
                          : [1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                              <MenuItem key={sem} value={`${sem}-2026`}>
                                Semester {sem} - 2026
                              </MenuItem>
                            ))}
                      </Select>
                    </FormControl>
                    <LoadingButton
                      variant="contained"
                      onClick={handleApplyFilters}
                      loading={loading}
                      sx={{ px: 4 }}
                    >
                      Load Data
                    </LoadingButton>
                  </Stack>
                </Stack>
              </Card>

              {/* Feedback Round Selection Buttons */}
              {semesterFilter && (
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5 }}>
                    Select Feedback Round
                  </Typography>
                  <Stack direction="row" spacing={2}>
                    {[1, 2].map((round) => (
                      <Button
                        key={round}
                        variant={selectedFeedbackRound === round ? "contained" : "outlined"}
                        onClick={() => {
                          setSelectedFeedbackRound(round);
                        }}
                        sx={{
                          px: 4,
                          py: 1.5,
                          fontWeight: 700,
                          minWidth: 140,
                        }}
                      >
                        Feedback {round}
                      </Button>
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Stats Display */}
              {stats && semesterFilter && (
                <Card sx={{ p: 2.5, borderRadius: 3, backgroundColor: alpha(theme.palette.success.main, 0.08), border: `2px solid ${theme.palette.success.main}` }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Stack spacing={0.5}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                          Total Enrolled
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: theme.palette.primary.main }}>
                          {stats.totalEnrolled}
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Stack spacing={0.5}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                          Responded
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: theme.palette.success.main }}>
                          {stats.responded}
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Stack spacing={0.5}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                          Response Rate
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: theme.palette.info.main }}>
                          {stats.responseRate}%
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Stack spacing={0.5}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                          Average Score
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: theme.palette.warning.main }}>
                          {stats.averageScoreOverall.toFixed(2)}/5.0
                        </Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </Card>
              )}
            </Stack>
          </Paper>

          <Grid container spacing={3}>
            {/* Admin Control Panel (Left) */}
            {canEditWindow && (
              <Grid item xs={12} md={4}>
                <Card sx={{ p: 3, borderRadius: 4, height: "100%" }}>
                  <Stack spacing={2}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      Active Window Control
                    </Typography>
                    <Divider />
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography color="text.secondary">Enable feedback</Typography>
                      <Switch
                        checked={enabledDraft}
                        onChange={(event) => setEnabledDraft(event.target.checked)}
                      />
                    </Stack>
                    <TextField
                      fullWidth
                      label="Semester"
                      value={semesterDraft}
                      onChange={(event) => setSemesterDraft(event.target.value)}
                    />
                    <FormControl fullWidth>
                      <InputLabel>Feedback round</InputLabel>
                      <Select
                        label="Feedback round"
                        value={roundDraft}
                        onChange={(event) => setRoundDraft(Number(event.target.value))}
                      >
                        {roundOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <LoadingButton
                      variant="contained"
                      loading={saving}
                      onClick={handleSaveWindow}
                    >
                      Save Window
                    </LoadingButton>
                    <Alert severity={feedbackWindow?.isEnabled ? "success" : "warning"}>
                      {feedbackWindow?.isEnabled
                        ? `Open for ${feedbackWindow.semester || "active semester"} - Feedback ${feedbackWindow.feedbackRound}`
                        : "Feedback is currently closed."}
                    </Alert>
                  </Stack>
                </Card>
              </Grid>
            )}

            {/* Main Content (Right) */}
            <Grid item xs={12} md={canEditWindow ? 8 : 12}>
              <Stack spacing={3}>
                {/* Filters Section */}
                {semesterFilter && (
                  <Card sx={{ p: 3, borderRadius: 4 }}>
                    <Stack spacing={2}>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        Filters & Search
                      </Typography>
                      <Divider />
                      <Grid container spacing={2}>
                        {/* Mentor Filter (for HOD/Director) */}
                        {isHodOrDirector && mentorGroups.length > 0 && (
                          <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                              <InputLabel>Filter by Mentor</InputLabel>
                              <Select
                                label="Filter by Mentor"
                                value={mentorFilter}
                                onChange={(event) => setMentorFilter(event.target.value)}
                              >
                                <MenuItem value="">All Mentors</MenuItem>
                                {mentorGroups.map((group) => (
                                  <MenuItem key={group.mentorId} value={group.mentorId}>
                                    {group.mentorName}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                        )}
                        {/* Search */}
                        <Grid item xs={12} md={isHodOrDirector ? 8 : 12}>
                          <TextField
                            fullWidth
                            label="Search by student name"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Type student name..."
                          />
                        </Grid>
                      </Grid>
                    </Stack>
                  </Card>
                )}

                {/* Student List Section */}
                <Card sx={{ p: 3, borderRadius: 4 }}>
                  <Stack spacing={2}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      {isHodOrDirector ? "Students by Mentor" : "Student Responses"}
                    </Typography>
                    <Divider />

                    {!semesterFilter ? (
                      <Alert severity="info">Please select a semester above to view feedback.</Alert>
                    ) : loading ? (
                      <Typography color="text.secondary">Loading feedback data...</Typography>
                    ) : isHodOrDirector && filteredMentorGroups.length > 0 ? (
                      <Stack spacing={2}>
                        {filteredMentorGroups
                          .filter((group) => !mentorFilter || group.mentorId === mentorFilter)
                          .map((group) => (
                            <Card key={group.mentorId} variant="outlined" sx={{ borderRadius: 2 }}>
                              <Box
                                sx={{
                                  p: 2,
                                  cursor: "pointer",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  "&:hover": { backgroundColor: alpha(theme.palette.primary.main, 0.05) },
                                }}
                                onClick={() =>
                                  setExpandedMentors({
                                    ...expandedMentors,
                                    [group.mentorId]: !expandedMentors[group.mentorId],
                                  })
                                }
                              >
                                <Stack>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                    {group.mentorName}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {group.menteeCount} mentees
                                  </Typography>
                                </Stack>
                                {expandedMentors[group.mentorId] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                              </Box>

                              {expandedMentors[group.mentorId] && (
                                <Stack
                                  sx={{
                                    p: 2,
                                    backgroundColor: alpha(theme.palette.primary.main, 0.02),
                                    borderTop: `1px solid ${theme.palette.divider}`,
                                  }}
                                  spacing={1.5}
                                >
                                  {group.mentees
                                    .filter((m) =>
                                      searchTerm ? m.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) : true
                                    )
                                    .map((mentee) => (
                                      <Paper key={mentee.studentId} variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                          <Stack sx={{ flex: 1 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                              {mentee.studentName}
                                            </Typography>
                                            <Stack direction="row" spacing={1}>
                                              {mentee.feedbacks?.map((fb, idx) => (
                                                <Chip
                                                  key={idx}
                                                  size="small"
                                                  label={`Feedback ${fb.feedbackRound}: ${fb.averageScore?.toFixed(2) || "N/A"}`}
                                                  color={fb.averageScore ? "primary" : "default"}
                                                  variant="outlined"
                                                />
                                              ))}
                                            </Stack>
                                          </Stack>
                                          <Stack direction="row" spacing={1}>
                                            <Button
                                              size="small"
                                              onClick={() => handleOpenDrillDown(mentee)}
                                            >
                                              Details
                                            </Button>
                                            {canEditWindow && (
                                              <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() => {
                                                  const feedback = mentee.feedbacks?.find(
                                                    (f) => f.feedbackRound === selectedFeedbackRound
                                                  );
                                                  if (feedback) handleOpenSidebarEditor(feedback);
                                                }}
                                              >
                                                Edit
                                              </Button>
                                            )}
                                          </Stack>
                                        </Stack>
                                      </Paper>
                                    ))}
                                </Stack>
                              )}
                            </Card>
                          ))}
                      </Stack>
                    ) : filteredStudents.length === 0 ? (
                      <Alert severity="info">No feedback found for the selected filters.</Alert>
                    ) : (
                      <Stack spacing={1.5}>
                        {filteredStudents.map((entry) => (
                          <Paper key={entry._id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1.5}>
                              <Stack sx={{ flex: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                  {entry.userId?.name || "Unknown user"}
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 0.5 }}>
                                  <Chip
                                    label={entry.userId?.collegeCode || "No ID"}
                                    size="small"
                                    variant="outlined"
                                  />
                                  <Chip
                                    label={entry.semester}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                  />
                                  <Chip
                                    label={`Feedback ${entry.feedbackRound}`}
                                    size="small"
                                    color="secondary"
                                    variant="outlined"
                                  />
                                  {entry.averageScore && (
                                    <Chip
                                      label={`Avg: ${entry.averageScore.toFixed(2)}`}
                                      size="small"
                                      color="success"
                                    />
                                  )}
                                </Stack>
                              </Stack>
                              <Stack direction="row" spacing={1}>
                                <Button
                                  size="small"
                                  onClick={() =>
                                    handleOpenDrillDown({
                                      studentId: entry.userId._id,
                                      studentName: entry.userId.name,
                                    })
                                  }
                                >
                                  Details
                                </Button>
                                {canEditWindow && (
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => handleOpenSidebarEditor(entry)}
                                  >
                                    Edit
                                  </Button>
                                )}
                              </Stack>
                            </Stack>
                          </Paper>
                        ))}
                      </Stack>
                    )}
                  </Stack>
                </Card>
              </Stack>
            </Grid>
          </Grid>
        </Box>

        {/* Drill-Down Modal */}
        <Dialog open={drillDownOpen} onClose={handleCloseDrillDown} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedStudent?.studentName} - Feedback Details
            <Chip label={`Sem: ${semesterFilter}`} size="small" sx={{ ml: 2 }} />
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {Object.keys(studentFeedbacks).length === 0 ? (
              <Alert severity="info">No feedback found for this student.</Alert>
            ) : (
              <Tabs value={selectedRound} onChange={(_, val) => setSelectedRound(val)}>
                {[1, 2].map((round) => (
                  <Tab
                    key={round}
                    label={`Feedback ${round}`}
                    disabled={!studentFeedbacks[round]}
                  />
                ))}
              </Tabs>
            )}

            {Object.keys(studentFeedbacks).map((round) => (
              <TabPanel key={round} value={selectedRound} index={Number(round) - 1}>
                {studentFeedbacks[round] && (
                  <Stack spacing={3}>
                    <Typography variant="h6" sx={{ fontWeight: 800, mt: 2 }}>
                      Ratings
                    </Typography>
                    <Stack spacing={2}>
                      {FEEDBACK_QUESTIONS.map((q) => (
                        <Box key={q.field}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ mb: 1 }}
                          >
                            <Typography variant="body2">{q.label}</Typography>
                            <Chip
                              label={studentFeedbacks[round][q.field] || "N/A"}
                              color="primary"
                              sx={{ fontWeight: 600 }}
                            />
                          </Stack>
                        </Box>
                      ))}
                    </Stack>

                    <Divider />

                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                        Additional Information
                      </Typography>
                      <Stack spacing={1}>
                        <Typography variant="body2">
                          <strong>PST Awareness:</strong> {studentFeedbacks[round].awareOfPST ? "Yes" : "No"}
                        </Typography>
                        <Typography variant="body2">
                          <strong>PLT Awareness:</strong> {studentFeedbacks[round].awareOfPLT ? "Yes" : "No"}
                        </Typography>
                      </Stack>
                    </Box>

                    {studentFeedbacks[round].remarks && (
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                          Remarks
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            p: 2,
                            backgroundColor: alpha(theme.palette.grey[500], 0.12),
                            borderRadius: 1,
                          }}
                        >
                          {studentFeedbacks[round].remarks}
                        </Typography>
                      </Box>
                    )}

                    <Card sx={{ p: 2, backgroundColor: alpha(theme.palette.success.main, 0.08) }}>
                      <Typography variant="body2" color="text.secondary">
                        Average Score
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{ fontWeight: 900, color: theme.palette.success.main }}
                      >
                        {studentFeedbacks[round].averageScore?.toFixed(2) || "N/A"}/5.0
                      </Typography>
                    </Card>

                    {canEditWindow && (
                      <Button
                        variant="outlined"
                        onClick={() => {
                          handleOpenSidebarEditor(studentFeedbacks[round]);
                          handleCloseDrillDown();
                        }}
                      >
                        Edit This Feedback
                      </Button>
                    )}
                  </Stack>
                )}
              </TabPanel>
            ))}
          </DialogContent>
        </Dialog>

        {/* Sidebar Editor */}
        <Drawer
          anchor="right"
          open={sidebarOpen}
          onClose={handleCloseSidebar}
          sx={{ "& .MuiDrawer-paper": { width: { xs: "100%", md: 450 } } }}
        >
          <Box sx={{ p: 3, height: "100%", overflow: "auto" }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
              {editingFeedback ? "Edit Feedback" : "Add New Feedback"}
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <FormProvider methods={editorMethods} onSubmit={editorMethods.handleSubmit(handleSidebarSubmit)}>
              <Stack spacing={2.5}>
                {FEEDBACK_QUESTIONS.map((question, idx) => (
                  <Box key={question.field}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      Q{idx + 1}. {question.label}
                    </Typography>
                    <Controller
                      name={question.field}
                      control={editorMethods.control}
                      render={({ field }) => (
                        <RadioGroup {...field} row sx={{ gap: 1.5 }}>
                          {RATING_OPTIONS.map((option) => (
                            <FormControlLabel
                              key={option.value}
                              value={option.value.toString()}
                              control={<Radio size="small" />}
                              label={`${option.value}`}
                            />
                          ))}
                        </RadioGroup>
                      )}
                    />
                  </Box>
                ))}

                <Divider />

                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    PST Awareness
                  </Typography>
                  <Controller
                    name="awareOfPST"
                    control={editorMethods.control}
                    render={({ field }) => (
                      <RadioGroup {...field} row sx={{ gap: 2 }}>
                        <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                        <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                      </RadioGroup>
                    )}
                  />
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                    PLT Awareness
                  </Typography>
                  <Controller
                    name="awareOfPLT"
                    control={editorMethods.control}
                    render={({ field }) => (
                      <RadioGroup {...field} row sx={{ gap: 2 }}>
                        <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                        <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                      </RadioGroup>
                    )}
                  />
                </Box>

                <RHFTextField
                  name="remarks"
                  label="Remarks"
                  multiline
                  minRows={3}
                  placeholder="Additional remarks..."
                />

                <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
                  <LoadingButton
                    type="submit"
                    variant="contained"
                    loading={editorMethods.formState.isSubmitting}
                    fullWidth
                  >
                    {editingFeedback ? "Update" : "Create"}
                  </LoadingButton>
                  <Button variant="outlined" onClick={handleCloseSidebar} fullWidth>
                    Cancel
                  </Button>
                </Stack>
              </Stack>
            </FormProvider>
          </Box>
        </Drawer>
      </Box>
    </Page>
  );
};

export default FeedbackManagement;
