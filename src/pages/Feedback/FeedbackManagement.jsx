import React, { useState, useEffect, useMemo, useContext } from "react";
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
  IconButton,
  InputAdornment,
  Container,
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
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import SettingsIcon from "@mui/icons-material/Settings";
import AssessmentIcon from "@mui/icons-material/Assessment";
import GroupIcon from "@mui/icons-material/Group";
import UpdateIcon from "@mui/icons-material/Update";

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
      f.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.userId?.collegeCode?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [feedbacks, searchTerm]);

  const filteredMentorGroups = useMemo(() => {
    if (!searchTerm) return mentorGroups;
    return mentorGroups.map((group) => ({
      ...group,
      mentees: group.mentees.filter((m) =>
        m.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }));
  }, [mentorGroups, searchTerm]);

  return (
    <Page title="Feedback Management">
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={4}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                Feedback Control Center
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage feedback windows and analyze student responses.
              </Typography>
            </Box>
            <Chip
              icon={<AssessmentIcon />}
              label={canEditWindow ? "Administrator" : "Viewer"}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 700 }}
            />
          </Box>

          <Grid container spacing={3}>
            {/* Window Control Card (ADMIN ONLY) */}
            {canEditWindow && (
              <Grid item xs={12} lg={4}>
                <Card
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    height: "100%",
                    boxShadow: theme.customShadows?.z12,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: -10,
                      right: -10,
                      opacity: 0.05,
                      transform: "rotate(15deg)",
                    }}
                  >
                    <SettingsIcon sx={{ fontSize: 160 }} />
                  </Box>

                  <Stack spacing={3} sx={{ position: "relative" }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 1.5,
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                        }}
                      >
                        <UpdateIcon />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        Window Control
                      </Typography>
                    </Stack>

                    <Divider />

                    <Stack spacing={2.5}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Target Semester</InputLabel>
                        <Select
                          label="Target Semester"
                          value={semesterDraft}
                          onChange={(e) => setSemesterDraft(e.target.value)}
                        >
                          {(user?.department === "MCA" ? [1, 2, 3, 4] : [1, 2, 3, 4, 5, 6, 7, 8]).map((sem) => (
                            <MenuItem key={sem} value={sem.toString()}>
                              Semester {sem}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl fullWidth size="small">
                        <InputLabel>Feedback Round</InputLabel>
                        <Select
                          label="Feedback Round"
                          value={roundDraft}
                          onChange={(e) => setRoundDraft(Number(e.target.value))}
                        >
                          <MenuItem value={1}>Feedback 1</MenuItem>
                          <MenuItem value={2}>Feedback 2</MenuItem>
                        </Select>
                      </FormControl>

                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          backgroundColor: alpha(enabledDraft ? theme.palette.success.main : theme.palette.grey[500], 0.05),
                          borderColor: alpha(enabledDraft ? theme.palette.success.main : theme.palette.grey[500], 0.2),
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                              Active Status
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {enabledDraft ? "Students can submit" : "Submissions disabled"}
                            </Typography>
                          </Box>
                          <Switch
                            checked={enabledDraft}
                            color="success"
                            onChange={(e) => setEnabledDraft(e.target.checked)}
                          />
                        </Stack>
                      </Paper>

                      <LoadingButton
                        fullWidth
                        variant="contained"
                        size="large"
                        loading={saving}
                        onClick={handleSaveWindow}
                        sx={{ fontWeight: 800, borderRadius: 2 }}
                      >
                        Apply Changes
                      </LoadingButton>

                      <Alert
                        severity={feedbackWindow?.isEnabled ? "success" : "info"}
                        sx={{ borderRadius: 2, fontWeight: 600 }}
                      >
                        {feedbackWindow?.isEnabled
                          ? `Live: Semester ${feedbackWindow.semester} - Round ${feedbackWindow.feedbackRound}`
                          : "No active feedback window"}
                      </Alert>
                    </Stack>
                  </Stack>
                </Card>
              </Grid>
            )}

            {/* Stats & Filters */}
            <Grid item xs={12} lg={canEditWindow ? 8 : 12}>
              <Stack spacing={3}>
                {/* Stats Cards */}
                {stats && (
                  <Grid container spacing={2}>
                    {[
                      { label: "Responded", value: stats.responded, color: "success", icon: <GroupIcon /> },
                      { label: "Enrolled", value: stats.totalEnrolled, color: "primary", icon: <GroupIcon /> },
                      { label: "Response Rate", value: `${stats.responseRate}%`, color: "info", icon: <AssessmentIcon /> },
                      { label: "Avg. Score", value: `${stats.averageScoreOverall.toFixed(2)}/5.0`, color: "warning", icon: <AssessmentIcon /> },
                    ].map((s) => (
                      <Grid item xs={6} sm={3} key={s.label}>
                        <Card sx={{ p: 2, textAlign: "center", borderRadius: 3, border: `1px solid ${alpha(theme.palette[s.color].main, 0.15)}`, backgroundColor: alpha(theme.palette[s.color].main, 0.05) }}>
                          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 800 }}>{s.label}</Typography>
                          <Typography variant="h4" sx={{ fontWeight: 900, color: theme.palette[s.color].main }}>{s.value}</Typography>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}

                {/* Filter Toolbar */}
                <Card sx={{ p: 3, borderRadius: 3, boxShadow: theme.customShadows?.z8 }}>
                  <Stack spacing={3}>
                    {/* Row 1: Data View Filters */}
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 700, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FilterListIcon fontSize="small" /> Data View Filters
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                          <FormControl fullWidth size="small">
                            <InputLabel>View Semester</InputLabel>
                            <Select
                              label="View Semester"
                              value={semesterFilter}
                              onChange={(e) => setSemesterFilter(e.target.value)}
                            >
                              {(user?.department === "MCA" ? [1, 2, 3, 4] : [1, 2, 3, 4, 5, 6, 7, 8]).map((sem) => (
                                <MenuItem key={sem} value={sem.toString()}>
                                  Semester {sem}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <FormControl fullWidth size="small">
                            <InputLabel>View Round</InputLabel>
                            <Select
                              label="View Round"
                              value={selectedFeedbackRound}
                              onChange={(e) => setSelectedFeedbackRound(Number(e.target.value))}
                            >
                              <MenuItem value={1}>Feedback 1</MenuItem>
                              <MenuItem value={2}>Feedback 2</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <LoadingButton
                            fullWidth
                            variant="contained"
                            loading={loading}
                            onClick={handleApplyFilters}
                            sx={{ height: 40, fontWeight: 700 }}
                          >
                            Update Results
                          </LoadingButton>
                        </Grid>
                      </Grid>
                    </Box>

                    <Divider />

                    {/* Row 2: Search & Mentor Filter */}
                    <Box>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={isHodOrDirector ? 6 : 12}>
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="Search student by name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <SearchIcon color="disabled" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        {isHodOrDirector && (
                          <Grid item xs={12} sm={6}>
                            <FormControl fullWidth size="small">
                              <InputLabel>Filter by Mentor</InputLabel>
                              <Select
                                label="Filter by Mentor"
                                value={mentorFilter}
                                onChange={(e) => setMentorFilter(e.target.value)}
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
                      </Grid>
                    </Box>
                  </Stack>
                </Card>
              </Stack>
            </Grid>
          </Grid>

          {/* Results Section */}
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, display: "flex", alignItems: "center", gap: 1.5 }}>
              <AssessmentIcon color="primary" />
              Response Analysis
            </Typography>

            {!semesterFilter ? (
              <Paper sx={{ p: 8, textAlign: "center", borderRadius: 4, backgroundColor: alpha(theme.palette.grey[500], 0.05), border: `2px dashed ${theme.palette.divider}` }}>
                <Typography variant="h6" color="text.secondary">Please select a semester and click "Update Results" to view feedback data.</Typography>
              </Paper>
            ) : loading ? (
              <Stack spacing={2}>
                {[1, 2, 3].map((i) => (
                  <Card key={i} sx={{ p: 4, borderRadius: 2, opacity: 0.5, border: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="body2">Loading feedback records...</Typography>
                  </Card>
                ))}
              </Stack>
            ) : (
              <Box>
                {isHodOrDirector ? (
                  <Stack spacing={3}>
                    {filteredMentorGroups
                      .filter((group) => !mentorFilter || group.mentorId === mentorFilter)
                      .map((group) => (
                        <Card key={group.mentorId} sx={{ borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.8)}`, overflow: 'hidden' }}>
                          <Box
                            sx={{
                              p: 2.5,
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              backgroundColor: alpha(theme.palette.primary.main, 0.03),
                              cursor: "pointer",
                              '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.06) }
                            }}
                            onClick={() =>
                              setExpandedMentors({
                                ...expandedMentors,
                                [group.mentorId]: !expandedMentors[group.mentorId],
                              })
                            }
                          >
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Box
                                sx={{
                                  width: 44,
                                  height: 44,
                                  borderRadius: 1.5,
                                  backgroundColor: theme.palette.primary.main,
                                  color: "#fff",
                                  display: "grid",
                                  placeItems: "center",
                                  fontWeight: 800,
                                  boxShadow: theme.customShadows?.primary
                                }}
                              >
                                {group.mentorName?.charAt(0)}
                              </Box>
                              <Box>
                                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{group.mentorName}</Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{group.menteeCount} Mentees assigned</Typography>
                              </Box>
                            </Stack>
                            {expandedMentors[group.mentorId] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </Box>

                          {expandedMentors[group.mentorId] && (
                            <Box sx={{ p: 2, backgroundColor: alpha(theme.palette.background.neutral, 0.5) }}>
                              <Grid container spacing={2}>
                                {group.mentees.length === 0 ? (
                                  <Grid item xs={12}>
                                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>No mentees found matching search.</Typography>
                                  </Grid>
                                ) : (
                                  group.mentees.map((mentee) => (
                                    <Grid item xs={12} md={6} key={mentee.studentId}>
                                      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, "&:hover": { borderColor: theme.palette.primary.main, boxShadow: theme.customShadows?.z4 } }}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                          <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{mentee.studentName}</Typography>
                                            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                                              {mentee.feedbacks?.map((fb, idx) => (
                                                <Chip
                                                  key={idx}
                                                  size="small"
                                                  label={`R${fb.feedbackRound}: ${fb.averageScore?.toFixed(1) || "N/A"}`}
                                                  color={fb.feedbackRound === selectedFeedbackRound ? "primary" : "default"}
                                                  variant={fb.feedbackRound === selectedFeedbackRound ? "filled" : "outlined"}
                                                  sx={{ height: 20, fontSize: "0.65rem", fontWeight: 800 }}
                                                />
                                              ))}
                                            </Stack>
                                          </Box>
                                          <Stack direction="row" spacing={1}>
                                            <Button size="small" variant="contained" onClick={() => handleOpenDrillDown(mentee)} sx={{ borderRadius: 1.5 }}>Details</Button>
                                            {canEditWindow && (
                                              <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() => {
                                                  const feedback = mentee.feedbacks?.find(f => f.feedbackRound === selectedFeedbackRound);
                                                  if (feedback) handleOpenSidebarEditor(feedback);
                                                }}
                                                sx={{ borderRadius: 1.5 }}
                                              >
                                                Edit
                                              </Button>
                                            )}
                                          </Stack>
                                        </Stack>
                                      </Paper>
                                    </Grid>
                                  ))
                                )}
                              </Grid>
                            </Box>
                          )}
                        </Card>
                      ))}
                  </Stack>
                ) : (
                  <Grid container spacing={2}>
                    {filteredStudents.length === 0 ? (
                      <Grid item xs={12}>
                        <Alert severity="warning" sx={{ borderRadius: 2 }}>No responses found for your current search/filters.</Alert>
                      </Grid>
                    ) : (
                      filteredStudents.map((entry) => (
                        <Grid item xs={12} md={6} lg={4} key={entry._id}>
                          <Card
                            sx={{
                              p: 2.5,
                              borderRadius: 3,
                              border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                              transition: "all 0.2s",
                              "&:hover": {
                                transform: "translateY(-4px)",
                                boxShadow: theme.customShadows?.z12,
                                borderColor: theme.palette.primary.main,
                              },
                            }}
                          >
                            <Stack spacing={2}>
                              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                <Box>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{entry.userId?.name}</Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>{entry.userId?.collegeCode}</Typography>
                                </Box>
                                <Box sx={{ textAlign: "right" }}>
                                  <Typography variant="h4" sx={{ fontWeight: 900, color: theme.palette.success.main }}>
                                    {entry.averageScore?.toFixed(2)}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">Avg Score</Typography>
                                </Box>
                              </Stack>
                              
                              <Stack direction="row" spacing={1}>
                                <Chip label={`Semester ${entry.semester}`} size="small" variant="outlined" sx={{ fontWeight: 700 }} />
                                <Chip label={`Round ${entry.feedbackRound}`} size="small" color="secondary" variant="outlined" sx={{ fontWeight: 700 }} />
                              </Stack>

                              <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
                                <Button 
                                  fullWidth 
                                  variant="contained" 
                                  size="small" 
                                  onClick={() => handleOpenDrillDown({ studentId: entry.userId._id, studentName: entry.userId.name })} 
                                  sx={{ borderRadius: 1.5, fontWeight: 700 }}
                                >
                                  View Details
                                </Button>
                                {canEditWindow && (
                                  <IconButton 
                                    size="small" 
                                    onClick={() => handleOpenSidebarEditor(entry)} 
                                    sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1), borderRadius: 1.5, '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.2) } }}
                                  >
                                    <SettingsIcon fontSize="small" color="primary" />
                                  </IconButton>
                                )}
                              </Stack>
                            </Stack>
                          </Card>
                        </Grid>
                      ))
                    )}
                  </Grid>
                )}
              </Box>
            )}
          </Box>
        </Stack>

        {/* Drill-Down Modal */}
        <Dialog open={drillDownOpen} onClose={handleCloseDrillDown} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle sx={{ p: 3, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {selectedStudent?.studentName} <Typography component="span" variant="body1" color="text.secondary">Feedback Details</Typography>
            </Typography>
            <Chip label={`Semester ${semesterFilter}`} color="primary" variant="outlined" sx={{ fontWeight: 700 }} />
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            {Object.keys(studentFeedbacks).length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 2 }}>No feedback found for this student in the selected semester.</Alert>
            ) : (
              <>
                <Tabs 
                  value={selectedRound} 
                  onChange={(_, val) => setSelectedRound(val)}
                  sx={{ 
                    mb: 3, 
                    borderBottom: 1, 
                    borderColor: 'divider',
                    '& .MuiTab-root': { fontWeight: 700, fontSize: '1rem' }
                  }}
                >
                  {[1, 2].map((round) => (
                    <Tab
                      key={round}
                      label={`Feedback Round ${round}`}
                      disabled={!studentFeedbacks[round]}
                    />
                  ))}
                </Tabs>

                {Object.keys(studentFeedbacks).map((round) => (
                  <TabPanel key={round} value={selectedRound} index={Number(round) - 1}>
                    {studentFeedbacks[round] && (
                      <Stack spacing={4}>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, color: 'primary.main' }}>
                            Performance Metrics
                          </Typography>
                          <Stack spacing={2}>
                            {FEEDBACK_QUESTIONS.map((q) => (
                              <Box key={q.field}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{q.label}</Typography>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                                      {studentFeedbacks[round][q.field]}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">/ 5</Typography>
                                  </Box>
                                </Stack>
                                <Paper sx={{ height: 6, width: '100%', bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 3, overflow: 'hidden' }}>
                                  <Box sx={{ height: '100%', width: `${(studentFeedbacks[round][q.field] / 5) * 100}%`, bgcolor: 'primary.main', borderRadius: 3 }} />
                                </Paper>
                              </Box>
                            ))}
                          </Stack>
                        </Box>

                        <Divider />

                        <Grid container spacing={3}>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>Awareness Check</Typography>
                            <Stack spacing={1.5}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.05), border: `1px solid ${alpha(theme.palette.info.main, 0.1)}` }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>Aware of PST?</Typography>
                                <Chip label={studentFeedbacks[round].awareOfPST ? "Yes" : "No"} size="small" color={studentFeedbacks[round].awareOfPST ? "success" : "error"} sx={{ fontWeight: 800 }} />
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.05), border: `1px solid ${alpha(theme.palette.info.main, 0.1)}` }}>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>Aware of PLT?</Typography>
                                <Chip label={studentFeedbacks[round].awareOfPLT ? "Yes" : "No"} size="small" color={studentFeedbacks[round].awareOfPLT ? "success" : "error"} sx={{ fontWeight: 800 }} />
                              </Box>
                            </Stack>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>Summary Score</Typography>
                            <Card sx={{ p: 2.5, bgcolor: alpha(theme.palette.success.main, 0.05), border: `1px solid ${alpha(theme.palette.success.main, 0.15)}`, textAlign: 'center' }}>
                              <Typography variant="overline" color="success.main" sx={{ fontWeight: 800 }}>Overall Satisfaction</Typography>
                              <Typography variant="h3" sx={{ fontWeight: 900, color: theme.palette.success.main }}>
                                {studentFeedbacks[round].averageScore?.toFixed(2) || "N/A"}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">out of 5.0</Typography>
                            </Card>
                          </Grid>
                        </Grid>

                        {studentFeedbacks[round].remarks && (
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>Student Remarks</Typography>
                            <Paper sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                              <Typography variant="body2" sx={{ fontStyle: 'italic' }}>"{studentFeedbacks[round].remarks}"</Typography>
                            </Paper>
                          </Box>
                        )}

                        {canEditWindow && (
                          <Button
                            variant="outlined"
                            startIcon={<SettingsIcon />}
                            onClick={() => {
                              handleOpenSidebarEditor(studentFeedbacks[round]);
                              handleCloseDrillDown();
                            }}
                            fullWidth
                            sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}
                          >
                            Modify This Feedback Entry
                          </Button>
                        )}
                      </Stack>
                    )}
                  </TabPanel>
                ))}
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Sidebar Editor */}
        <Drawer
          anchor="right"
          open={sidebarOpen}
          onClose={handleCloseSidebar}
          PaperProps={{ sx: { width: { xs: "100%", md: 480 }, borderRadius: '16px 0 0 16px' } }}
        >
          <Box sx={{ p: 4, height: "100%", display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                {editingFeedback ? "Update Feedback" : "Create Feedback Entry"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manually adjust or review student feedback responses.
              </Typography>
            </Box>
            
            <Divider sx={{ mb: 4 }} />

            <Box sx={{ flex: 1, overflowY: "auto", pr: 1 }}>
              <FormProvider methods={editorMethods} onSubmit={editorMethods.handleSubmit(handleSidebarSubmit)}>
                <Stack spacing={4}>
                  {FEEDBACK_QUESTIONS.map((question, idx) => (
                    <Box key={question.field}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 24, height: 24, bgcolor: 'primary.main', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>
                          {idx + 1}
                        </Box>
                        {question.label}
                      </Typography>
                      <Controller
                        name={question.field}
                        control={editorMethods.control}
                        render={({ field }) => (
                          <RadioGroup {...field} row sx={{ justifyContent: 'space-between', px: 1 }}>
                            {RATING_OPTIONS.map((option) => (
                              <FormControlLabel
                                key={option.value}
                                value={option.value.toString()}
                                control={<Radio size="small" />}
                                label={
                                  <Typography variant="caption" sx={{ fontWeight: 700 }}>{option.value}</Typography>
                                }
                                labelPlacement="bottom"
                                sx={{ m: 0 }}
                              />
                            ))}
                          </RadioGroup>
                        )}
                      />
                    </Box>
                  ))}

                  <Divider />

                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Program Awareness</Typography>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">PST Awareness</Typography>
                        <Controller
                          name="awareOfPST"
                          control={editorMethods.control}
                          render={({ field }) => (
                            <RadioGroup {...field} row>
                              <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                              <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                            </RadioGroup>
                          )}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">PLT Awareness</Typography>
                        <Controller
                          name="awareOfPLT"
                          control={editorMethods.control}
                          render={({ field }) => (
                            <RadioGroup {...field} row>
                              <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
                              <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
                            </RadioGroup>
                          )}
                        />
                      </Box>
                    </Stack>
                  </Box>

                  <RHFTextField
                    name="remarks"
                    label="Additional Remarks"
                    multiline
                    minRows={4}
                    placeholder="Enter any qualitative feedback or notes..."
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />

                  <Box sx={{ pt: 2, pb: 4 }}>
                    <Stack direction="row" spacing={2}>
                      <LoadingButton
                        type="submit"
                        variant="contained"
                        size="large"
                        loading={editorMethods.formState.isSubmitting}
                        fullWidth
                        sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}
                      >
                        {editingFeedback ? "Save Changes" : "Create Entry"}
                      </LoadingButton>
                      <Button 
                        variant="outlined" 
                        size="large" 
                        onClick={handleCloseSidebar} 
                        fullWidth
                        sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}
                      >
                        Cancel
                      </Button>
                    </Stack>
                  </Box>
                </Stack>
              </FormProvider>
            </Box>
          </Box>
        </Drawer>
      </Container>
    </Page>
  );
};

export default FeedbackManagement;
