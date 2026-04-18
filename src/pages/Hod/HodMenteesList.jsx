import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Button,
  useTheme,
  Box,
  Card,
  CardContent,
  Chip,
  Avatar,
  Stack,
  alpha,
  Breadcrumbs,
  Link as MuiLink,
} from "@mui/material";
import { useNavigate, useParams, Link } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import Page from "../../components/Page";
import api from "../../utils/axios";
import TableRowsSkeleton from "../../components/skeletons/TableRowsSkeleton";
import useMenteesData from "../../hooks/useMenteesData";
import { getAvatarSrc, getAvatarFallbackText } from "../../utils/avatarResolver";

import logger from "../../utils/logger.js";

const HodMenteesList = () => {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const { mentorId } = useParams();
  const { mentees, loading, error } = useMenteesData(mentorId, {
    enabled: Boolean(mentorId),
  });
  const [mentorInfo, setMentorInfo] = useState(null);
  const [mentorInfoError, setMentorInfoError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMentorInfo = async () => {
      try {
        const response = await api.get(`/users/${mentorId}`);
        setMentorInfo(response.data.data.user);
      } catch (err) {
        logger.error("Error fetching mentor info:", err);
        setMentorInfoError("Unable to load mentor details.");
      }
    };

    if (mentorId) {
      fetchMentorInfo();
    }
  }, [mentorId]);

  if (error || mentorInfoError) {
    return (
      <Page title="View Mentees">
        <Typography color="error">{error || mentorInfoError}</Typography>
      </Page>
    );
  }

  return (
    <Page title={`${mentorInfo?.name}'s Mentees`}>
      <Card>
        <Box 
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            px: 3,
            py: 2
          }}
        >
          <Stack spacing={2}>
            <Breadcrumbs>
              <MuiLink
                component={Link}
                to="/hod/dashboard"
                underline="hover"
                color="inherit"
              >
                Dashboard
              </MuiLink>
              <MuiLink
                component={Link}
                to="/hod/mentors"
                underline="hover"
                color="inherit"
              >
                Mentors
              </MuiLink>
              <Typography color="text.primary">Mentees</Typography>
            </Breadcrumbs>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" component="h1" sx={{ fontWeight: 500 }}>
                  {mentorInfo?.name}'s Mentees
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {mentorInfo?.department} Department
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/hod/mentors')}
              >
                Back to Mentors
              </Button>
            </Box>
          </Stack>
        </Box>

        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead sx={{ backgroundColor: isLight ? theme.palette.grey[100] : "#2a2d32" }}>
                <TableRow>
                  <TableCell>Avatar</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>USN</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Semester</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRowsSkeleton columns={8} rows={8} avatarColumns={[0]} />
                ) : mentees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ color: theme.palette.text.primary }}>
                      No mentees allotted to this mentor.
                    </TableCell>
                  </TableRow>
                ) : (
                  mentees.map((mentee) => {
                    const avatarSrc = getAvatarSrc(mentee);

                    return (
                    <TableRow 
                      key={mentee._id} 
                      hover
                      sx={{
                        '&:hover': {
                          backgroundColor: isLight 
                            ? alpha(theme.palette.primary.main, 0.05) 
                            : alpha(theme.palette.info.main, 0.05)
                        }
                      }}
                    >
                      <TableCell>
                        <Avatar 
                          alt={mentee.name}
                          src={avatarSrc || undefined}
                          sx={{ 
                            backgroundColor: isLight 
                              ? theme.palette.primary.main 
                              : theme.palette.info.main 
                          }}
                        >
                          {!avatarSrc ? getAvatarFallbackText(mentee.name) : null}
                        </Avatar>
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        <Typography variant="body2" fontWeight={500}>
                          {mentee.name}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        {mentee.profile?.usn || "N/A"}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        {mentee.email}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        {mentee.phone}
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        <Chip 
                          label={mentee.profile?.department || "N/A"}
                          size="small"
                          icon={<SchoolIcon />}
                          sx={{
                            backgroundColor: isLight 
                              ? alpha(theme.palette.primary.main, 0.1) 
                              : alpha(theme.palette.info.main, 0.15)
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: theme.palette.text.primary }}>
                        {mentee.profile?.sem || "N/A"}
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          color={isLight ? "primary" : "info"}
                          size="small"
                          onClick={() => navigate(`/hod/mentee-profile/${mentee._id}`)}
                          startIcon={<PersonIcon />}
                        >
                          View Dashboard
                        </Button>
                      </TableCell>
                    </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Page>
  );
};

export default HodMenteesList;
