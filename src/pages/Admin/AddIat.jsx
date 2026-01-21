import { useState } from "react";
import { 
  Box, 
  Button, 
  CircularProgress, 
  Typography, 
  Container,
  Paper,
  Stack,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemText
} from "@mui/material";
import { 
  FileDownload as FileDownloadIcon,
  CloudUpload as CloudUploadIcon,
  HelpOutline as HelpOutlineIcon
} from '@mui/icons-material';
import { alpha, useTheme } from "@mui/material/styles";
import Papa from "papaparse";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

const AddIat = () => {
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const [processing, setProcessing] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [errors, setErrors] = useState([]);
  const [file, setFile] = useState(null);

  const downloadTemplate = () => {
    const headers = [
      "USN",
      "Sem",
      "SubjectCode", 
      "SubjectName",
      "IAT1",
      "IAT2",
      "Avg",
      "SubjectCode", 
      "SubjectName",
      "IAT1",
      "IAT2",
      "Avg"
    ];
    const exampleRow = ["USN123", "1", "CS101", "Programming", "50", "50","50", "CS102", "Data Structures", "45", "48", "46.5"];
    const csvContent = Papa.unparse([headers, exampleRow], { quotes: true });
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", "iat_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const parseHorizontalCSV = (content) => {
    // Parse CSV without header to access raw data
    const results = Papa.parse(content, {
      skipEmptyLines: true,
    });
    
    const rows = results.data;
    if (rows.length < 2) {
      throw new Error("CSV file must contain headers and at least one data row");
    }

    const headers = rows[0];
    const dataRows = rows.slice(1);
    const processedRows = [];

    // Process each data row
    for (const dataRow of dataRows) {
      const usn = dataRow[0];
      const sem = dataRow[1];
      
      if (!usn || !sem) continue;

      // Find all subject groups in this row
      let columnIndex = 2; // Start after USN and Sem
      const subjects = [];

      // Continue reading subject groups until we find empty headers
      while (columnIndex < headers.length) {
        const subjectCodeHeader = headers[columnIndex];
        const subjectNameHeader = headers[columnIndex + 1];
        
        // Stop if the next header is empty or undefined
        if (!subjectCodeHeader || subjectCodeHeader.trim() === "") {
          break;
        }

        const subjectCode = dataRow[columnIndex];
        const subjectName = dataRow[columnIndex + 1];
        const iat1 = dataRow[columnIndex + 2];
        const iat2 = dataRow[columnIndex + 3];
        const avg = dataRow[columnIndex + 4];

        // Only add if we have at least subjectCode
        if (subjectCode && subjectCode.trim() !== "") {
          subjects.push({
            SubjectCode: subjectCode,
            SubjectName: subjectName || "",
            IAT1: iat1 || undefined,
            IAT2: iat2 || undefined,
            Avg: avg || undefined,
          });
        }

        // Move to next subject group (5 columns: SubjectCode, SubjectName, IAT1, IAT2, Avg)
        columnIndex += 5;
      }

      // Create a row entry for each subject found
      for (const subject of subjects) {
        processedRows.push({
          USN: usn,
          Sem: sem,
          ...subject,
        });
      }
    }

    return processedRows;
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setFile(file);
    setProcessing(true);
    setErrors([]);
    setSuccessCount(0);
    setErrorCount(0);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target.result;
      let rows = [];
      if (file.type === "application/json") {
        try {
          rows = JSON.parse(content);
        } catch (error) {
          setErrors(["Invalid JSON format."]);
          setErrorCount(1);
          setProcessing(false);
          return;
        }
      } else {
        try {
          rows = parseHorizontalCSV(content);
        } catch (error) {
          setErrors([`CSV parsing error: ${error.message}`]);
          setErrorCount(1);
          setProcessing(false);
          return;
        }
      }
      await processRows(rows);
    };
    reader.readAsText(file);
  };

  const processRows = async (rows) => {
    let success = 0;
    let errors = 0;
    const newErrors = [];

    // Group rows by USN and Semester
    const groupedData = {};
    for (const row of rows) {
      if (!row.USN || !row.Sem || !row.SubjectCode || !row.SubjectName) {
        newErrors.push(`Row with missing USN, Sem, SubjectCode, or SubjectName: ${JSON.stringify(row)}`);
        errors++;
        continue; // Skip to the next row
      }

      const key = `${row.USN}-${row.Sem}`;
      if (!groupedData[key]) {
        groupedData[key] = {
          usn: row.USN,
          semester: parseInt(row.Sem, 10),
          subjects: [],
        };
      }
      groupedData[key].subjects.push({
        subjectCode: row.SubjectCode,
        subjectName: row.SubjectName,
        iat1: row.IAT1 !== undefined ? parseInt(row.IAT1, 10) : undefined, // Parse, handle undefined
        iat2: row.IAT2 !== undefined ? parseInt(row.IAT2, 10) : undefined,
        avg: row.Avg !== undefined ? parseInt(row.Avg, 10) : undefined,
      });
    }

    // Process each group (USN and Semester combination)
    for (const key in groupedData) {
      const data = groupedData[key];
      try {
        // Get userId by USN (as before)
        const response = await axios.get(
          `${BASE_URL}/users/usn/${data.usn}`
        );
        if (!response.data?.userId) {
          throw new Error(`User with USN ${data.usn} not found`);
        }
        const userId = response.data.userId;

        // Prepare the data for the IAT API
        const iatData = {
          semester: data.semester,
          subjects: data.subjects,
        };

        // Submit IAT data
        await axios.post(
          `${BASE_URL}/students/iat/${userId}`,
          iatData
        );
        success++;
      } catch (error) {
        errors++;
        newErrors.push(`Error for USN ${data.usn}, Semester ${data.semester}: ${error.message}`);
      }
    }

    setSuccessCount(success);
    setErrorCount(errors);
    setErrors(newErrors);
    setProcessing(false);
  };

  return (
    <Container maxWidth="md">
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 2,
          backgroundColor: isLight 
            ? 'rgba(255, 255, 255, 0.8)'
            : alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(8px)',
          boxShadow: isLight
            ? '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
            : '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
          mb: 4
        }}
      >
        <Box 
          sx={{ 
            textAlign: 'center',
            mb: 4
          }}
        >
          <Typography 
            variant="h4"
            sx={{
              fontWeight: 'bold',
              background: isLight 
                ? `-webkit-linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
                : `-webkit-linear-gradient(45deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
            }}
          >
            Upload IAT Marks
          </Typography>
          
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto' }}
          >
            Upload a CSV file with Internal Assessment Test marks for students
          </Typography>
        </Box>

        <Box
          sx={{
            backgroundColor: isLight 
              ? alpha(theme.palette.primary.main, 0.04)
              : alpha(theme.palette.info.main, 0.08),
            p: 3,
            borderRadius: 2,
            mb: 3,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Upload Instructions
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            CSV file should have a horizontal structure with repeating subject groups:
          </Typography>
          
          <Box 
            sx={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
              mb: 2,
              pl: 2,
              borderLeft: `4px solid ${isLight ? theme.palette.primary.main : theme.palette.info.main}`,
              py: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">• <strong>First columns:</strong> USN, Sem</Typography>
            <Typography variant="body2" color="text.secondary">• <strong>Then repeating groups:</strong> SubjectCode, SubjectName, IAT1, IAT2, Avg</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mt: 1 }}>
              Example: USN | Sem | SubjectCode | SubjectName | IAT1 | IAT2 | Avg | SubjectCode | SubjectName | IAT1 | IAT2 | Avg | ...
            </Typography>
          </Box>
          
          <Alert severity="info" sx={{ fontSize: '0.875rem', mb: 2 }}>
            The system will automatically detect all subjects by reading until it finds an empty column header.
          </Alert>

          <Divider sx={{ my: 3 }} />

          <Stack 
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems="center"
            justifyContent="center"
          >
            <Button 
              variant="outlined" 
              onClick={downloadTemplate}
              startIcon={<FileDownloadIcon />}
              sx={{
                borderRadius: '8px',
                py: 1.2,
                px: 3,
                width: { xs: '100%', sm: 'auto' },
                borderColor: isLight ? theme.palette.primary.main : theme.palette.info.main,
                color: isLight ? theme.palette.primary.main : theme.palette.info.main,
                '&:hover': {
                  borderColor: isLight ? theme.palette.primary.main : theme.palette.info.main,
                  backgroundColor: isLight 
                    ? alpha(theme.palette.primary.main, 0.04)
                    : alpha(theme.palette.info.main, 0.08),
                }
              }}
            >
              Download Template
            </Button>
            
            <Box
              sx={{
                position: 'relative',
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              <input
                accept=".csv,.json"
                style={{ display: 'none' }}
                id="upload-file"
                type="file"
                onChange={handleFileUpload}
              />
              <label htmlFor="upload-file">
                <Button 
                  variant="contained" 
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  disabled={processing}
                  sx={{
                    borderRadius: '8px',
                    py: 1.2,
                    px: 3,
                    width: { xs: '100%', sm: 'auto' },
                    position: 'relative',
                    bgcolor: isLight ? theme.palette.primary.main : theme.palette.info.main,
                    '&:hover': {
                      bgcolor: isLight 
                        ? theme.palette.primary.dark
                        : theme.palette.info.dark,
                    }
                  }}
                >
                  {processing ? (
                    <>
                      <CircularProgress
                        size={24}
                        thickness={4}
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          marginTop: '-12px',
                          marginLeft: '-12px',
                          color: 'white',
                        }}
                      />
                      Processing...
                    </>
                  ) : (
                    `${file ? 'File Selected' : 'Upload File'}`
                  )}
                </Button>
              </label>
            </Box>
          </Stack>
        </Box>

        {!processing && (successCount > 0 || errorCount > 0) && (
          <Box sx={{ mt: 3 }}>
            {successCount > 0 && (
              <Alert 
                severity="success" 
                sx={{ 
                  mb: 2,
                  borderRadius: 2,
                }}
              >
                Successfully processed: {successCount} student record(s)
              </Alert>
            )}
            
            {errorCount > 0 && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 2,
                  borderRadius: 2,
                }}
              >
                Errors encountered: {errorCount} record(s)
              </Alert>
            )}
            
            {errors.length > 0 && (
              <Box 
                sx={{ 
                  mt: 2,
                  backgroundColor: isLight 
                    ? alpha(theme.palette.error.main, 0.05)
                    : alpha(theme.palette.error.dark, 0.1),
                  borderRadius: 2,
                  p: 2,
                  maxHeight: 200,
                  overflowY: "auto",
                  border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Error Details:</Typography>
                <List dense>
                  {errors.map((error, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemText 
                        primary={error}
                        primaryTypographyProps={{ 
                          variant: 'body2', 
                          color: 'error.main' 
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>
        )}

        <Paper 
          elevation={1} 
          sx={{ 
            p: 2,
            mt: 4,
            backgroundColor: isLight 
              ? alpha(theme.palette.warning.main, 0.05)
              : alpha(theme.palette.warning.dark, 0.05),
            border: `1px dashed ${alpha(theme.palette.warning.main, 0.2)}`,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <HelpOutlineIcon 
            fontSize="small" 
            color="warning" 
            sx={{ flexShrink: 0 }}
          />
          <Typography variant="body2" color="text.secondary">
            <strong>Note:</strong> Make sure each USN corresponds to a registered student in the system. 
            Missing or invalid USNs will result in errors.
          </Typography>
        </Paper>
      </Paper>
    </Container>
  );
};

export default AddIat;