import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  useTheme,
} from "@mui/material";
import {
  CampaignOutlined as CampaignOutlinedIcon,
  ArrowForward as ArrowForwardIcon,
  RefreshOutlined as RefreshOutlinedIcon,
  ErrorOutline as ErrorOutlineIcon,
  MarkEmailReadOutlined as MarkEmailReadOutlinedIcon,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

import Page from "../../components/Page";
import api from "../../utils/axios";
import { AuthContext } from "../../context/AuthContext";

const TabPanel = ({ children, value, index }) => (value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null);

const buildAttendanceAlert = (row) => {
  const percent = Number(row?.overallAttendance || 0).toFixed(2);
  return {
    _id: `attendance-${row?.id || row?.userId}`,
    title: "Attendance alert",
    description: `${row?.name || "Student"} is at ${percent}% attendance for Semester ${row?.semester || "N/A"}.`,
    createdAt: row?.createdAt || new Date().toISOString(),
    type: "attendance",
    isUnread: true,
  };
};

const StudentAlerts = () => {
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [mentorNotifications, setMentorNotifications] = useState([]);
  const [attendanceAlerts, setAttendanceAlerts] = useState([]);

  const loadAlerts = useCallback(async () => {
    if (!user?._id) {
      return;
    }

    try {
      setLoading(true);
      const [notificationsResponse, attendanceResponse] = await Promise.all([
        api.get(`/notifications/${user._id}?unread=false&limit=100`),
        api.get(`/students/attendance/${user._id}`),
      ]);

      const notifications = notificationsResponse.data?.notifications || [];
      setMentorNotifications(notifications);

      const attendance = attendanceResponse.data?.data?.attendance;
      const semesters = Array.isArray(attendance?.semesters) ? attendance.semesters : [];
      const alerts = semesters.flatMap((semesterEntry) =>
        (Array.isArray(semesterEntry?.months) ? semesterEntry.months : [])
          .map((monthEntry) => {
            const totalAttended = (Array.isArray(monthEntry?.subjects) ? monthEntry.subjects : []).reduce(
              (sum, subject) => sum + (Number(subject?.attendedClasses) || 0),
              0
            );
            const totalClasses = (Array.isArray(monthEntry?.subjects) ? monthEntry.subjects : []).reduce(
              (sum, subject) => sum + (Number(subject?.totalClasses) || 0),
              0
            );
            const percent = totalClasses > 0 ? (totalAttended / totalClasses) * 100 : 0;

            if (percent >= 75) {
              return null;
            }

            return {
              _id: `attendance-${semesterEntry.semester}-${monthEntry.month}`,
              title: "Low attendance alert",
              description: `Semester ${semesterEntry.semester}, Month ${monthEntry.month} is at ${percent.toFixed(2)}%. Please review your classes and reach out to your mentor.`,
              createdAt: new Date().toISOString(),
              type: "attendance",
              isUnread: true,
              semester: semesterEntry.semester,
              month: monthEntry.month,
              percent,
            };
          })
          .filter(Boolean)
      );

      setAttendanceAlerts(alerts);
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || "Unable to load alerts", { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [enqueueSnackbar, user?._id]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const unreadMentorAlerts = useMemo(
    () => mentorNotifications.filter((notification) => notification.isUnread),
    [mentorNotifications]
  );

  const mentorAlerts = useMemo(
    () => mentorNotifications.filter((notification) => {
      const title = `${notification.title || ""} ${notification.description || ""}`.toLowerCase();
      return title.includes("mentor") || title.includes("thread") || title.includes("reply") || title.includes("message");
    }),
    [mentorNotifications]
  );

  const combinedAlerts = useMemo(() => {
    return [
      ...attendanceAlerts,
      ...mentorNotifications,
    ].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [attendanceAlerts, mentorNotifications]);

  const renderAlertCard = (alert) => (
    <Paper
      key={alert._id}
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 3,
        borderColor: alpha(theme.palette.primary.main, 0.14),
        background: isLight
          ? "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(240,247,255,0.98) 100%)"
          : "linear-gradient(180deg, rgba(17,24,39,0.98) 0%, rgba(15,23,42,0.98) 100%)",
      }}
    >
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
            flexShrink: 0,
          }}
        >
          {alert.type === "attendance" ? <ErrorOutlineIcon /> : <CampaignOutlinedIcon />}
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {alert.title}
            </Typography>
            {!alert.isUnread ? <Chip label="Read" size="small" variant="outlined" /> : <Chip label="New" size="small" color="error" />}
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            {alert.description}
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button
              size="small"
              variant="contained"
              onClick={() => navigate("/threads")}
              startIcon={<ArrowForwardIcon />}
            >
              Open Threads
            </Button>
            {alert.type === "attendance" ? (
              <Button size="small" variant="outlined" onClick={() => navigate("/student/attendance")}>
                View Attendance
              </Button>
            ) : null}
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );

  return (
    <Page title="Alerts">
      <Box
        sx={{
          minHeight: "100vh",
          py: 3,
          backgroundColor: isLight ? alpha(theme.palette.primary.lighter, 0.25) : alpha(theme.palette.grey[900], 0.18),
        }}
      >
        <Container maxWidth="lg">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 3, md: 4 },
              mb: 3,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              background: isLight
                ? "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(240,247,255,0.98) 100%)"
                : "linear-gradient(135deg, rgba(17,24,39,0.98) 0%, rgba(15,23,42,0.98) 100%)",
            }}
          >
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={2}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 900 }}>
                  Alerts
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                  Recent mentor updates, thread replies, and attendance warnings.
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" startIcon={<RefreshOutlinedIcon />} onClick={loadAlerts}>
                  Refresh
                </Button>
              </Stack>
            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              overflow: "hidden",
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <Tabs
              value={tabValue}
              onChange={(_event, newValue) => setTabValue(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                px: 2,
                pt: 1,
                "& .MuiTab-root": { fontWeight: 800 },
                "& .Mui-selected": { color: theme.palette.primary.main },
              }}
            >
              <Tab label={`All Alerts (${combinedAlerts.length})`} />
              <Tab label={`Mentor Alerts (${unreadMentorAlerts.length || mentorAlerts.length})`} />
              <Tab label={`Attendance Alerts (${attendanceAlerts.length})`} />
            </Tabs>
            <Divider />

            <Box sx={{ p: 2.5 }}>
              {loading ? (
                <Typography>Loading alerts...</Typography>
              ) : (
                <>
                  <TabPanel value={tabValue} index={0}>
                    <Stack spacing={2}>
                      {combinedAlerts.length ? combinedAlerts.map(renderAlertCard) : (
                        <Alert severity="info">No alerts available right now.</Alert>
                      )}
                    </Stack>
                  </TabPanel>

                  <TabPanel value={tabValue} index={1}>
                    <Stack spacing={2}>
                      {(mentorAlerts.length ? mentorAlerts : unreadMentorAlerts).length ? (
                        (mentorAlerts.length ? mentorAlerts : unreadMentorAlerts).map((notification) => (
                          <Paper key={notification._id} variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
                            <Stack direction="row" spacing={2} alignItems="flex-start">
                              <Box sx={{ width: 44, height: 44, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.12), display: "flex", alignItems: "center", justifyContent: "center", color: theme.palette.info.main }}>
                                <MarkEmailReadOutlinedIcon />
                              </Box>
                              <Box>
                                <Typography variant="h6" sx={{ fontWeight: 800 }}>{notification.title || "Mentor update"}</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{notification.description || "You have a new mentor alert."}</Typography>
                              </Box>
                            </Stack>
                          </Paper>
                        ))
                      ) : (
                        <Alert severity="info">No mentor alerts found.</Alert>
                      )}
                    </Stack>
                  </TabPanel>

                  <TabPanel value={tabValue} index={2}>
                    <Stack spacing={2}>
                      {attendanceAlerts.length ? attendanceAlerts.map((alert) => renderAlertCard(alert)) : (
                        <Alert severity="success">No low attendance alerts found.</Alert>
                      )}
                    </Stack>
                  </TabPanel>
                </>
              )}
            </Box>
          </Paper>
        </Container>
      </Box>
    </Page>
  );
};

export default StudentAlerts;
