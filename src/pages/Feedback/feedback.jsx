import React, { useState, useContext, useEffect, useMemo } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useSnackbar } from "notistack";
import api from "../../utils/axios";
import { useSearchParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import {
  Alert,
  Box,
  Card,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Button,
  Container,
  Paper,
  IconButton,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { FormProvider, RHFTextField } from "../../components/hook-form";
import { alpha, useTheme } from "@mui/material/styles";
import FeedbackOutlinedIcon from "@mui/icons-material/FeedbackOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import AssignmentLateIcon from "@mui/icons-material/AssignmentLate";
import LockIcon from "@mui/icons-material/Lock";
import AssessmentIcon from "@mui/icons-material/Assessment";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import StarsIcon from "@mui/icons-material/Stars";

import logger from "../../utils/logger.js";

// Department to semester mapping
const DEPT_SEMESTER_MAP = {
  MCA: 4,
  ISE: 8,
};

const RATING_OPTIONS = [
  { value: 1, label: "Strongly Disagree" },
  { value: 2, label: "Disagree" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Agree" },
  { value: 5, label: "Strongly Agree" },
];

const FEEDBACK_QUESTIONS = [
  {
    field: "mentorAccessibility",
    label: "Whether your mentor is accessible and available?",
  },
  {
    field: "mentorInteraction",
    label: "Does the mentor interact with you frequently?",
  },
  {
    field: "academicHelp",
    label: "Whether your mentor has helped you in academic related problems?",
  },
  {
    field: "mentorConcern",
    label: "Does your mentor demonstrate a reasonable interest/concern towards you in your quest to offer assistance?",
  },
  {
    field: "listeningSkills",
    label: "Does the mentor demonstrate concern and interest by taking time to listen and respond to queries?",
  },
  {
    field: "professionalMotivation",
    label: "Did your mentor motivate you to participate in professional activities?",
  },
  {
    field: "barrierResolution",
    label: "Any specific barrier expressed in the mentoring process was resolved?",
  },
  {
    field: "systemEffectiveness",
    label: "Whether the mentoring system is effective in facilitating the improvement in your professional performance & emotional status?",
  },
  {
    field: "continuationWillingness",
    label: "How likely do you want to continue under the same mentor in the further semesters?",
  },
];

const DEFAULT_VALUES = {
  semester: "",
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
};

const roundLabel = (round) => (round ? `Feedback ${round}` : "Feedback");

export default function FeedbackForm() {
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const targetUserId = searchParams.get("menteeId") || user?._id;
  const selectedRound = searchParams.get("round");

  const [isLoading, setIsLoading] = useState(true);
  const [feedbackWindow, setFeedbackWindow] = useState(null);
  const [isEditable, setIsEditable] = useState(false);
  const [semesterOptions, setSemesterOptions] = useState([]);
  const [averageScore, setAverageScore] = useState(null);
  const [submissionsStatus, setSubmissionsStatus] = useState({ 1: false, 2: false });

  const methods = useForm({ defaultValues: DEFAULT_VALUES });
  const {
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting },
  } = methods;

  // Watch rating fields to calculate average
  const watchedRatings = watch([
    "mentorAccessibility",
    "mentorInteraction",
    "academicHelp",
    "mentorConcern",
    "listeningSkills",
    "professionalMotivation",
    "barrierResolution",
    "systemEffectiveness",
    "continuationWillingness",
  ]);

  useEffect(() => {
    const values = watchedRatings.map((v) => Number(v)).filter((v) => v >= 1 && v <= 5);
    if (values.length === 9) {
      const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2);
      setAverageScore(Number(avg));
    } else {
      setAverageScore(null);
    }
  }, [watchedRatings]);

  useEffect(() => {
    const dept = user?.department || "";
    const maxSem = DEPT_SEMESTER_MAP[dept] || 8;
    const options = [];
    for (let i = 1; i <= maxSem; i++) {
      options.push(i.toString());
    }
    setSemesterOptions(options);
  }, [user?.department]);

  useEffect(() => {
    let mounted = true;

    const fetchFeedbackData = async () => {
      setIsLoading(true);

      try {
        const windowResponse = await api.get("/feedback/window");
        const windowData = windowResponse.data?.data?.window || null;

        if (!mounted) return;

        setFeedbackWindow(windowData);

        if (selectedRound) {
          setIsEditable(Boolean(windowData?.isEnabled && windowData?.feedbackRound?.toString() === selectedRound));
        } else {
          setIsEditable(false);
        }

        if (windowData?.semester && semesterOptions.length > 0) {
          const semester = windowData.semester.toString();
          if (semesterOptions.includes(semester)) {
            methods.setValue("semester", semester);
          }
        }

        if (targetUserId) {
          try {
            const feedbackResponse = await api.get(`/feedback/student/${targetUserId}`, {
              params: {
                semester: windowData?.semester || undefined,
              },
            });
            
            const feedbackByRound = feedbackResponse.data?.data?.feedbackByRound || {};
            setSubmissionsStatus({
              1: !!feedbackByRound[1],
              2: !!feedbackByRound[2],
            });

            if (selectedRound) {
              const feedbackData = feedbackByRound[selectedRound] || null;

              if (feedbackData) {
                reset({
                  semester: feedbackData.semester?.toString() || "",
                  mentorAccessibility: feedbackData.mentorAccessibility?.toString() || "",
                  mentorInteraction: feedbackData.mentorInteraction?.toString() || "",
                  academicHelp: feedbackData.academicHelp?.toString() || "",
                  mentorConcern: feedbackData.mentorConcern?.toString() || "",
                  listeningSkills: feedbackData.listeningSkills?.toString() || "",
                  professionalMotivation: feedbackData.professionalMotivation?.toString() || "",
                  barrierResolution: feedbackData.barrierResolution?.toString() || "",
                  systemEffectiveness: feedbackData.systemEffectiveness?.toString() || "",
                  continuationWillingness: feedbackData.continuationWillingness?.toString() || "",
                  awareOfPST: feedbackData.awareOfPST ? "yes" : "no",
                  awareOfPLT: feedbackData.awareOfPLT ? "yes" : "no",
                  remarks: feedbackData.remarks || "",
                });
              } else {
                reset({ ...DEFAULT_VALUES, semester: windowData?.semester?.toString() || "" });
              }
            }
          } catch (err) {
            if (err?.response?.status !== 404) {
              logger.error("Error fetching feedback:", err);
            }
            if (selectedRound) {
              reset({ ...DEFAULT_VALUES, semester: windowData?.semester?.toString() || "" });
            }
          }
        }
      } catch (err) {
        logger.error("Error fetching feedback window:", err);
        enqueueSnackbar("Unable to load feedback window", { variant: "error" });
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchFeedbackData();
    return () => { mounted = false; };
  }, [targetUserId, enqueueSnackbar, reset, semesterOptions, methods, selectedRound]);

  const onSubmit = async (formData) => {
    try {
      if (!targetUserId) {
        enqueueSnackbar("User ID is required", { variant: "error" });
        return;
      }

      if (!feedbackWindow?.isEnabled) {
        enqueueSnackbar("Feedback is currently disabled", { variant: "warning" });
        return;
      }

      for (const question of FEEDBACK_QUESTIONS) {
        if (!formData[question.field]) {
          enqueueSnackbar(`Please rate: ${question.label}`, { variant: "warning" });
          return;
        }
      }

      const requestData = {
        userId: targetUserId,
        semester: Number(formData.semester),
        feedbackRound: Number(selectedRound),
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
        remarks: formData.remarks || "",
      };

      const response = await api.post("/feedback", requestData);
      const savedFeedback = response.data?.data?.feedback || null;

      if (savedFeedback) {
        reset({
          semester: savedFeedback.semester?.toString(),
          mentorAccessibility: savedFeedback.mentorAccessibility?.toString() || "",
          mentorInteraction: savedFeedback.mentorInteraction?.toString() || "",
          academicHelp: savedFeedback.academicHelp?.toString() || "",
          mentorConcern: savedFeedback.mentorConcern?.toString() || "",
          listeningSkills: savedFeedback.listeningSkills?.toString() || "",
          professionalMotivation: savedFeedback.professionalMotivation?.toString() || "",
          barrierResolution: savedFeedback.barrierResolution?.toString() || "",
          systemEffectiveness: savedFeedback.systemEffectiveness?.toString() || "",
          continuationWillingness: savedFeedback.continuationWillingness?.toString() || "",
          awareOfPST: savedFeedback.awareOfPST ? "yes" : "no",
          awareOfPLT: savedFeedback.awareOfPLT ? "yes" : "no",
          remarks: savedFeedback.remarks || "",
        });
      }

      enqueueSnackbar(`Feedback saved successfully! Average: ${savedFeedback?.averageScore?.toFixed(2) || "N/A"}/5.0`, {
        variant: "success",
      });
      
      // Update submission status
      setSubmissionsStatus(prev => ({ ...prev, [selectedRound]: true }));
      setIsEditable(false);
    } catch (error) {
      logger.error("Error saving feedback:", error);
      enqueueSnackbar(error.response?.data?.message || "An error occurred while saving feedback", { variant: "error" });
    }
  };

  const handleSelectRound = (round, isAvailable) => {
    if (!isAvailable) {
      enqueueSnackbar("This feedback round is not active for submission.", { variant: "info" });
      return;
    }
    const params = new URLSearchParams(searchParams);
    params.set("round", round);
    setSearchParams(params);
  };

  const handleBackToSelection = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("round");
    setSearchParams(params);
    setAverageScore(null);
  };

  if (!selectedRound) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          backgroundColor: isLight ? alpha(theme.palette.primary.lighter, 0.2) : theme.palette.background.default,
          py: { xs: 6, md: 10 },
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ mb: 8, textAlign: "center" }}>
            <Typography variant="h2" sx={{ fontWeight: 900, mb: 2, letterSpacing: -1 }}>
              Student Mentoring Feedback
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500, maxWidth: 600, mx: "auto" }}>
              Please select the appropriate feedback round to submit your response or view previous submissions.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {[1, 2].map((round) => {
              const isCurrent = feedbackWindow?.feedbackRound === round;
              const isSubmitted = submissionsStatus[round];
              const isSubmissionOpen = isCurrent && feedbackWindow?.isEnabled;
              const isAvailable = isSubmissionOpen || isSubmitted;

              return (
                <Grid item xs={12} sm={6} key={round}>
                  <Card
                    onClick={() => handleSelectRound(round, isAvailable)}
                    sx={{
                      p: 5,
                      cursor: isAvailable ? "pointer" : "default",
                      textAlign: "center",
                      borderRadius: 4,
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                      position: "relative",
                      overflow: "hidden",
                      border: `1px solid ${theme.palette.divider}`,
                      backgroundColor: isAvailable 
                        ? (isLight ? "#fff" : alpha(theme.palette.grey[800], 0.5))
                        : alpha(theme.palette.grey[500], 0.05),
                      "&:hover": isAvailable ? {
                        transform: "translateY(-12px)",
                        boxShadow: theme.customShadows?.z24,
                        borderColor: theme.palette.primary.main,
                        "& .icon-box": {
                          backgroundColor: theme.palette.primary.main,
                          color: "#fff",
                          transform: "scale(1.1) rotate(8deg)",
                        },
                      } : {},
                    }}
                  >
                    {isCurrent && feedbackWindow?.isEnabled && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 18,
                          right: -35,
                          backgroundColor: theme.palette.success.main,
                          color: "#fff",
                          px: 6,
                          py: 0.75,
                          transform: "rotate(45deg)",
                          fontSize: "0.75rem",
                          fontWeight: 900,
                          zIndex: 2,
                          boxShadow: theme.customShadows?.success,
                        }}
                      >
                        LIVE NOW
                      </Box>
                    )}

                    <Box
                      className="icon-box"
                      sx={{
                        width: 90,
                        height: 90,
                        borderRadius: 3,
                        backgroundColor: isAvailable ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.grey[500], 0.1),
                        color: isAvailable ? theme.palette.primary.main : theme.palette.text.disabled,
                        display: "grid",
                        placeItems: "center",
                        mx: "auto",
                        mb: 4,
                        transition: "all 0.4s ease",
                      }}
                    >
                      {isSubmitted ? (
                        <AssignmentTurnedInIcon sx={{ fontSize: 48 }} />
                      ) : !isAvailable ? (
                        <LockIcon sx={{ fontSize: 48 }} />
                      ) : (
                        <FeedbackOutlinedIcon sx={{ fontSize: 48 }} />
                      )}
                    </Box>

                    <Typography variant="h3" sx={{ fontWeight: 900, mb: 1.5, color: isAvailable ? "text.primary" : "text.disabled" }}>
                      Round {round}
                    </Typography>

                    <Stack spacing={1.5} alignItems="center">
                      <Chip
                        icon={isSubmitted ? <AssignmentTurnedInIcon /> : isSubmissionOpen ? <FeedbackOutlinedIcon /> : <LockIcon />}
                        label={isSubmitted ? "Submitted" : isSubmissionOpen ? "Open for Response" : "Closed"}
                        color={isSubmitted ? "success" : isSubmissionOpen ? "primary" : "default"}
                        variant={isAvailable ? "filled" : "outlined"}
                        sx={{ fontWeight: 800, height: 32 }}
                      />
                      
                      {!isAvailable && (
                        <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 700 }}>
                          This window is not yet active
                        </Typography>
                      )}
                    </Stack>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: isLight ? alpha(theme.palette.primary.lighter, 0.1) : theme.palette.background.default, py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBackToSelection}
            sx={{ fontWeight: 800, borderRadius: 2 }}
          >
            Back to Rounds
          </Button>
          <Chip
            icon={<StarsIcon />}
            label={`Semester ${methods.watch("semester") || feedbackWindow?.semester}`}
            variant="outlined"
            color="primary"
            sx={{ fontWeight: 800 }}
          />
        </Box>

        <Card
          sx={{
            p: { xs: 3, md: 5 },
            mb: 4,
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
          }}
        >
          <Box sx={{ position: 'absolute', top: -20, right: -20, opacity: 0.03 }}>
            <FeedbackOutlinedIcon sx={{ fontSize: 200 }} />
          </Box>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center">
            <Box sx={{ flex: 1 }}>
              <Typography variant="overline" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: 2 }}>
                Mentoring Feedback - Round {selectedRound}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, mb: 1 }}>
                {isEditable ? "Help us Improve" : "Feedback Summary"}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem', maxWidth: 600 }}>
                {isEditable
                  ? "Your honest input is vital for enhancing our mentoring ecosystem. All responses are kept confidential."
                  : "You have already completed this feedback cycle. Your responses are recorded for quality assurance."}
              </Typography>
            </Box>

            {averageScore !== null && (
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  textAlign: 'center',
                  minWidth: 160,
                  border: `2px solid ${alpha(theme.palette.success.main, 0.2)}`,
                  backgroundColor: alpha(theme.palette.success.main, 0.05),
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'success.main', display: 'block', mb: 0.5 }}>
                  AVERAGE SCORE
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: 900, color: 'success.main', lineHeight: 1 }}>
                  {averageScore.toFixed(2)}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                  OUT OF 5.0
                </Typography>
              </Paper>
            )}
          </Stack>
        </Card>

        {isLoading ? (
          <Box sx={{ textAlign: "center", py: 10 }}>
            <Typography variant="h6" color="text.secondary">Loading form data...</Typography>
          </Box>
        ) : (
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={4}>
              {/* Main Questions Section */}
              <Card sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, border: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <AssessmentIcon color="primary" /> Mentoring Assessment
                </Typography>
                
                <Stack spacing={5}>
                  {FEEDBACK_QUESTIONS.map((question, idx) => (
                    <Box key={question.field}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2, display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <Box sx={{ color: 'primary.main', opacity: 0.5 }}>{idx + 1}.</Box>
                        {question.label}
                      </Typography>
                      
                      <Controller
                        name={question.field}
                        control={methods.control}
                        render={({ field }) => (
                          <RadioGroup {...field} row sx={{ ml: 3.5, gap: { xs: 1, sm: 3 } }}>
                            {RATING_OPTIONS.map((option) => (
                              <FormControlLabel
                                key={option.value}
                                value={option.value.toString()}
                                control={<Radio size="small" disabled={!isEditable} color="primary" />}
                                label={
                                  <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1 }}>{option.value}</Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>{option.label}</Typography>
                                  </Box>
                                }
                                sx={{ 
                                  mr: 0,
                                  p: 1.5,
                                  borderRadius: 2,
                                  border: `1px solid ${field.value === option.value.toString() ? theme.palette.primary.main : 'transparent'}`,
                                  backgroundColor: field.value === option.value.toString() ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                                  transition: 'all 0.2s',
                                  '&:hover': isEditable ? { backgroundColor: alpha(theme.palette.primary.main, 0.05) } : {}
                                }}
                              />
                            ))}
                          </RadioGroup>
                        )}
                      />
                    </Box>
                  ))}
                </Stack>
              </Card>

              {/* Awareness Section */}
              <Card sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, border: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <HelpOutlineIcon color="primary" /> Class Awareness
                </Typography>

                <Grid container spacing={4}>
                  {[
                    { field: "awareOfPST", label: "Are you aware of PST (Peer Support Team) members of your class?" },
                    { field: "awareOfPLT", label: "Are you aware of PLT (Peer Learning Team) members of your class?" }
                  ].map((item) => (
                    <Grid item xs={12} md={6} key={item.field}>
                      <Box sx={{ p: 3, borderRadius: 3, backgroundColor: alpha(theme.palette.grey[500], 0.03), border: `1px solid ${theme.palette.divider}` }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}>{item.label}</Typography>
                        <Controller
                          name={item.field}
                          control={methods.control}
                          render={({ field }) => (
                            <RadioGroup {...field} row sx={{ gap: 4 }}>
                              <FormControlLabel value="yes" control={<Radio disabled={!isEditable} />} label="Yes" />
                              <FormControlLabel value="no" control={<Radio disabled={!isEditable} />} label="No" />
                            </RadioGroup>
                          )}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Card>

              {/* Remarks Section */}
              <Card sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, border: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>Final Thoughts</Typography>
                <RHFTextField
                  name="remarks"
                  label="Suggestions or Additional Remarks"
                  fullWidth
                  disabled={!isEditable}
                  multiline
                  minRows={4}
                  placeholder="Is there anything else you'd like to share regarding the mentoring system?"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Card>

              {/* Actions */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', pb: 8 }}>
                {isEditable ? (
                  <LoadingButton
                    type="submit"
                    variant="contained"
                    size="large"
                    loading={isSubmitting}
                    disabled={!feedbackWindow?.isEnabled}
                    sx={{ px: 8, py: 1.5, borderRadius: 2, fontWeight: 800, fontSize: '1.1rem', boxShadow: theme.customShadows?.primary }}
                  >
                    Submit Feedback
                  </LoadingButton>
                ) : (
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={handleBackToSelection}
                    sx={{ px: 6, py: 1.5, borderRadius: 2, fontWeight: 800 }}
                  >
                    Return to Overview
                  </Button>
                )}
              </Box>
            </Stack>
          </FormProvider>
        )}
      </Container>
    </Box>
  );
}
