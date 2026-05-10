import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import {
  AssessmentOutlined as AssessmentOutlinedIcon,
  SchoolOutlined as SchoolOutlinedIcon,
  RateReviewOutlined as RateReviewOutlinedIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import Page from "../../components/Page";
import api from "../../utils/axios";
import { AuthContext } from "../../context/AuthContext";
import { alpha } from "@mui/material/styles";

const ReportCard = ({ title, description, count, icon, onClick }) => {
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 3,
        overflow: "hidden",
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: isLight ? "0 14px 32px rgba(25,118,210,0.12)" : "0 14px 32px rgba(0,0,0,0.22)",
          borderColor: theme.palette.primary.main,
        }
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
                  color: "primary.main",
                  backgroundColor: alpha(theme.palette.primary.main, 0.12),
                }}
              >
                {icon}
              </Box>
              <Chip
                label={`${count} rows`}
                size="small"
                color="primary"
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
  const navigate = useNavigate();

  const [competitionCount, setCompetitionCount] = useState(0);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadReports = useCallback(async () => {
    try {
      setIsLoading(true);
      const [competitionResponse, attendanceResponse, feedbackResponse] = await Promise.all([
        api.get("/reports/competitions"),
        api.get("/reports/attendance"),
        api.get("/feedback/overview").catch(() => ({ data: { data: { feedbacks: [] } } })),
      ]);

      setCompetitionCount(competitionResponse.data?.data?.competitions?.length || 0);
      setAttendanceCount(attendanceResponse.data?.data?.attendance?.length || 0);
      setFeedbackCount(feedbackResponse.data?.data?.feedbacks?.length || 0);
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || "Failed to load reports summary", { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

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
                Click and download reports to view competition entries from Career Review and track students whose latest attendance has dropped below the 75% threshold.
              </Typography>
            </Stack>
          </Paper>

          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <ReportCard
                title="Competition Report"
                description="Click to browse the records and export them to Excel."
                count={isLoading ? "..." : competitionCount}
                icon={<AssessmentOutlinedIcon />}
                onClick={() => navigate("/report/competition")}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ReportCard
                title="Attendance Report"
                description="Click to browse the records and export them to Excel."
                count={isLoading ? "..." : attendanceCount}
                icon={<SchoolOutlinedIcon />}
                onClick={() => navigate("/report/attendance")}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ReportCard
                title="Feedback Report"
                description="Click to view feedback by mentor and export to Excel."
                count={isLoading ? "..." : feedbackCount}
                icon={<RateReviewOutlinedIcon />}
                onClick={() => navigate("/report/feedback")}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Page>
  );
};

export default Report;