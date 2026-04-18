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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import TableRowsSkeleton from "../../components/skeletons/TableRowsSkeleton";
import useMenteesData from "../../hooks/useMenteesData";

const MenteesList = () => {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const { user } = useContext(AuthContext);
  const mentorId = user?._id;
  const { mentees, loading, error } = useMenteesData(mentorId, {
    enabled: Boolean(mentorId),
  });
  const navigate = useNavigate();

  if (!user) return <Typography color="error">User not authenticated.</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <TableContainer
      component={Paper}
      sx={{
        maxWidth: 900,
        margin: "auto",
        mt: 5,
        bgcolor: theme.palette.background.paper,
      }}
    >
      <Typography
        variant="h6"
        align="center"
        sx={{ 
          bgcolor: isLight ? theme.palette.primary.main : theme.palette.info.main, 
          color: theme.palette.primary.contrastText, 
          py: 2 
        }}
      >
        My Mentees
      </Typography>
      <Table>
        <TableHead sx={{ bgcolor: isLight ? theme.palette.grey[100] : "#2a2d32" }}>
          <TableRow>
            <TableCell sx={{ color: isLight ? theme.palette.text.primary : "white" }}>
              <b>Full Name</b>
            </TableCell>
            <TableCell sx={{ color: isLight ? theme.palette.text.primary : "white" }}>
              <b>Email</b>
            </TableCell>
            <TableCell sx={{ color: isLight ? theme.palette.text.primary : "white" }}>
              <b>Phone</b>
            </TableCell>
            <TableCell sx={{ color: isLight ? theme.palette.text.primary : "white" }}>
              <b>Department</b>
            </TableCell>
            <TableCell sx={{ color: isLight ? theme.palette.text.primary : "white" }}>
              <b>Semester</b>
            </TableCell>
            <TableCell sx={{ color: isLight ? theme.palette.text.primary : "white" }}>
              <b>Actions</b>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRowsSkeleton columns={6} rows={8} />
          ) : mentees.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ color: theme.palette.text.primary }}>
                No mentees allotted.
              </TableCell>
            </TableRow>
          ) : (
            mentees.map((mentee) => (
              <TableRow key={mentee._id} hover>
                <TableCell sx={{ color: theme.palette.text.primary }}>{mentee.name}</TableCell>
                <TableCell sx={{ color: theme.palette.text.primary }}>{mentee.email}</TableCell>
                <TableCell sx={{ color: theme.palette.text.primary }}>{mentee.phone}</TableCell>
                <TableCell sx={{ color: theme.palette.text.primary }}>
                  {mentee.profile?.department || "N/A"}
                </TableCell>
                <TableCell sx={{ color: theme.palette.text.primary }}>
                  {mentee.profile?.sem || "N/A"}
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color={isLight ? "primary" : "info"}
                    onClick={() => navigate(`/faculty/mentee-profile/${mentee._id}`)}
                  >
                    Dashboard
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MenteesList;