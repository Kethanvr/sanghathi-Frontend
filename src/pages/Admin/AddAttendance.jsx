import { useState } from "react";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import Papa from "papaparse";
import axios from "axios";

const AddAttendance = () => {
  const [processing, setProcessing] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [errors, setErrors] = useState([]);

  const downloadTemplate = () => {
    const headers = [
      "Name",
      "USN",
      "Sem",
      "Month",
      "Mathematics",
      "Mathematics Total",
      "Science",
      "Science Total",
    ];
    const exampleRow = ["John Doe", "USN123", "1", "1", "15", "20", "18", "20"];
    const csvContent = Papa.unparse([headers, exampleRow], { quotes: true });
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", "attendance_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target.result;
      let rows = [];
      if (file.type === "application/json") {
        rows = JSON.parse(content);
      } else {
        const results = Papa.parse(content, {
          header: true,
          skipEmptyLines: true,
        });
        rows = results.data;
      }
      await processRows(rows);
    };
    reader.readAsText(file);
  };

  const processRows = async (rows) => {
    setProcessing(true);
    let success = 0;
    let errors = 0;
    const newErrors = [];

    for (const [index, row] of rows.entries()) {
      try {
        if (!row.USN || !row.Sem || !row.Month) {
          throw new Error("Missing required fields (USN, Sem, Month)");
        }

        const subjects = [];
        const headers = Object.keys(row).filter(
          (key) => key !== "Name" && key !== "USN" && key !== "Sem" && key !== "Month"
        );

        for (let i = 0; i < headers.length; i += 2) {
          const subjectHeader = headers[i];
          const totalHeader = headers[i + 1];
          if (!totalHeader || !totalHeader.endsWith(" Total")) {
            throw new Error(`Invalid subject columns at ${subjectHeader}`);
          }
          const subjectName = subjectHeader.replace(" Total", "");
          const attended = parseInt(row[subjectHeader], 10);
          const total = parseInt(row[totalHeader], 10);
          if (isNaN(attended) || isNaN(total)) {
            throw new Error(`Invalid numbers for ${subjectName}`);
          }
          subjects.push({
            subjectName,
            attendedClasses: attended,
            totalClasses: total,
          });
        }

        //axios needs to be changed to api.get. This is only for testing as api.get is not working for now
        const response = await axios.get(`http://localhost:8000/api/users/usn/${row.USN}`);
        console.log("Response: ",response);
        if (!response.data?.userId) {
          throw new Error(`User with USN ${row.USN} not found`);
        }
        const userId = response.data.userId;
        console.log("UserId: ", userId);

        const attendanceData = {
          semester: parseInt(row.Sem, 10),
          month: parseInt(row.Month, 10),
          subjects,
        };
        console.log("Attendance Data: ", attendanceData);

        //Do not use axios.post directly (above as well)
        await axios.post(`http://localhost:8000/api/students/attendance/${userId}`, attendanceData);
        success++;
      } catch (error) {
        errors++;
        newErrors.push(`Row ${index + 1}: ${error.message}`);
      }
    }

    setSuccessCount(success);
    setErrorCount(errors);
    setErrors(newErrors);
    setProcessing(false);
  };

  return (
    <Box sx={{ p: 2 }}>
      <h1>Upload Attendance</h1>
      <Button
        variant="contained"
        onClick={downloadTemplate}
        sx={{ mr: 2 }}
      >
        Download Template
      </Button>
      <input
        accept=".csv,.json"
        style={{ display: "none" }}
        id="upload-file"
        type="file"
        onChange={handleFileUpload}
      />
      <label htmlFor="upload-file">
        <Button variant="contained" component="span">
          Upload File
        </Button>
      </label>
      {processing && <CircularProgress sx={{ mt: 2 }} />}
      {!processing && (successCount > 0 || errorCount > 0) && (
        <Box sx={{ mt: 2 }}>
          <Typography>Successfully processed: {successCount}</Typography>
          <Typography>Errors: {errorCount}</Typography>
          {errors.map((error, index) => (
            <Typography key={index} color="error">
              {error}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default AddAttendance;