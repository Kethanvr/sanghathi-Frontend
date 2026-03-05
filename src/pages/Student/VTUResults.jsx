import { useState, useEffect, useContext } from "react";
import {
  Box,
  Card,
  Stack,
  TextField,
  Typography,
  Button,
  Alert,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  CircularProgress,
  Divider,
} from "@mui/material";
import { useSnackbar } from "notistack";
import api from "../../utils/axios";
import { AuthContext } from "../../context/AuthContext";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function VTUResults() {
  const { user } = useContext(AuthContext);
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSemester, setEditingSemester] = useState(null);
  const [semesterData, setSemesterData] = useState({
    semesterNumber: 1,
    courses: [],
    examMonth: "December",
    examYear: new Date().getFullYear(),
  });

  useEffect(() => {
    fetchVTUResults();
  }, [user]);

  const fetchVTUResults = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/vtu-results/${user._id}`);
      if (response.data.status === "success") {
        setResults(response.data.data.vtuResults);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        // Results not found, that's okay
        setResults(null);
      } else {
        enqueueSnackbar("Failed to fetch VTU results", { variant: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (semester = null) => {
    if (semester) {
      setEditingSemester(semester);
      setSemesterData(semester);
    } else {
      setEditingSemester(null);
      setSemesterData({
        semesterNumber: results ? results.semesters.length + 1 : 1,
        courses: [{ courseCode: "", courseName: "", credits: 4, internalMarks: 0, externalMarks: 0 }],
        examMonth: "December",
        examYear: new Date().getFullYear(),
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSemester(null);
  };

  const handleAddCourse = () => {
    setSemesterData({
      ...semesterData,
      courses: [
        ...semesterData.courses,
        { courseCode: "", courseName: "", credits: 4, internalMarks: 0, externalMarks: 0 },
      ],
    });
  };

  const handleRemoveCourse = (index) => {
    setSemesterData({
      ...semesterData,
      courses: semesterData.courses.filter((_, i) => i !== index),
    });
  };

  const handleCourseChange = (index, field, value) => {
    const updatedCourses = [...semesterData.courses];
    updatedCourses[index] = {
      ...updatedCourses[index],
      [field]: field.includes("Marks") || field === "credits" ? parseFloat(value) || 0 : value,
    };
    setSemesterData({
      ...semesterData,
      courses: updatedCourses,
    });
  };

  const handleSubmit = async () => {
    // Validation
    if (
      semesterData.courses.some(
        (c) => !c.courseCode || !c.courseName || !c.credits
      )
    ) {
      enqueueSnackbar("Please fill all course details", { variant: "warning" });
      return;
    }

    try {
      if (editingSemester) {
        // Update existing semester
        await api.put(`/vtu-results/${user._id}/semester/${semesterData.semesterNumber}`, {
          semesterNumber: semesterData.semesterNumber,
          semesterData: semesterData,
        });
        enqueueSnackbar("Semester results updated successfully", { variant: "success" });
      } else {
        // Add new semester or update all
        const payload = {
          usn: results?.usn || user.usn || "",
          semesterData: results
            ? [...results.semesters, semesterData]
            : [semesterData],
        };
        await api.post(`/vtu-results/${user._id}`, payload);
        enqueueSnackbar("Results saved successfully", { variant: "success" });
      }

      handleCloseDialog();
      fetchVTUResults();
    } catch (error) {
      enqueueSnackbar(error.response?.data?.message || "Failed to save results", {
        variant: "error",
      });
    }
  };

  const handleDeleteResults = async () => {
    if (!window.confirm("Are you sure you want to delete all VTU results?")) {
      return;
    }

    try {
      await api.delete(`/vtu-results/${user._id}`);
      enqueueSnackbar("VTU results deleted successfully", { variant: "success" });
      setResults(null);
      fetchVTUResults();
    } catch (error) {
      enqueueSnackbar("Failed to delete results", { variant: "error" });
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const getGradeColor = (grade) => {
    if (!grade) return "default";
    if (["O", "A+"].includes(grade)) return "success";
    if (["A", "B+"].includes(grade)) return "info";
    if (["B"].includes(grade)) return "warning";
    if (["C", "P"].includes(grade)) return "default";
    return "error";
  };

  return (
    <Stack spacing={3} sx={{ p: 3 }}>
      <Box>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
          VTU Results
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Track your semester results and CGPA from VTU
        </Typography>
      </Box>

      {results ? (
        <>
          {/* Summary Card */}
          <Card sx={{ p: 3, bgcolor: isLight ? "grey.50" : "grey.900" }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Stack>
                  <Typography variant="body2" color="textSecondary">
                    USN
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {results.usn}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack>
                  <Typography variant="body2" color="textSecondary">
                    CGPA
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color:
                        results.cgpa >= 7 ? "success.main" : results.cgpa >= 5 ? "info.main" : "error.main",
                    }}
                  >
                    {results.cgpa ? results.cgpa.toFixed(2) : "N/A"}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack>
                  <Typography variant="body2" color="textSecondary">
                    Total Semesters
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {results.semesters.length}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack>
                  <Typography variant="body2" color="textSecondary">
                    Last Updated
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {new Date(results.lastUpdated).toLocaleDateString()}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </Card>

          {/* Semesters */}
          {results.semesters.map((semester, index) => (
            <Card key={index} sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Semester {semester.semesterNumber}
                    </Typography>
                    {semester.examMonth && semester.examYear && (
                      <Typography variant="body2" color="textSecondary">
                        {semester.examMonth} {semester.examYear}
                      </Typography>
                    )}
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <Chip
                      label={`SGPA: ${semester.sgpa ? semester.sgpa.toFixed(2) : "N/A"}`}
                      color={semester.sgpa >= 7 ? "success" : "default"}
                      variant="outlined"
                    />
                    <Button
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenDialog(semester)}
                    >
                      Edit
                    </Button>
                  </Stack>
                </Box>

                <Divider />

                {/* Courses Table */}
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: isLight ? "grey.100" : "grey.800" }}>
                        <TableCell sx={{ fontWeight: 600 }}>Course Code</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Course Name</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>
                          Credits
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>
                          Internal
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>
                          External
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>
                          Total
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600 }}>
                          Grade
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {semester.courses.map((course, courseIndex) => (
                        <TableRow key={courseIndex}>
                          <TableCell>{course.courseCode}</TableCell>
                          <TableCell>{course.courseName}</TableCell>
                          <TableCell align="center">{course.credits}</TableCell>
                          <TableCell align="center">{course.internalMarks}</TableCell>
                          <TableCell align="center">{course.externalMarks}</TableCell>
                          <TableCell align="center">{course.totalMarks}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={course.grade}
                              color={getGradeColor(course.grade)}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Stack>
            </Card>
          ))}

          {/* Action Buttons */}
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Semester Results
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteResults}
            >
              Delete All Results
            </Button>
          </Stack>
        </>
      ) : (
        <Card sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>
            No Results Found
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Your VTU results will appear here once you add them.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Your First Semester Results
          </Button>
        </Card>
      )}

      {/* Dialog for adding/editing results */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingSemester ? "Edit Semester Results" : "Add Semester Results"}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={3}>
            {!results && (
              <TextField
                fullWidth
                label="USN (University Seat Number)"
                placeholder="e.g., 1RV19CS001"
                defaultValue={user.usn || ""}
                disabled
                helperText="USN from your profile"
              />
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  type="number"
                  label="Semester Number"
                  fullWidth
                  value={semesterData.semesterNumber}
                  onChange={(e) =>
                    setSemesterData({
                      ...semesterData,
                      semesterNumber: parseInt(e.target.value),
                    })
                  }
                  inputProps={{ min: 1, max: 8 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  type="number"
                  label="Year"
                  fullWidth
                  value={semesterData.examYear}
                  onChange={(e) =>
                    setSemesterData({
                      ...semesterData,
                      examYear: parseInt(e.target.value),
                    })
                  }
                />
              </Grid>
            </Grid>

            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Courses
            </Typography>

            {semesterData.courses.map((course, index) => (
              <Card key={index} sx={{ p: 2, bgcolor: isLight ? "grey.50" : "grey.900" }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Course Code"
                      placeholder="e.g., CS201"
                      value={course.courseCode}
                      onChange={(e) =>
                        handleCourseChange(index, "courseCode", e.target.value)
                      }
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Course Name"
                      value={course.courseName}
                      onChange={(e) =>
                        handleCourseChange(index, "courseName", e.target.value)
                      }
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="Credits"
                      type="number"
                      value={course.credits}
                      onChange={(e) =>
                        handleCourseChange(index, "credits", e.target.value)
                      }
                      size="small"
                      inputProps={{ min: 1 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="Internal (out of 50)"
                      type="number"
                      value={course.internalMarks}
                      onChange={(e) =>
                        handleCourseChange(index, "internalMarks", e.target.value)
                      }
                      size="small"
                      inputProps={{ min: 0, max: 50 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      label="External (out of 50)"
                      type="number"
                      value={course.externalMarks}
                      onChange={(e) =>
                        handleCourseChange(index, "externalMarks", e.target.value)
                      }
                      size="small"
                      inputProps={{ min: 0, max: 50 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Button
                      fullWidth
                      color="error"
                      size="small"
                      onClick={() => handleRemoveCourse(index)}
                    >
                      Remove
                    </Button>
                  </Grid>
                </Grid>
              </Card>
            ))}

            <Button
              variant="outlined"
              onClick={handleAddCourse}
              startIcon={<AddIcon />}
            >
              Add Course
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            Save Results
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
