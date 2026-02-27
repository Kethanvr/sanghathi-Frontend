import React, { useState, useEffect, useContext } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  Box,
  CircularProgress,
  LinearProgress,
  Chip,
  Button,
  useTheme,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { AuthContext } from "../../context/AuthContext";
import api from "../../utils/axios";
import { useNavigate } from "react-router-dom";

export default function VTUResultsCard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResultsSummary();
  }, [user]);

  const fetchResultsSummary = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/vtu-results/${user._id}/summary`);
      if (response.data.status === "success") {
        setSummary(response.data.data.summary);
      }
    } catch (err) {
      // Silently fail - no error alerts on dashboard
      // Errors will be shown in the full VTU Results tab
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (cgpa) => {
    if (!cgpa && cgpa !== 0) return "info";
    if (cgpa >= 8.5) return "success";
    if (cgpa >= 7.0) return "info";
    if (cgpa >= 6.0) return "warning";
    if (cgpa >= 5.0) return "default";
    return "error";
  };

  const getCGPAStatus = (cgpa) => {
    if (!cgpa && cgpa !== 0) return "No Data";
    if (cgpa >= 8.5) return "Outstanding";
    if (cgpa >= 7.0) return "Excellent";
    if (cgpa >= 6.0) return "Good";
    if (cgpa >= 5.0) return "Average";
    if (cgpa >= 4.0) return "Satisfactory";
    return "Below Passing";
  };

  if (loading) {
    return (
      <Card sx={{ height: "100%" }}>
        <CardHeader
          avatar={<SchoolIcon sx={{ color: "primary.main" }} />}
          title="VTU Results"
          titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
        />
        <CardContent sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "150px" }}>
          <CircularProgress size={40} />
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    // Don't display anything on dashboard when no data
    // User will see the full "No results" message in the VTU Results tab
    return null;
  }

  return (
    <Card sx={{ height: "100%", background: isLight ? "background.paper" : "grey.900" }}>
      <CardHeader
        avatar={<SchoolIcon sx={{ color: "primary.main" }} />}
        title="VTU Results"
        titleTypographyProps={{ variant: "h6", fontWeight: 600 }}
        action={
          <Button
            size="small"
            onClick={() => navigate("/student-profile?tab=VTU Results")}
            sx={{ textDecoration: "none" }}
          >
            View All
          </Button>
        }
      />
      <CardContent>
        <Grid container spacing={3}>
          {/* USN */}
          <Grid item xs={12}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="textSecondary" sx={{ textTransform: "uppercase" }}>
                University Seat Number
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {summary.usn}
              </Typography>
            </Box>
          </Grid>

          {/* CGPA Section */}
          <Grid item xs={12} sm={6}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: isLight ? "primary.lighter" : "primary.dark",
                border: `2px solid ${theme.palette[getGradeColor(summary.cgpa)].main}`,
              }}
            >
              <Typography variant="caption" color="textSecondary" sx={{ textTransform: "uppercase" }}>
                Current CGPA
              </Typography>
              <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mt: 1 }}>
                <Typography variant="h3" sx={{ fontWeight: 700, color: getGradeColor(summary.cgpa) + ".main" }}>
                  {summary.cgpa ? summary.cgpa.toFixed(2) : "N/A"}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  / 10
                </Typography>
              </Box>
              <Chip
                label={getCGPAStatus(summary.cgpa)}
                size="small"
                color={getGradeColor(summary.cgpa)}
                variant="outlined"
                sx={{ mt: 1 }}
              />
            </Box>
          </Grid>

          {/* Semesters Section */}
          <Grid item xs={12} sm={6}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: isLight ? "info.lighter" : "info.dark",
                border: `2px solid ${theme.palette.info.main}`,
              }}
            >
              <Typography variant="caption" color="textSecondary" sx={{ textTransform: "uppercase" }}>
                Semesters Completed
              </Typography>
              <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mt: 1 }}>
                <Typography variant="h3" sx={{ fontWeight: 700, color: "info.main" }}>
                  {summary.totalSemesters}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  / 8
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(summary.totalSemesters / 8) * 100}
                sx={{ mt: 1 }}
              />
            </Box>
          </Grid>

          {/* Semester Details */}
          {summary.semesters && summary.semesters.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Semester-wise SGPA
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                {summary.semesters.map((sem, index) => (
                  <Chip
                    key={index}
                    icon={<TrendingUpIcon />}
                    label={`Sem ${sem.semesterNumber}: ${sem.sgpa ? sem.sgpa.toFixed(2) : "N/A"}`}
                    variant="outlined"
                    color={
                      sem.sgpa >= 8.5
                        ? "success"
                        : sem.sgpa >= 7.0
                        ? "info"
                        : sem.sgpa >= 6.0
                        ? "warning"
                        : "default"
                    }
                    size="small"
                  />
                ))}
              </Box>
            </Grid>
          )}

          {/* Last Updated */}
          {summary.lastUpdated && (
            <Grid item xs={12}>
              <Typography variant="caption" color="textSecondary">
                Last Updated:{" "}
                <Box component="span" sx={{ fontWeight: 500 }}>
                  {new Date(summary.lastUpdated).toLocaleDateString()}
                </Box>
              </Typography>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
}
