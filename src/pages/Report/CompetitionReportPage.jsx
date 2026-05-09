import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  useTheme,
  TextField,
  InputAdornment,
  IconButton
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  DownloadOutlined as DownloadOutlinedIcon,
  Search as SearchIcon
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import ExcelJS from "exceljs";
import Page from "../../components/Page";
import api from "../../utils/axios";
import { alpha } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 25;

const formatDate = (value) => {
  if (!value) {
    return "N/A";
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleDateString();
};

const buildStudentName = (row) => row?.name || row?.fullName || row?.studentName || "N/A";

const CompetitionReportPage = () => {
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [competitionRows, setCompetitionRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE);
  const [searchQuery, setSearchQuery] = useState("");

  const loadReports = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/reports/competitions");
      setCompetitionRows(response.data?.data?.competitions || []);
    } catch (error) {
      enqueueSnackbar(error?.response?.data?.message || "Failed to load reports", { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  }, [enqueueSnackbar]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const filteredRows = useMemo(() => {
    if (!searchQuery) return competitionRows;
    const lowerQuery = searchQuery.toLowerCase();
    return competitionRows.filter((row) => 
      buildStudentName(row).toLowerCase().includes(lowerQuery) ||
      (row.usn || "").toLowerCase().includes(lowerQuery) ||
      (row.email || "").toLowerCase().includes(lowerQuery) ||
      (row.department || "").toLowerCase().includes(lowerQuery) ||
      (row.eventName || "").toLowerCase().includes(lowerQuery)
    );
  }, [competitionRows, searchQuery]);

  const pageRows = useMemo(
    () => filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredRows, page, rowsPerPage]
  );

  const handleChangePage = (_event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDownloadCompetitionExcel = useCallback(async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Competition Report");

      worksheet.columns = [
        { header: "Student Name", key: "name", width: 24 },
        { header: "USN", key: "usn", width: 18 },
        { header: "Email", key: "email", width: 28 },
        { header: "Mentor Name", key: "mentorName", width: 24 },
        { header: "Department", key: "department", width: 18 },
        { header: "Semester", key: "sem", width: 12 },
        { header: "Event Name", key: "eventName", width: 28 },
        { header: "Organized By", key: "organizedBy", width: 24 },
        { header: "Event Date", key: "eventDate", width: 16 },
        { header: "Status", key: "status", width: 16 },
        { header: "Level", key: "level", width: 14 },
        { header: "Event Affiliation", key: "eventAffiliation", width: 18 },
      ];

      worksheet.addRows(
        filteredRows.map((row) => ({
          ...row,
          name: buildStudentName(row),
          eventDate: formatDate(row.eventDate),
        }))
      );

      worksheet.getRow(1).font = { bold: true };
      worksheet.autoFilter = {
        from: "A1",
        to: "L1",
      };

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "competition-report.xlsx";
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      enqueueSnackbar("Unable to generate Excel file", { variant: "error" });
    }
  }, [filteredRows, enqueueSnackbar]);

  return (
    <Page title="Competition Report">
      <Box
        sx={{
          minHeight: "100vh",
          py: 3,
          backgroundColor: isLight ? alpha(theme.palette.primary.lighter, 0.3) : alpha(theme.palette.grey[900], 0.18),
        }}
      >
        <Container maxWidth="xl">
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate("/report")}
            sx={{ mb: 2 }}
          >
            Back to Reports
          </Button>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.5, sm: 3, md: 4 },
              mb: 3,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              background: isLight
                ? "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(247,249,252,0.98) 100%)"
                : "linear-gradient(180deg, rgba(17,24,39,0.96) 0%, rgba(15,23,42,0.96) 100%)",
            }}
          >
            <Stack spacing={1}>
              <Typography variant="h4" sx={{ fontWeight: 900 }}>
                Competition Records
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 820, lineHeight: 1.8 }}>
                Review students who submitted competition entries in Career Review.
              </Typography>
            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <Box sx={{ p: { xs: 2, sm: 3 }, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
              >
                <TextField
                  placeholder="Search by name, USN, email, department..."
                  variant="outlined"
                  size="small"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(0);
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ minWidth: { xs: "100%", sm: 300 } }}
                />
                <Button
                  variant="contained"
                  startIcon={<DownloadOutlinedIcon />}
                  onClick={handleDownloadCompetitionExcel}
                  disabled={!filteredRows.length}
                >
                  Download Excel
                </Button>
              </Stack>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800 }}>Student</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>USN</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Mentor</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Department</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Event</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                        Loading report data...
                      </TableCell>
                    </TableRow>
                  ) : pageRows.length ? (
                    pageRows.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell>{buildStudentName(row)}</TableCell>
                        <TableCell>{row.usn || "N/A"}</TableCell>
                        <TableCell>{row.email || "N/A"}</TableCell>
                        <TableCell>{row.mentorName || "N/A"}</TableCell>
                        <TableCell>{row.department || "N/A"}</TableCell>
                        <TableCell>{row.eventName || "N/A"}</TableCell>
                        <TableCell>{formatDate(row.eventDate)}</TableCell>
                        <TableCell>{row.status || "N/A"}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                        No records found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={filteredRows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[25, 50, 100]}
            />
          </Paper>
        </Container>
      </Box>
    </Page>
  );
};

export default CompetitionReportPage;
