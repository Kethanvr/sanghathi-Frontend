import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Box, Container, Typography, Grid, Card, CardActionArea, CardContent, useTheme, alpha } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import Page from "../../components/Page";
import logger from "../../utils/logger";

const StatCard = ({ icon: Icon, title, description, onClick, count }) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 2,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
        },
      }}
    >
      <CardActionArea onClick={onClick} sx={{ height: "100%" }}>
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 3,
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
            }}
          >
            <Icon sx={{ fontSize: "2rem", color: theme.palette.primary.main }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
            {title}
          </Typography>
          {count !== undefined && (
            <Typography variant="h4" sx={{ color: theme.palette.primary.main, fontWeight: "bold", mb: 1 }}>
              {count}
            </Typography>
          )}
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            {description}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

const StrCoordinatorDashboard = () => {
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if no department is selected
  if (!user?.department) {
    navigate("/strcoordinator/select-department", { replace: true });
    return null;
  }

  const handleViewUsers = () => {
    logger.info("Navigate to users");
    navigate("/admin/users");
  };

  const handleViewMentors = () => {
    logger.info("Navigate to mentors");
    navigate("/director/mentors");
  };

  return (
    <Page title="STR Coordinator Dashboard">
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
        <Container maxWidth="xl" sx={{ px: { xs: 1.5, sm: 0 } }}>
          {/* Header */}
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
              }}
            >
              Welcome back, {user?.name || "STR Coordinator"}
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
              {user?.department} Department Dashboard
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: theme.palette.text.secondary,
                maxWidth: "600px",
                mx: "auto",
              }}
            >
              Manage and oversee {user?.department} department data and activities.
              Use the department switcher in the top navigation to manage other
              departments.
            </Typography>
          </Box>

          {/* Quick Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={PeopleIcon}
                title="View Users"
                description="Manage department users"
                onClick={handleViewUsers}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={SchoolIcon}
                title="View Mentors"
                description="Department mentors"
                onClick={handleViewMentors}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={DescriptionOutlinedIcon}
                title="Reports"
                description="View analytics"
                onClick={() => navigate("/hod/thread-reports")}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={RateReviewOutlinedIcon}
                title="Feedback"
                description="Manage feedback"
                onClick={() => navigate("/feedback/manage")}
              />
            </Grid>
          </Grid>

          {/* Info Box */}
          <Card
            sx={{
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
              border: `1px solid ${theme.palette.primary.main}40`,
            }}
          >
            <CardContent sx={{ py: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                About This Dashboard
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                As an STR Coordinator, you have access to manage and view data for the{" "}
                <strong>{user?.department}</strong> department. You can switch between
                departments using the "Dept:" button in the top navigation bar. All
                actions and data displayed are scoped to your selected department.
              </Typography>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </Page>
  );
};

export default StrCoordinatorDashboard;
