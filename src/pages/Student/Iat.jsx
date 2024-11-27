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

export default function IATModel() {
  const [currentSemester, setCurrentSemester] = useState(1);
  const [semesterData, setSemesterData] = useState(
    Array.from({ length: 8 }, () => Array(8).fill({ subject: "", maxMarks: "", IAT1: "", IAT2: "", IAT3: "", final: "" }))
  );
  const [editMode, setEditMode] = useState(false);

  const handleFieldChange = (rowIndex, field, value) => {
    const updatedSemesterData = [...semesterData];
    updatedSemesterData[currentSemester - 1][rowIndex][field] = value;
    setSemesterData(updatedSemesterData);
  };

  const handleReset = () => {
    const updatedSemesterData = [...semesterData];
    updatedSemesterData[currentSemester - 1] = Array(8).fill({
      subject: "",
      maxMarks: "",
      IAT1: "",
      IAT2: "",
      IAT3: "",
      final: "",
    });
    setSemesterData(updatedSemesterData);
  };

  const handleMockData = () => {
    const mockRows = [
      { subject: "Math", maxMarks: 100, IAT1: 45, IAT2: 50, IAT3: 40, final: 85 },
      { subject: "Physics", maxMarks: 100, IAT1: 42, IAT2: 48, IAT3: 44, final: 86 },
      { subject: "Chemistry", maxMarks: 100, IAT1: 38, IAT2: 45, IAT3: 43, final: 81 },
      { subject: "Biology", maxMarks: 100, IAT1: 40, IAT2: 44, IAT3: 42, final: 82 },
      { subject: "English", maxMarks: 100, IAT1: 50, IAT2: 49, IAT3: 48, final: 90 },
      { subject: "History", maxMarks: 100, IAT1: 35, IAT2: 40, IAT3: 37, final: 78 },
      { subject: "Geography", maxMarks: 100, IAT1: 46, IAT2: 47, IAT3: 45, final: 88 },
      { subject: "Computer Science", maxMarks: 100, IAT1: 48, IAT2: 49, IAT3: 47, final: 92 },
    ];
    const updatedSemesterData = [...semesterData];
    updatedSemesterData[currentSemester - 1] = mockRows;
    setSemesterData(updatedSemesterData);
  };

  return (
    <Box>
      {/* Semester Selector */}
      <FormControl fullWidth sx={{ mb: 3, maxWidth: 200}} >
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
        Semester {currentSemester} - IAT Records
      </Typography>

      {/* IAT Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Sl No</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Subject</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Max Marks</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>IAT-01</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>IAT-02</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>IAT-03</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Final</TableCell>
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
