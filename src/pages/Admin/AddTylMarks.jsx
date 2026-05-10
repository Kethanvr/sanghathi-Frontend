import { useCallback, useMemo, useState } from "react";
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
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton
} from "@mui/material";
import {
  FileDownload as FileDownloadIcon,
  CloudUpload as CloudUploadIcon,
  HelpOutline as HelpOutlineIcon
} from "@mui/icons-material";
import { alpha, useTheme } from "@mui/material/styles";
import ClearIcon from "@mui/icons-material/Clear";
import ExcelJS from "exceljs";
import Papa from "papaparse";
import api from "../../utils/axios";
import useDraftPersistence from "../../hooks/useDraftPersistence";
import { resolveDraftScopeId } from "../../utils/draftScope";
import { recordAdminUploadSession } from "../../utils/uploadHistory";

const TYL_PARAMETERS = [
  "Language Proficiency in English",
  "Aptitude",
  "Core Fundamentals",
  "Certifications",
  "Experiential Mini Projects",
  "Internships",
  "Soft Skills",
];

const TYL_LEGACY_GROUPS = {
  language: {
    fields: ["L1", "L2", "L3", "L4"],
    passes: { L1: 65, L2: 65, L3: 70, L4: 70 },
    target: 4,
  },
  aptitude: {
    fields: ["A1", "A2", "A3", "A4"],
    passes: { A1: 50, A2: 50, A3: 50, A4: 65 },
    target: 3,
  },
  softskill: {
    fields: ["S1", "S2", "S3", "S4"],
    passes: { S1: 50, S2: 50, S3: 50, S4: 50 },
    target: 3,
  },
  core: {
    fields: ["C2_Odd", "C2_Full", "C3_Odd", "C3_Full", "C4_Odd", "C4_Full", "C5_Full"],
    passes: { C2_Odd: 10, C2_Full: 10, C3_Odd: 25, C3_Full: 50, C4_Odd: 50, C4_Full: 50, C5_Full: 50 },
    target: 3,
  },
  programming: {
    fields: [
      "P1_C",
      "P2_Python",
      "P3_Python",
      "P3_Java",
      "P4_Programming_Part1",
      "P4_Programming_Part2",
      "P4_MAD_FSD",
      "P4_DS",
      "P2Plus_Python",
    ],
    passes: {
      P1_C: 50,
      P2_Python: 50,
      P3_Python: 60,
      P3_Java: 60,
      P4_Programming_Part1: 70,
      P4_Programming_Part2: 70,
      P4_MAD_FSD: 70,
      P4_DS: 70,
      P2Plus_Python: 60,
    },
    target: 4,
  },
};

const TYL_PARAMETER_LOOKUP = new Map(
  TYL_PARAMETERS.map((parameter) => [parameter.toLowerCase(), parameter])
);

const normalizeKey = (value = "") => value.toString().trim().replace(/\s+/g, " ").toLowerCase();

const normalizeUsn = (value = "") => value
  ?.toString()
  .trim()
  .replace(/[\u200B-\u200D\uFEFF\u00A0]/g, "")
  .toUpperCase();

const toPlainValue = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  const text = value.toString().trim();
  if (!text) {
    return "";
  }

  const numericValue = Number(text);
  return Number.isFinite(numericValue) ? numericValue : text;
};

const createEmptyScores = () => TYL_PARAMETERS.reduce((accumulator, parameter) => {
  accumulator[parameter] = { target: "", actual: "" };
  return accumulator;
}, {});

const getCanonicalParameter = (parameter) => {
  const normalized = normalizeKey(parameter);
  return TYL_PARAMETER_LOOKUP.get(normalized) || null;
};

