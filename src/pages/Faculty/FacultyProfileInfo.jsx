import { useState, useEffect, useCallback, useContext } from "react";
import {
  Avatar,
  Box,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
import { AuthContext } from "../../context/AuthContext";
import api from "../../utils/axios";
import logger from "../../utils/logger.js";
import { getAvatarFallbackText, getAvatarSrc } from "../../utils/avatarResolver";

const FacultyProfileInfo = () => {
  const theme = useTheme();
  const { user } = useContext(AuthContext);
  const [mentorDetails, setMentorDetails] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const isLight = theme.palette.mode === "light";

  const fetchMentorDetails = useCallback(async () => {
    if (!user || !user._id) {
      logger.error("User ID not found");
      setErrorMessage("Unable to identify current user.");
      setLoading(false);
      return;
    }

    try {
      setErrorMessage("");
      const mentorResponse = await api.get(`/mentorship/mentor/${user._id}`);
      const mentor = mentorResponse.data?.mentor;

      if (mentor?._id) {
        let facultyProfile = null;

        try {
          const profileResponse = await api.get(`/faculty/profile/${mentor._id}`);
          facultyProfile = profileResponse.data?.data?.facultyProfile || null;
        } catch (profileError) {
          if (profileError?.response?.status !== 404) {
            logger.error("Error fetching faculty profile:", profileError);
          }
        }

        const profileName = facultyProfile?.fullName
          ? [
              facultyProfile.fullName.firstName,
              facultyProfile.fullName.middleName,
              facultyProfile.fullName.lastName,
            ]
              .filter(Boolean)
              .join(" ")
          : null;

        setMentorDetails({
          fullName: profileName || mentor.name || "Not available",
          department: facultyProfile?.department || mentor.department || "Not available",
          email: facultyProfile?.email || mentor.email || "Not available",
          mobileNumber:
            facultyProfile?.mobileNumber ||
            mentor.mobileNumber ||
            mentor.phone ||
            "Not available",
          cabin: facultyProfile?.cabin || mentor.cabin || "Not available",
          photo:
            facultyProfile?.photo ||
            mentor.photo ||
            mentor.avatar ||
            null,
        });
      } else {
        setErrorMessage("No mentor assigned yet.");
      }
    } catch (error) {
      logger.error("Error fetching mentor details:", error);
      if (error?.response?.status === 404) {
        setErrorMessage("No mentor assigned yet.");
      } else {
        setErrorMessage("Unable to load mentor details right now.");
      }
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchMentorDetails();
  }, [fetchMentorDetails]);

  const mentorAvatarSrc = getAvatarSrc(mentorDetails);
  const mentorFallbackName = mentorDetails?.fullName || "Mentor";

  return (
    <Container
      maxWidth="xl"
      sx={{
        px: { xs: 1.5, sm: 3 },
        py: { xs: 3, sm: 5 },
        backgroundColor: theme.palette.background.default, 
        color: theme.palette.text.primary, 
        minHeight: "100vh",
      }}
    >
      <Typography
        variant="h4"
        sx={{ textAlign: "center", mb: 3, color: theme.palette.text.primary }}
      >
        Mentor Details
      </Typography>
      {loading ? (
        <Typography variant="h6" sx={{ textAlign: "center", color: "#aaa" }}>
          Loading faculty profile...
        </Typography>
      ) : errorMessage ? (
        <Typography variant="h6" sx={{ textAlign: "center", color: "error.main" }}>
          {errorMessage}
        </Typography>
      ) : mentorDetails ? (
        <>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <Avatar
              src={mentorAvatarSrc || undefined}
              alt={mentorFallbackName}
              sx={{
                width: 80,
                height: 80,
                bgcolor: isLight ? "primary.main" : "info.main",
                color: "common.white",
                fontSize: "1.8rem",
                fontWeight: 700,
              }}
            >
              {!mentorAvatarSrc
                ? getAvatarFallbackText(mentorFallbackName)
                : null}
            </Avatar>
          </Box>
          <TableContainer
            component={Paper}
            sx={{
              maxWidth: { xs: "100%", sm: 600 },
              overflowX: "auto",
              margin: "auto",
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: isLight ? theme.palette.primary.main : theme.palette.info.main }}>
                  <TableCell
                    colSpan={2}
                    sx={{
                      textAlign: "center",
                      fontWeight: "bold",
                      fontSize: "1.2rem",
                      color: "#fff",
                    }}
                  >
                    Contact Mentor
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[
                  { label: "Full Name", value: mentorDetails.fullName },
                  { label: "Department", value: mentorDetails.department },
                  { label: "Email", value: mentorDetails.email },
                  { label: "Mobile Number", value: mentorDetails.mobileNumber },
                  { label: "Cabin", value: mentorDetails.cabin },
                ].map((row, index) => (
                  <TableRow key={index}>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        color: theme.palette.text.secondary,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      {row.label}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: theme.palette.text.primary,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      {row.value}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : (
        <Typography variant="h6" sx={{ textAlign: "center", color: "red" }}>
          No mentor details found.
        </Typography>
      )}
    </Container>
  );
};

export default FacultyProfileInfo;
