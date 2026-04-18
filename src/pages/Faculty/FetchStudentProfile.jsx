import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import SchoolIcon from "@mui/icons-material/School";
import TableRowsSkeleton from "../../components/skeletons/TableRowsSkeleton";
import useMenteesData from "../../hooks/useMenteesData";
import Page from "../../components/Page";
import {
  getAvatarSrc,
  getAvatarFallbackText,
} from "../../utils/avatarResolver";

const MenteesList = () => {
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";
  const { user } = useContext(AuthContext);
  const mentorId = user?._id;
  const { mentees, loading, error } = useMenteesData(mentorId, {
    enabled: Boolean(mentorId),
  });
  const navigate = useNavigate();

  if (!user) {
    return (
      <Page title="My Mentees">
        <Typography color="error">User not authenticated.</Typography>
      </Page>
    );
  }

  if (error) {
    return (
      <Page title="My Mentees">
        <Typography color="error">{error}</Typography>
      </Page>
    );
  }

  return (
    <Page title="My Mentees">
      <Card>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            px: 3,
            py: 2,
          }}
        >
          <Stack spacing={1}>
            <Typography variant="h6" component="h1" sx={{ fontWeight: 500 }}>
              My Mentees
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.name ? `${user.name}'s assigned students` : "Assigned students"}
            </Typography>
          </Stack>
        </Box>

        <CardContent>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead
                sx={{ backgroundColor: isLight ? theme.palette.grey[100] : "#2a2d32" }}
              >
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
                    <TableCell
                      colSpan={8}
                      align="center"
                      sx={{ color: theme.palette.text.primary }}
                    >
                      No mentees allotted.
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
                          "&:hover": {
                            backgroundColor: isLight
                              ? alpha(theme.palette.primary.main, 0.05)
                              : alpha(theme.palette.info.main, 0.05),
                          },
                        }}
                      >
                        <TableCell>
                          <Avatar
                            alt={mentee.name}
                            src={avatarSrc || undefined}
                            sx={{
                              backgroundColor: isLight
                                ? theme.palette.primary.main
                                : theme.palette.info.main,
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
                        <TableCell sx={{ color: theme.palette.text.primary }}>{mentee.email}</TableCell>
                        <TableCell sx={{ color: theme.palette.text.primary }}>{mentee.phone}</TableCell>
                        <TableCell sx={{ color: theme.palette.text.primary }}>
                          <Chip
                            label={mentee.profile?.department || "N/A"}
                            size="small"
                            icon={<SchoolIcon />}
                            sx={{
                              backgroundColor: isLight
                                ? alpha(theme.palette.primary.main, 0.1)
                                : alpha(theme.palette.info.main, 0.15),
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
                            startIcon={<PersonIcon />}
                            onClick={() => navigate(`/faculty/mentee-profile/${mentee._id}`)}
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

export default MenteesList;