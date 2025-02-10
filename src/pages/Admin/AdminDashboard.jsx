import React from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  useTheme,
} from "@mui/material";
import {
  PersonAdd as PersonAddIcon,
  PeopleAlt as PeopleAltIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import PersonIcon from '@mui/icons-material/Person';
import { Link } from "react-router-dom";
import { blueGrey } from "@mui/material/colors";
import SummarizeOutlinedIcon from '@mui/icons-material/SummarizeOutlined';


const AdminTile = ({ title, icon, link }) => {
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

const AdminDashboard = () => {
  return (
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
        Admin Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <AdminTile
            title="Profile"
            icon={<PersonIcon fontSize="large" />}
            link="/faculty/FacultyProfile"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <AdminTile
            title="Add New User"
            icon={<PersonAddIcon fontSize="large" />}
            link="/admin/add-user"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <AdminTile
            title="Add Data"
            icon={<AssignmentIcon fontSize="large" />}
            link="/admin/data"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <AdminTile
            title="View All Users"
            icon={<PeopleAltIcon fontSize="large" />}
            link="/admin/users"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <AdminTile
            title="Assign Mentors"
            icon={<PeopleAltIcon fontSize="large" />}
            link="/admin/mentor-assignment"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <AdminTile
            title="Thread Reports"
            icon={<SummarizeOutlinedIcon fontSize="large" />}
            link="/report"
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;