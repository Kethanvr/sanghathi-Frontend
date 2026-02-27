import { useState, useEffect, useContext, useCallback } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  Typography,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from "@mui/material";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { useSearchParams } from "react-router-dom";
import useStudentSemester from "../../hooks/useStudentSemester";
const BASE_URL = import.meta.env.VITE_API_URL;

const External = () => {
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const menteeId = searchParams.get('menteeId');
  const { semester: studentSemester, loading: semesterLoading } = useStudentSemester();
  
  const [externalData, setExternalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [availableSemesters, setAvailableSemesters] = useState([1, 2, 3, 4, 5, 6, 7, 8]);
  
  // USN Dialog states
  const [showUSNDialog, setShowUSNDialog] = useState(false);
  const [usnInput, setUsnInput] = useState("");
  const [usnError, setUsnError] = useState("");
  const [currentUSN, setCurrentUSN] = useState(null);

  // Get token from local storage - using "token" instead of "accessToken"
  const token = localStorage.getItem("token");

  // Function to fetch external data with a specific USN (used when user enters USN manually)
  const fetchExternalDataWithUSN = async (usn) => {
    const userId = menteeId || user?._id;
    
    if (!userId || !token) {
      setError("User not authenticated or mentee ID not provided.");
      setLoading(false);
      return;
    }

    try {
      console.log(`Fetching external marks from VTU Official Portal for USN: ${usn}`);
      
      // Call the new VTU external fetch endpoint that gets live data from VTU portal
      const vtuResponse = await axios.post(
        `${BASE_URL}/vtu-results/external/fetch`,
        { usn: usn },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      console.log("VTU Response data:", vtuResponse.data);
      
      if (vtuResponse.data?.status === "success" && vtuResponse.data?.data?.external?.semesters) {
        const externalData = vtuResponse.data.data.external.semesters;
        
        // Transform VTU data to match the External marks format
        const transformedData = externalData.map(semester => ({
          semester: semester.semester,
          sgpa: semester.sgpa,
          subjects: semester.subjects.map(subject => ({
            subjectCode: subject.subjectCode,
            subjectName: subject.subjectName,
            externalMarks: subject.externalMarks || "-",
            attempt: subject.attempt || "1",
            result: subject.result || "-",
            passingDate: subject.passingDate || "-",
            cgpa: semester.sgpa
          }))
        }));
        
        setExternalData(transformedData);
        
        // Set default semester
        const defaultSem = studentSemester && transformedData.find(s => s.semester === studentSemester)
          ? studentSemester
          : transformedData[0]?.semester || 1;
        setSelectedSemester(defaultSem);
        setError("");
        setCurrentUSN(usn);
      } else {
        // No VTU data found
        setExternalData([]);
        setSelectedSemester(studentSemester || 1);
        setError(`No external marks found for USN: ${usn}`);
        setCurrentUSN(usn);
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error fetching VTU external marks:", err);
      
      // Show detailed error message from backend or generic error
      const errorMessage = err.response?.data?.message || err.message || 'Unable to fetch marks';
      
      setExternalData([]);
      setSelectedSemester(studentSemester || 1);
      setError(errorMessage);
      setCurrentUSN(usn);
      setLoading(false);
    }
  };

  const fetchExternalData = useCallback(async () => {
    // Wait for semester to load before fetching
    if (semesterLoading) {
      return;
    }

    // Try to get USN from user profile first
    let usn = user?.usn;
    
    if (!usn) {
      // No USN found, ask user to enter it
      setShowUSNDialog(true);
      setLoading(false);
      return;
    }

    // If we have a USN from the profile, use it
    await fetchExternalDataWithUSN(usn);
  }, [user, token, menteeId, studentSemester, semesterLoading]);

  useEffect(() => {
    fetchExternalData();
  }, [fetchExternalData]);

  const handleSemesterChange = (event) => {
    setSelectedSemester(parseInt(event.target.value, 10));
  };

  const getSubjectsForSemester = () => {
    if (!selectedSemester) return [];
    const semesterData = externalData.find((s) => s.semester === selectedSemester);
    if (!semesterData) return [];

    const subjectsMap = new Map();
    semesterData.subjects.forEach((subject) => {
      subjectsMap.set(subject.subjectCode, subject);
    });
    return Array.from(subjectsMap.values());
  };

  // Get the CGPA for the current semester
  const getSemesterCGPA = () => {
    if (!selectedSemester) return null;
    const semesterData = externalData.find((s) => s.semester === selectedSemester);
    if (!semesterData || !semesterData.subjects || semesterData.subjects.length === 0) return null;
    
    // Get CGPA from the first subject that has it (assuming all subjects in a semester have the same CGPA)
    const subjectWithCGPA = semesterData.subjects.find(subject => subject.cgpa);
    return subjectWithCGPA ? subjectWithCGPA.cgpa : null;
  };

  const handleRefresh = () => {
    setLoading(true);
    setError("");
    fetchExternalData();
  };

  const handleUSNSubmit = () => {
    if (!usnInput.trim()) {
      setUsnError("Please enter a valid USN");
      return;
    }
    
    // Validate USN format (typically 10 characters, e.g., 1CR24IS069)
    if (usnInput.trim().length < 8) {
      setUsnError("USN must be at least 8 characters long");
      return;
    }
    
    const usn = usnInput.trim();
    setShowUSNDialog(false);
    setUsnInput("");
    setUsnError("");
    setLoading(true);
    
    // Call the fetch function with the USN directly
    fetchExternalDataWithUSN(usn);
  };

  const handleUSNDialogClose = () => {
    setShowUSNDialog(false);
    setUsnInput("");
    setUsnError("");
    setLoading(false);
  };

  if (loading) {
    return (
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          External Marks Report
        </Typography>
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Alert severity="error" sx={{ mb: 2, justifyContent: 'center' }}>
            {error}
          </Alert>
          <Button 
            variant="contained" 
            onClick={() => {
              setError("");
              setShowUSNDialog(true);
            }} 
            sx={{ mr: 2 }}
          >
            Try Different USN
          </Button>
          <Button variant="outlined" onClick={handleRefresh}>
            Try Again
          </Button>
        </Box>

        {/* USN Input Dialog */}
        <Dialog open={showUSNDialog} onClose={handleUSNDialogClose} maxWidth="sm" fullWidth>
          <DialogTitle>Enter USN</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              VTU updates external marks results every 6 months for all 8 semesters. Please enter your University Seat Number (USN) to fetch the latest data from VTU Official Portal.
            </Alert>
            <TextField
              autoFocus
              margin="dense"
              label="University Seat Number (USN)"
              placeholder="e.g., 1CR24IS069"
              fullWidth
              variant="outlined"
              value={usnInput}
              onChange={(e) => {
                setUsnInput(e.target.value);
                setUsnError("");
              }}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleUSNSubmit();
                }
              }}
              error={!!usnError}
              helperText={usnError}
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleUSNDialogClose} color="inherit">
              Cancel
            </Button>
            <Button onClick={handleUSNSubmit} variant="contained" color="primary">
              Fetch Marks
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        External Marks Report
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
        <label>
          Select Semester:
          <Select
            value={selectedSemester || 1}
            onChange={handleSemesterChange}
            sx={{ ml: 1 }}
          >
            {availableSemesters.map((sem) => (
              <MenuItem key={sem} value={sem}>
                Semester {sem}
              </MenuItem>
            ))}
          </Select>
        </label>
      </Box>

      <TableContainer sx={{ border: "1px solid gray" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ border: "1px solid gray", fontWeight: "bold" }}>
                Subject Code
              </TableCell>
              <TableCell sx={{ border: "1px solid gray", fontWeight: "bold" }}>
                Subject Name
              </TableCell>
              <TableCell sx={{ border: "1px solid gray", fontWeight: "bold" }}>
                Marks
              </TableCell>
              <TableCell sx={{ border: "1px solid gray", fontWeight: "bold" }}>
                Attempt
              </TableCell>
              <TableCell sx={{ border: "1px solid gray", fontWeight: "bold" }}>
                Result
              </TableCell>
              <TableCell sx={{ border: "1px solid gray", fontWeight: "bold" }}>
                Passing Date
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getSubjectsForSemester().length > 0 ? (
              getSubjectsForSemester().map((subject) => (
                <TableRow key={subject.subjectCode}>
                  <TableCell sx={{ border: "1px solid gray" }}>
                    {subject.subjectCode}
                  </TableCell>
                  <TableCell sx={{ border: "1px solid gray" }}>
                    {subject.subjectName}
                  </TableCell>
                  <TableCell sx={{ border: "1px solid gray" }}>
                    {subject.externalMarks || "-"}
                  </TableCell>
                  <TableCell sx={{ border: "1px solid gray" }}>
                    {subject.attempt || "1"}
                  </TableCell>
                  <TableCell sx={{ 
                    border: "1px solid gray",
                    color: subject.result === "PASS" ? "success.main" : "error.main",
                    fontWeight: "bold" 
                  }}>
                    {subject.result || "-"}
                  </TableCell>
                  <TableCell sx={{ border: "1px solid gray" }}>
                    {subject.passingDate || "-"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  No external marks data available for this semester.
                </TableCell>
              </TableRow>
            )}
            
            {/* CGPA Row - only show if there's data and a CGPA value */}
            {getSubjectsForSemester().length > 0 && getSemesterCGPA() && (
              <TableRow>
                <TableCell 
                  colSpan={6} 
                  align="center" 
                  sx={{ 
                    border: "1px solid gray", 
                    fontWeight: "bold",
                    bgcolor: "action.hover",
                    textAlign: "center"
                  }}
                >
                  SGPA: {getSemesterCGPA() || "-"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* USN Input Dialog */}
      <Dialog open={showUSNDialog} onClose={handleUSNDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Enter USN</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            VTU updates external marks results every 6 months for all 8 semesters. Please enter your University Seat Number (USN) to fetch the latest data from VTU Official Portal.
          </Alert>
          <TextField
            autoFocus
            margin="dense"
            label="University Seat Number (USN)"
            placeholder="e.g., 1CR24IS069"
            fullWidth
            variant="outlined"
            value={usnInput}
            onChange={(e) => {
              setUsnInput(e.target.value);
              setUsnError("");
            }}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleUSNSubmit();
              }
            }}
            error={!!usnError}
            helperText={usnError}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUSNDialogClose} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleUSNSubmit} variant="contained" color="primary">
            Fetch Marks
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default External;