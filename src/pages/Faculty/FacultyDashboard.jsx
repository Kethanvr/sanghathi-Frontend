import { Container, Grid, Typography, Box, useTheme } from "@mui/material";
import Page from "../../components/Page";
import { Card, CardHeader, CardContent, CardActionArea } from "@mui/material";
import { useState } from "react";
import Thread from "../../pages/Thread/Thread"
import QuestionAnswerOutlinedIcon from "@mui/icons-material/QuestionAnswerOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Fab,
} from "@mui/material";
import {
  BugReport as BugReportIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  CheckCircle as CheckCircleIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Book as BookIcon,
  EmojiEvents as EmojiEventsIcon,
  Today as TodayIcon,
  Group as GroupIcon,
} from "@mui/icons-material";
import { blueGrey } from "@mui/material/colors";

import { Link } from "react-router-dom";

const StudentTile = ({ title, icon, link }) => {
  const theme = useTheme();
  return (
    
    <Card
      sx={{
        transition: "transform 0.2s",
        "&:hover": {
          transform: "scale(1.05)",
        },
      }}
    >
      <CardActionArea component={Link} to={link}>
        <CardContent
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            backgroundColor: theme.palette.secondary[200],
            color: blueGrey[100],
            minHeight: "230px",
            "&:hover": {
              backgroundColor: theme.palette.primary[600],
            },
          }}
        >
          {icon}
          <Typography variant="h6" component="div" sx={{ mt: 1 }}>
            {title}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

const FacultyDashboard = () => {
  const [bugReportDialogOpen, setBugReportDialogOpen] = useState(false);
  const handleBugReportDialogOpen = () => {
    setBugReportDialogOpen(true);
  };
  const handleBugReportDialogClose = () => {
    setBugReportDialogOpen(false);
  };
  return (
    <Page title="Home">
      <Container
        maxWidth="xl"
        sx={{
          p: 3,
        }}
      >
        <Typography
          variant="h2"
          align="center"
          gutterBottom
          sx={{
            mb: 6,
            fontWeight: "bold",
          }}
        >
          Faculty Dashboard
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <StudentTile
              title="Profile"
              icon={<PersonIcon fontSize="large" />}
              link="/faculty/FacultyProfile"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StudentTile
              title="My Mentees"
              icon={<PersonOutlinedIcon fontSize="large" />}
              link="/mentees"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StudentTile
              title="Threads"
              icon={<QuestionAnswerOutlinedIcon fontSize="large" />}
              link="/threads"
            />
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
};
export default FacultyDashboard;
