import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  TextField,
} from "@mui/material";

export default function External() {
  const [currentSemester, setCurrentSemester] = useState(1);
  const [semesterData, setSemesterData] = useState(
    Array.from({ length: 8 }, () =>
      Array(8).fill({
        subjectCode: "",
        subject: "",
        finalIAT: "",
        maxMarks: "",
        attempt1: "",
        attempt2: "",
        attempt3: "",
        attempt4: "",
        passingDate: "",
      })
    )
  );
  const [editMode, setEditMode] = useState(false);
  const [finalCGPA, setFinalCGPA] = useState("");
  const [finalResultDate, setFinalResultDate] = useState("");

  const handleFieldChange = (rowIndex, field, value) => {
    const updatedSemesterData = [...semesterData];
    updatedSemesterData[currentSemester - 1][rowIndex][field] = value;
    setSemesterData(updatedSemesterData);
  };

  const handleReset = () => {
    const updatedSemesterData = [...semesterData];
    updatedSemesterData[currentSemester - 1] = Array(8).fill({
      subjectCode: "",
      subject: "",
      finalIAT: "",
      maxMarks: "",
      attempt1: "",
      attempt2: "",
      attempt3: "",
      attempt4: "",
      passingDate: "",
    });
    setSemesterData(updatedSemesterData);
    setFinalCGPA("");
    setFinalResultDate("");
  };

  const handleMockData = () => {
    const mockRows = [
      {
        subjectCode: "MTH101",
        subject: "Mathematics",
        finalIAT: 85,
        maxMarks: 100,
        attempt1: 78,
        attempt2: "",
        attempt3: "",
        attempt4: "",
        passingDate: "2024-05-01",
      },
      {
        subjectCode: "PHY102",
        subject: "Physics",
        finalIAT: 86,
        maxMarks: 100,
        attempt1: 80,
        attempt2: "",
        attempt3: "",
        attempt4: "",
        passingDate: "2024-05-02",
      },
      // Add more mock rows as needed
    ];
    const updatedSemesterData = [...semesterData];
    updatedSemesterData[currentSemester - 1] = mockRows.concat(
      Array(8 - mockRows.length).fill({
        subjectCode: "",
        subject: "",
        finalIAT: "",
        maxMarks: "",
        attempt1: "",
        attempt2: "",
        attempt3: "",
        attempt4: "",
        passingDate: "",
      })
    );
    setSemesterData(updatedSemesterData);
    setFinalCGPA("9.2");
    setFinalResultDate("2024-06-30");
  };

  return (
    <Box>
      {/* Semester Selector */}
      <FormControl fullWidth sx={{ mb: 3, maxWidth: 200 }}>
        <InputLabel>Semester</InputLabel>
        <Select
          value={currentSemester}
          onChange={(e) => setCurrentSemester(e.target.value)}
        >
          {Array.from({ length: 8 }, (_, i) => (
            <MenuItem key={i} value={i + 1}>
              Semester {i + 1}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Typography variant="h6" sx={{ mb: 2 }}>
        Semester {currentSemester}
      </Typography>

      {/* External Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Sl No</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Subject Code</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Subject</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Final IAT</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Max Marks(External)</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>1st Attempt</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>2nd Attempt</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>3rd Attempt</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>4th Attempt</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Passing Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {semesterData[currentSemester - 1].map((row, index) => (
              <TableRow key={index}>
                <TableCell>{index + 1}</TableCell>
                {Object.keys(row).map((field, i) => (
                  <TableCell key={i} sx={{ fontWeight: "normal" }}>
                    {editMode ? (
                      <TextField
                        variant="outlined"
                        size="small"
                        value={row[field]}
                        onChange={(e) => handleFieldChange(index, field, e.target.value)}
                      />
                    ) : (
                      row[field] || ""
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Additional Fields */}
      <Box sx={{ mt: 3 }}>
        <TextField
          fullWidth
          label="CGPA"
          value={finalCGPA}
          onChange={(e) => setFinalCGPA(e.target.value)}
          variant="outlined"
          size="small"
          sx={{ mb: 2 }}
          disabled={!editMode}
        />
        <TextField
          fullWidth
          label="Date of Final Result"
          value={finalResultDate}
          onChange={(e) => setFinalResultDate(e.target.value)}
          variant="outlined"
          size="small"
          disabled={!editMode}
        />
      </Box>

      {/* Buttons */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setEditMode(!editMode)}
          sx={{ ml: 2 }}
        >
          {editMode ? "Save" : "Edit"}
        </Button>
        <Button variant="outlined" onClick={handleMockData} sx={{ ml: 2 }}>
          Fill Mock Data
        </Button>
        <Button variant="outlined" color="secondary" onClick={handleReset} sx={{ ml: 2 }}>
          Reset
        </Button>
      </Box>
    </Box>
  );
}
