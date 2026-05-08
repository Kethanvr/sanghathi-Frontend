import React, { useState, useContext, useEffect } from "react";
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
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { FormProvider, RHFTextField } from "../../components/hook-form";
import { alpha, useTheme } from "@mui/material/styles";
import FeedbackOutlinedIcon from "@mui/icons-material/FeedbackOutlined";

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
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get("menteeId") || user?._id;

  const [isLoading, setIsLoading] = useState(true);
  const [feedbackWindow, setFeedbackWindow] = useState(null);
  const [isEditable, setIsEditable] = useState(false);
  const [semesterOptions, setSemesterOptions] = useState([]);
  const [averageScore, setAverageScore] = useState(null);

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
    // Generate semester options based on department
    const dept = user?.department || "";
    const maxSem = DEPT_SEMESTER_MAP[dept] || 0;
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

        if (!mounted) {
          return;
        }

        setFeedbackWindow(windowData);
        setIsEditable(Boolean(windowData?.isEnabled));

        // Set default semester if available
        if (windowData?.semester && semesterOptions.length > 0) {
          const semester = windowData.semester.toString();
          if (semesterOptions.includes(semester)) {
            methods.setValue("semester", semester);
          }
        }

        // Fetch existing feedback if applicable
        if (targetUserId && windowData?.semester) {
          try {
            const feedbackResponse = await api.get(`/feedback/student/${targetUserId}`, {
              params: {
                semester: windowData.semester,
                round: windowData.feedbackRound,
              },
            });
            const feedbackData = feedbackResponse.data?.data?.feedbackByRound?.[windowData.feedbackRound] || null;

            if (feedbackData) {
              reset({
                semester: feedbackData.semester,
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
              reset({ ...DEFAULT_VALUES, semester: windowData.semester });
            }
          } catch (err) {
            if (err?.response?.status !== 404) {
              logger.error("Error fetching feedback:", err);
            }
            reset({ ...DEFAULT_VALUES, semester: windowData.semester });
          }
        } else {
          reset(DEFAULT_VALUES);
        }
      } catch (err) {
        logger.error("Error fetching feedback window:", err);
        enqueueSnackbar("Unable to load feedback window", { variant: "error" });
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchFeedbackData();

    return () => {
      mounted = false;
    };
  }, [targetUserId, enqueueSnackbar, reset, semesterOptions, methods]);

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

      // Validate all rating fields
      for (const question of FEEDBACK_QUESTIONS) {
        if (!formData[question.field]) {
          enqueueSnackbar(`Please rate: ${question.label}`, { variant: "warning" });
          return;
        }
      }

      const requestData = {
        userId: targetUserId,
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
          semester: savedFeedback.semester,
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

      enqueueSnackbar(`Feedback saved successfully! Average: ${savedFeedback?.averageScore || "N/A"}/5.0`, {
        variant: "success",
      });
    } catch (error) {
      logger.error("Error saving feedback:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "An error occurred while saving feedback";
      enqueueSnackbar(errorMessage, { variant: "error" });
    }
  };

  const statusLabel = feedbackWindow?.isEnabled ? "Open" : "Closed";
  const statusSeverity = feedbackWindow?.isEnabled ? "success" : "warning";
  const windowLabel = roundLabel(feedbackWindow?.feedbackRound);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: isLight
          ? alpha(theme.palette.primary.lighter, 0.35)
          : alpha(theme.palette.grey[900], 0.22),
        py: 3,
      }}
    >
      <Box sx={{ maxWidth: 1040, mx: "auto", px: { xs: 1.5, sm: 2.5 } }}>
        <Card
          sx={{
            mb: 3,
            p: { xs: 2, sm: 3 },
            borderRadius: 4,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.info.main, 0.06)} 100%)`,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <Box
              sx={{
                width: 54,
                height: 54,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                backgroundColor: alpha(theme.palette.primary.main, 0.12),
                color: theme.palette.primary.main,
              }}
            >
              <FeedbackOutlinedIcon />
            </Box>
            <Box sx={{ flex: 1, minWidth: 240 }}>
              <Typography variant="overline" sx={{ fontWeight: 800, letterSpacing: 1.4 }}>
                Mentoring Feedback
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, lineHeight: 1.15 }}>
                Share your mentoring feedback
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 0.75 }}>
                Your feedback helps us understand and improve the mentoring experience.
              </Typography>
            </Box>
            <Chip label={statusLabel} color={statusSeverity} variant="filled" sx={{ fontWeight: 800 }} />
          </Stack>
        </Card>

        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2.5}>
            {/* Current Window & Semester Selector */}
            <Grid item xs={12}>
              <Card sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4 }}>
                <Stack spacing={2}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="flex-start">
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                        Current Window
                      </Typography>
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} flexWrap="wrap">
                        <Chip label={windowLabel} variant="outlined" />
                        <Chip
                          label={feedbackWindow?.isEnabled ? "Submission enabled" : "Submission disabled"}
                          color={statusSeverity}
                          variant="outlined"
                        />
                      </Stack>
                    </Box>
                    <Box sx={{ minWidth: 200 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        Select Semester (Optional)
                      </Typography>
                      <select
                        {...methods.register("semester")}
                        style={{
                          width: "100%",
                          padding: "10px 8px",
                          borderRadius: "4px",
                          border: `1px solid ${theme.palette.divider}`,
                          fontSize: "14px",
                          backgroundColor: theme.palette.background.paper,
                        }}
                      >
                        <option value="">-- Auto-detect --</option>
                        {semesterOptions.map((sem) => (
                          <option key={sem} value={sem}>
                            Semester {sem}
                          </option>
                        ))}
                      </select>
                    </Box>
                  </Stack>
                  <Alert severity={feedbackWindow?.isEnabled ? "success" : "warning"}>
                    {feedbackWindow?.isEnabled
                      ? "Feedback submission is open. Please provide honest feedback on your mentoring experience."
                      : "Feedback submission is currently closed. The form is visible for reference, but saving is disabled."}
                  </Alert>
                </Stack>
              </Card>
            </Grid>

            {/* Average Score Display */}
            {averageScore !== null && (
              <Grid item xs={12}>
                <Card sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4, backgroundColor: alpha(theme.palette.success.main, 0.08) }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Current Average Score
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 900, color: theme.palette.success.main }}>
                        {averageScore.toFixed(2)}/5.0
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Based on all 9 rating questions
                    </Typography>
                  </Stack>
                </Card>
              </Grid>
            )}

            {/* Rating Questions */}
            <Grid item xs={12}>
              <Card sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 800, mb: 2 }}>
                  Rate Your Mentoring Experience
                </Typography>
                <Divider sx={{ mb: 3 }} />

                {isLoading ? (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Typography>Loading feedback...</Typography>
                  </Box>
                ) : (
                  <Stack spacing={3}>
                    {FEEDBACK_QUESTIONS.map((question, idx) => (
                      <Box key={question.field}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>
                          Q{idx + 1}. {question.label}
                        </Typography>
                        <Controller
                          name={question.field}
                          control={methods.control}
                          render={({ field }) => (
                            <RadioGroup
                              {...field}
                              row
                              sx={{ gap: 2 }}
                            >
                              {RATING_OPTIONS.map((option) => (
                                <FormControlLabel
                                  key={option.value}
                                  value={option.value.toString()}
                                  control={<Radio size="small" disabled={!isEditable} />}
                                  label={
                                    <Typography variant="caption" sx={{ fontSize: "0.85rem" }}>
                                      {option.value} - {option.label}
                                    </Typography>
                                  }
                                  sx={{ mr: 2, mb: 0.5 }}
                                />
                              ))}
                            </RadioGroup>
                          )}
                        />
                      </Box>
                    ))}
                  </Stack>
                )}
              </Card>
            </Grid>

            {/* Yes/No Questions */}
            <Grid item xs={12}>
              <Card sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 800, mb: 2 }}>
                  Additional Information
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>
                        Are you aware of PST Members of your class?
                      </Typography>
                      <Controller
                        name="awareOfPST"
                        control={methods.control}
                        render={({ field }) => (
                          <RadioGroup {...field} row sx={{ gap: 3 }}>
                            <FormControlLabel
                              value="yes"
                              control={<Radio size="small" disabled={!isEditable} />}
                              label="Yes"
                            />
                            <FormControlLabel
                              value="no"
                              control={<Radio size="small" disabled={!isEditable} />}
                              label="No"
                            />
                          </RadioGroup>
                        )}
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>
                        Are you aware of PLT Members of your class?
                      </Typography>
                      <Controller
                        name="awareOfPLT"
                        control={methods.control}
                        render={({ field }) => (
                          <RadioGroup {...field} row sx={{ gap: 3 }}>
                            <FormControlLabel
                              value="yes"
                              control={<Radio size="small" disabled={!isEditable} />}
                              label="Yes"
                            />
                            <FormControlLabel
                              value="no"
                              control={<Radio size="small" disabled={!isEditable} />}
                              label="No"
                            />
                          </RadioGroup>
                        )}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Card>
            </Grid>

            {/* Remarks */}
            <Grid item xs={12}>
              <Card sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 800, mb: 2 }}>
                  Additional Remarks
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <RHFTextField
                  name="remarks"
                  label="Any other remarks or suggestions"
                  fullWidth
                  disabled={!isEditable}
                  multiline
                  minRows={4}
                  placeholder="Optional: Share any additional feedback or suggestions..."
                />
              </Card>
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Card sx={{ p: { xs: 2, sm: 3 }, borderRadius: 4 }}>
                <Stack spacing={2} alignItems="flex-start">
                  <LoadingButton
                    type="submit"
                    variant="contained"
                    size="large"
                    loading={isSubmitting}
                    disabled={!isEditable || !feedbackWindow?.isEnabled}
                  >
                    {feedbackWindow?.isEnabled ? "Submit Feedback" : "Feedback Closed"}
                  </LoadingButton>
                  {!isEditable && (
                    <Typography variant="caption" color="text.secondary">
                      Feedback submission is currently disabled. Please check back when the feedback window is open.
                    </Typography>
                  )}
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </FormProvider>
      </Box>
    </Box>
  );
}
