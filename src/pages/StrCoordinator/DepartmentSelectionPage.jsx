import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import SchoolIcon from "@mui/icons-material/School";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../utils/axios";
import logger from "../../utils/logger";
import Page from "../../components/Page";

const ALLOWED_DEPARTMENT_CODES = new Set(["ISE", "MCA"]);

const DepartmentSelectionPage = () => {
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";
  const navigate = useNavigate();
  const { user, dispatch } = useContext(AuthContext);

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoading(true);
        const response = await api.get("/departments", {
          params: { status: "active" },
        });
        const depts = (response.data?.data?.departments || []).filter((dept) => {
          const departmentCode = (dept?.code || "").toUpperCase();
          return ALLOWED_DEPARTMENT_CODES.has(departmentCode);
        });
        setDepartments(depts);
        setError(null);
      } catch (err) {
        logger.error("Failed to fetch departments:", err);
        setError("Failed to load departments. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  // Redirect if user is not strcoordinator or director
  useEffect(() => {
    if (user && user.roleName !== "strcoordinator" && user.roleName !== "director") {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

  const handleSelectDepartment = async (dept) => {
    try {
      setSubmitting(true);
      setSelectedDept(dept._id);

      // Call backend to set department
      const response = await api.patch("/users/set-department", {
        department: dept.name,
      });

      const updatedUser = response.data?.data?.user;
      if (updatedUser) {
        // Update AuthContext with the new department
        dispatch({
          type: "UPDATE_USER_PROFILE",
          payload: {
            ...user,
            department: updatedUser.department,
          },
        });

        // Redirect to dashboard
        logger.info(`Department ${dept.name} selected successfully`);
        navigate("/strcoordinator/dashboard", { replace: true });
      }
    } catch (err) {
      logger.error("Failed to set department:", err);
      setError(err.response?.data?.message || "Failed to set department");
      setSelectedDept(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Page title="Select Department - Sanghathi">
      <Box
        sx={{
          pt: 3,
          pb: 5,
          backgroundColor: isLight
            ? alpha(theme.palette.primary.lighter, 0.4)
            : alpha(theme.palette.grey[900], 0.2),
          minHeight: "100vh",
        }}
      >
        <Container maxWidth="md" sx={{ px: { xs: 1.5, sm: 0 } }}>
          {/* Header Section */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  backgroundColor: theme.palette.primary.main,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "2.5rem",
                }}
              >
                S
              </Box>
            </Box>
            <Typography
              variant="h5"
              sx={{
                mb: 1,
                color: theme.palette.text.secondary,
                fontWeight: 500,
                fontSize: "0.95rem",
              }}
            >
              Welcome, {user?.name || "Coordinator"}
            </Typography>
            <Typography
              variant="h2"
              sx={{
                mb: 2,
                fontWeight: "bold",
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Select Your Department
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: "1rem",
                maxWidth: "500px",
                mx: "auto",
              }}
            >
              Choose a department to access and manage its data. You can switch
              between departments anytime from the top navigation.
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Loading State */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress />
            </Box>
          ) : departments.length === 0 ? (
            <Alert severity="info">No departments available</Alert>
          ) : (
            /* Department Cards Grid */
            <Grid container spacing={3}>
              {departments.map((dept) => (
                <Grid item xs={12} sm={6} key={dept._id}>
                  <Card
                    sx={{
                      height: "100%",
                      borderRadius: 2,
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      cursor: "pointer",
                      border: `2px solid ${
                        selectedDept === dept._id
                          ? theme.palette.primary.main
                          : "transparent"
                      }`,
                      backgroundColor:
                        selectedDept === dept._id
                          ? alpha(theme.palette.primary.main, 0.05)
                          : "transparent",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: `0 12px 24px ${alpha(
                          theme.palette.primary.main,
                          0.15
                        )}`,
                        borderColor: theme.palette.primary.main,
                      },
                    }}
                  >
                    <CardActionArea
                      onClick={() => handleSelectDepartment(dept)}
                      disabled={submitting && selectedDept !== dept._id}
                    >
                      <CardContent
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          py: 4,
                          textAlign: "center",
                        }}
                      >
                        {/* Department Icon */}
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: "50%",
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.1
                            ),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mb: 2,
                          }}
                        >
                          <SchoolIcon sx={{ fontSize: "2rem", color: theme.palette.primary.main }} />
                        </Box>

                        {/* Department Name */}
                        <Typography
                          variant="h5"
                          sx={{
                            fontWeight: "bold",
                            mb: 1,
                            color: theme.palette.primary.main,
                          }}
                        >
                          {dept.name}
                        </Typography>

                        {/* Department Code */}
                        <Typography
                          variant="body2"
                          sx={{
                            color: theme.palette.text.secondary,
                            mb: 2,
                          }}
                        >
                          Code: {dept.code}
                        </Typography>

                        {/* Loading or Select Button */}
                        {submitting && selectedDept === dept._id ? (
                          <CircularProgress size={24} />
                        ) : (
                          <Button
                            variant={
                              selectedDept === dept._id ? "contained" : "outlined"
                            }
                            size="small"
                            sx={{
                              mt: 1,
                              textTransform: "none",
                              fontWeight: 600,
                            }}
                          >
                            {selectedDept === dept._id
                              ? "Selected"
                              : "Select"}
                          </Button>
                        )}
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>
    </Page>
  );
};

export default DepartmentSelectionPage;