const AddTylMarks = () => {
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";

  const [processing, setProcessing] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [errors, setErrors] = useState([]);
  const [file, setFile] = useState(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [tempRows, setTempRows] = useState([]);

  const draftScopeId = useMemo(() => resolveDraftScopeId(), []);

  const restoreDraftState = useCallback((draftData = {}) => {
    setSuccessCount(Number(draftData.successCount) || 0);
    setErrorCount(Number(draftData.errorCount) || 0);
    setErrors(Array.isArray(draftData.errors) ? draftData.errors : []);
  }, []);

  const persistedErrors = useMemo(() => errors.slice(0, 200), [errors]);

  useDraftPersistence({
    formType: "admin-tyl-upload",
    scopeId: draftScopeId,
    values: {
      successCount,
      errorCount,
      errors: persistedErrors,
      hasSelectedFile: Boolean(file),
      isProcessing: processing,
    },
    reset: restoreDraftState,
    enableServerSync: false,
  });

  // ================= TEMPLATE DOWNLOAD =================
  const downloadTemplate = useCallback(async () => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Sanghathi";
    workbook.created = new Date();

    const dataSheet = workbook.addWorksheet("TYL Marks", {
      views: [{ state: "frozen", ySplit: 1 }],
    });
    dataSheet.columns = [
      { header: "USN", key: "USN", width: 22 },
      { header: "Parameter", key: "Parameter", width: 36 },
      { header: "Target", key: "Target", width: 16 },
      { header: "Actual", key: "Actual", width: 16 },
      { header: "Semester", key: "Semester", width: 14 },
    ];

    dataSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    dataSheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1D4ED8" },
    };
    dataSheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };
    dataSheet.autoFilter = { from: "A1", to: "E1" };

    const guideSheet = workbook.addWorksheet("Guide");
    guideSheet.columns = [
      { header: "Selected Tab Guide", key: "title", width: 30 },
      { header: "Details", key: "details", width: 90 },
    ];
    guideSheet.addRow(["Selected Tab Guide", "Add TYL Marks"]);
    guideSheet.addRow(["Columns", "USN | Parameter | Target | Actual | Semester"]);
    guideSheet.addRow(["Note", "TYL entries are user-scoped; wrong USN will fail the row."]);
    guideSheet.addRow(["Note", "Confirm semester mapping before uploading large files."]);
    guideSheet.addRow(["Parameters", TYL_PARAMETERS.join(" | ")]);
    guideSheet.getRow(1).font = { bold: true };
    guideSheet.getColumn(1).font = { bold: true };
    guideSheet.getColumn(1).width = 28;
    guideSheet.getColumn(2).width = 92;
    guideSheet.eachRow((row, rowNumber) => {
      row.alignment = { vertical: "top", wrapText: true };
      if (rowNumber > 1) {
        row.getCell(1).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: rowNumber % 2 === 0 ? "FFF8FAFC" : "FFFFFFFF" },
        };
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", "tyl_marks_template.xlsx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  // ================= LEVEL CALCULATION =================
  const calculateLevel = (marksObj, passingCriteria) => {
    let passed = 0;
    const total = Object.keys(passingCriteria).length;

    for (const key in passingCriteria) {
      const mark = parseInt(marksObj[key] || 0, 10);
      if (mark >= passingCriteria[key]) passed++;
    }

    if (passed === total) return 2;
    if (passed > 0) return 1;
    return 0;
  };

  // ================= FILE UPLOAD =================
  const handleFileUpload = async (event) => {
    const uploadedFile = event.target.files[0];
    if (!uploadedFile) return;

    try {
      setFile(uploadedFile);
      const fileName = uploadedFile.name.toLowerCase();
      let parsedRows = [];

      if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
        const buffer = await uploadedFile.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.worksheets[0];

        if (!worksheet) {
          throw new Error("The workbook does not contain any sheets.");
        }

        const headers = worksheet.getRow(1).values.slice(1).map((header) => header?.toString().trim());
        parsedRows = [];

        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return;

          const record = {};
          let hasContent = false;

          headers.forEach((header, index) => {
            if (!header) return;
            const cellValue = row.getCell(index + 1).text?.trim?.() || row.getCell(index + 1).value || "";
            const plainValue = typeof cellValue === "object" && cellValue !== null ? row.getCell(index + 1).text : cellValue;
            record[header] = plainValue;
            if (String(plainValue ?? "").trim() !== "") {
              hasContent = true;
            }
          });

          if (hasContent) {
            parsedRows.push(record);
          }
        });
      } else {
        const content = await uploadedFile.text();
        const results = Papa.parse(content, {
          header: true,
          skipEmptyLines: true,
        });

        parsedRows = Array.isArray(results.data) ? results.data.filter((row) => Object.keys(row || {}).length > 0) : [];
      }

      if (parsedRows.length === 0) {
        throw new Error("No data rows were found in the uploaded file.");
      }

      setTempRows(parsedRows);
      setOpenConfirm(true);
    } catch (error) {
      setFile(null);
      setTempRows([]);
      setErrors([error.message || "Unable to read the uploaded file."]);
      setErrorCount(1);
      setSuccessCount(0);
    } finally {
      event.target.value = "";
    }
  };

  const handleConfirmUpload = async () => {
    setOpenConfirm(false);
    setProcessing(true);
    setErrors([]);
    setSuccessCount(0);
    setErrorCount(0);
    await processRows(tempRows);
  };

  const handleClearResults = () => {
    setSuccessCount(0);
    setErrorCount(0);
    setErrors([]);
    setFile(null);
  };

  // ================= PROCESS ROWS =================
  const processRows = async (rows) => {
    let success = 0;
    let errCount = 0;
    const newErrors = [];
    const affectedUserIds = new Set();
    const uploadEntries = [];
    const previousSemesterByTarget = new Map();
    const cloneValue = (value) => {
      if (value === undefined || value === null) {
        return value;
      }

      return JSON.parse(JSON.stringify(value));
    };

    const looksLikeRowWiseFormat = rows.some((row) =>
      Object.prototype.hasOwnProperty.call(row || {}, "Parameter") ||
      Object.prototype.hasOwnProperty.call(row || {}, "Semester")
    );

    const normalizedEntries = looksLikeRowWiseFormat
      ? (() => {
          const groupedEntries = new Map();

          for (const row of rows) {
            const usn = normalizeUsn(row.USN);
            const semester = Number.parseInt((row.Semester ?? row.semester ?? "").toString().trim(), 10);
            const parameter = getCanonicalParameter(row.Parameter ?? row.parameter);

            if (!usn || !semester || !parameter) {
              continue;
            }

            const groupKey = `${usn}::${semester}`;
            if (!groupedEntries.has(groupKey)) {
              groupedEntries.set(groupKey, {
                usn,
                semester,
                scores: createEmptyScores(),
              });
            }

            groupedEntries.get(groupKey).scores[parameter] = {
              target: toPlainValue(row.Target ?? row.target),
              actual: toPlainValue(row.Actual ?? row.actual),
            };
          }

          return Array.from(groupedEntries.values());
        })()
      : rows
          .map((row) => {
            const usn = normalizeUsn(row.USN);
            if (!usn) {
              return null;
            }

            const language = { L1: row.L1, L2: row.L2, L3: row.L3, L4: row.L4 };
            const aptitude = { A1: row.A1, A2: row.A2, A3: row.A3, A4: row.A4 };
            const softskill = { S1: row.S1, S2: row.S2, S3: row.S3, S4: row.S4 };
            const core = {
              C2_Odd: row.C2_Odd, C2_Full: row.C2_Full,
              C3_Odd: row.C3_Odd, C3_Full: row.C3_Full,
              C4_Odd: row.C4_Odd, C4_Full: row.C4_Full,
              C5_Full: row.C5_Full,
            };
            const programming = {
              P1_C: row.P1_C,
              P2_Python: row.P2_Python,
              P3_Python: row.P3_Python,
              P3_Java: row.P3_Java,
              P4_Programming_Part1: row.P4_Programming_Part1,
              P4_Programming_Part2: row.P4_Programming_Part2,
              P4_MAD_FSD: row.P4_MAD_FSD,
              P4_DS: row.P4_DS,
              P2Plus_Python: row.P2Plus_Python,
            };

            const calculateLegacyLevel = (marksObj, passingCriteria) => {
              let passed = 0;
              const total = Object.keys(passingCriteria).length;

              for (const key in passingCriteria) {
                const mark = parseInt(marksObj[key] || 0, 10);
                if (mark >= passingCriteria[key]) passed++;
              }

              if (passed === total) return 2;
              if (passed > 0) return 1;
              return 0;
            };

            const scores = {
              "Language Proficiency in English": {
                target: TYL_LEGACY_GROUPS.language.target,
                actual: calculateLegacyLevel(language, TYL_LEGACY_GROUPS.language.passes),
              },
              "Aptitude": {
                target: TYL_LEGACY_GROUPS.aptitude.target,
                actual: calculateLegacyLevel(aptitude, TYL_LEGACY_GROUPS.aptitude.passes),
              },
              "Core Fundamentals": {
                target: TYL_LEGACY_GROUPS.core.target,
                actual: calculateLegacyLevel(core, TYL_LEGACY_GROUPS.core.passes),
              },
              "Certifications": {
                target: 4,
                actual: 0,
              },
              "Experiential Mini Projects": {
                target: 4,
                actual: 0,
              },
              "Internships": {
                target: 4,
                actual: 0,
              },
              "Soft Skills": {
                target: TYL_LEGACY_GROUPS.softskill.target,
                actual: calculateLegacyLevel(softskill, TYL_LEGACY_GROUPS.softskill.passes),
              },
            };

            return {
              usn,
              semester: 1,
              scores,
            };
          })
          .filter(Boolean);

    for (const entry of normalizedEntries) {
      try {
        const response = await api.get(`/users/usn/${encodeURIComponent(entry.usn)}`);
        const userId = response.data?.userId || response.data?._id;
        if (!userId) throw new Error("User not found");

        const targetKey = `${userId}-${entry.semester}`;
        if (!previousSemesterByTarget.has(targetKey)) {
          let previousSemester = null;
          try {
            const currentResponse = await api.get(`/tyl-scores/${userId}`);
            const currentSemesters = Array.isArray(currentResponse.data?.data) ? currentResponse.data.data : [];
            previousSemester = currentSemesters.find((semesterEntry) => Number(semesterEntry.semester) === Number(entry.semester)) || null;
          } catch (snapshotError) {
            if (snapshotError?.response?.status !== 404) {
              throw snapshotError;
            }
          }

          previousSemesterByTarget.set(targetKey, cloneValue(previousSemester));
        }

        await api.post(`/tyl-scores`, {
          userId,
          semester: Number(entry.semester),
          scores: entry.scores,
        });

        success++;
        affectedUserIds.add(String(userId));
        uploadEntries.push({
          uploadIndex: uploadEntries.length + 1,
          userId: String(userId),
          usn: entry.usn,
          semester: Number(entry.semester),
          previousSemester: previousSemesterByTarget.get(targetKey),
        });
      } catch (error) {
        errCount++;
        newErrors.push(`Error for ${entry.usn}: ${error.message}`);
      }
    }

    await recordAdminUploadSession({
      tabType: "add-tyl-marks",
      fileName: file?.name || "",
      totalRows: rows.length,
      successCount: success,
      errorCount: errCount,
      errors: newErrors,
      affectedUserIds: Array.from(affectedUserIds),
      metadata: {
        entries: uploadEntries,
      },
    });

    setSuccessCount(success);
    setErrorCount(errCount);
    setErrors(newErrors);
    setProcessing(false);
  };

  // ================= UI =================
  return (
    <Container maxWidth="lg" sx={{ px: { xs: 1.5, sm: 3 }, py: { xs: 2, sm: 3 } }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2, mb: 4 }}>
        <Typography variant="h4" align="center" sx={{ mb: 2 }}>
          Upload TYL Marks
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center" alignItems="stretch">
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={downloadTemplate}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Download Template
          </Button>

          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUploadIcon />}
            disabled={processing}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            {processing ? "Processing..." : "Upload File"}
            <input
              hidden
              accept=".csv,.xlsx,.xls"
              type="file"
              onChange={handleFileUpload}
            />
          </Button>
        </Stack>

        {!processing && (successCount > 0 || errorCount > 0) && (
          <Box sx={{ mt: 3 }}>
            {successCount > 0 && (
              <Alert severity="success">
                Successfully processed: {successCount}
              </Alert>
            )}
            {errorCount > 0 && (
              <Alert severity="error">
                Errors encountered: {errorCount}
              </Alert>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Button 
                size="small" 
                onClick={handleClearResults}
                startIcon={<ClearIcon />}
                color="inherit"
                sx={{ opacity: 0.7 }}
              >
                Clear Results
              </Button>
            </Box>
          </Box>
        )}

        {errors.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <List dense>
              {errors.map((err, index) => (
                <ListItem key={index}>
                  <ListItemText primary={err} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        <Paper sx={{ mt: 4, p: 2 }}>
          <Typography variant="body2">
            <strong>Note:</strong> Use the downloaded xlsx template for the row-wise TYL upload format. Legacy wide CSV files are still supported.
          </Typography>
        </Paper>
      </Paper>

      <Dialog
        open={openConfirm}
        onClose={() => setOpenConfirm(false)}
        PaperProps={{
          sx: { borderRadius: 2, p: 1 }
        }}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>Confirm Upload</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have selected <strong>{file?.name}</strong> with <strong>{tempRows.length}</strong> records. 
            Are you sure you want to proceed with the bulk upload for <strong>TYL Marks</strong>?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenConfirm(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmUpload} 
            variant="contained" 
            autoFocus
            sx={{ bgcolor: theme.palette.primary.main, '&:hover': { bgcolor: theme.palette.primary.dark } }}
          >
            Start Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AddTylMarks;