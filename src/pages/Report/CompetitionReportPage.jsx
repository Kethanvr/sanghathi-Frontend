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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  MenuItem
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
  const [filterMentor, setFilterMentor] = useState("");
  const [filterSemester, setFilterSemester] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [viewDetailsRow, setViewDetailsRow] = useState(null);

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

  const mentors = useMemo(() => [...new Set(competitionRows.map(r => r.mentorName).filter(Boolean))], [competitionRows]);
  const semesters = useMemo(() => [...new Set(competitionRows.map(r => r.sem).filter(Boolean))], [competitionRows]);
  const statuses = useMemo(() => [...new Set(competitionRows.map(r => r.status).filter(Boolean))], [competitionRows]);

  const filteredRows = useMemo(() => {
    return competitionRows.filter((row) => {
      if (filterMentor && row.mentorName !== filterMentor) return false;
      if (filterSemester && String(row.sem) !== String(filterSemester)) return false;
      if (filterStatus && row.status !== filterStatus) return false;
      
      if (!searchQuery) return true;
      const lowerQuery = searchQuery.toLowerCase();
      return (
        buildStudentName(row).toLowerCase().includes(lowerQuery) ||
        (row.usn || "").toLowerCase().includes(lowerQuery) ||
        (row.email || "").toLowerCase().includes(lowerQuery) ||
        (row.department || "").toLowerCase().includes(lowerQuery) ||
        (row.eventName || "").toLowerCase().includes(lowerQuery)
      );
    });
  }, [competitionRows, searchQuery, filterMentor, filterSemester, filterStatus]);

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
        { header: "Contact Number", key: "contactNumber", width: 16 },
        { header: "Cash Award/Trophy", key: "cashAwardOrTrophy", width: 20 },
        { header: "Project Title", key: "projectTitle", width: 28 },
        { header: "Category", key: "category", width: 20 },
        { header: "Event Type", key: "eventType", width: 20 },
        { header: "Financial Support", key: "financialSupportRequested", width: 18 },
        { header: "Amount Sanctioned", key: "amountSanctioned", width: 18 },
        { header: "Related To", key: "relatedTo", width: 14 },
        { header: "Proof Link", key: "proofLink", width: 30 },
      ];

      worksheet.addRows(
        filteredRows.map((row) => ({
          ...row,
          name: buildStudentName(row),
          eventDate: formatDate(row.eventDate),
          financialSupportRequested: row.financialSupportRequested ? "Requested" : "NA"
        }))
      );

      worksheet.getRow(1).font = { bold: true };
      worksheet.autoFilter = {
        from: "A1",
        to: "V1",
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
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ flexGrow: 1, flexWrap: "wrap" }}>
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
                    sx={{ minWidth: { xs: "100%", sm: 250 } }}
                  />
                  <TextField
                    select
                    label="Mentor"
                    size="small"
                    value={filterMentor}
                    onChange={(e) => { setFilterMentor(e.target.value); setPage(0); }}
                    sx={{ minWidth: 150 }}
                  >
                    <MenuItem value="">All Mentors</MenuItem>
                    {mentors.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                  </TextField>
                  <TextField
                    select
                    label="Semester"
                    size="small"
                    value={filterSemester}
                    onChange={(e) => { setFilterSemester(e.target.value); setPage(0); }}
                    sx={{ minWidth: 120 }}
                  >
                    <MenuItem value="">All Sems</MenuItem>
                    {semesters.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </TextField>
                  <TextField
                    select
                    label="Status"
                    size="small"
                    value={filterStatus}
                    onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
                    sx={{ minWidth: 150 }}
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    {statuses.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </TextField>
                </Stack>
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
                    <TableCell sx={{ fontWeight: 800 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
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
                        <TableCell>
                          <Button size="small" variant="outlined" color="primary" onClick={() => setViewDetailsRow(row)}>
                            View All Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
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

      {/* Details Dialog */}
      <Dialog open={!!viewDetailsRow} onClose={() => setViewDetailsRow(null)} maxWidth="md" fullWidth>
        <DialogTitle>Competition Entry Details</DialogTitle>
        <DialogContent dividers>
          {viewDetailsRow && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Student Name</Typography>
                <Typography variant="body1">{buildStudentName(viewDetailsRow)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">USN</Typography>
                <Typography variant="body1">{viewDetailsRow.usn || "N/A"}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                <Typography variant="body1">{viewDetailsRow.email || "N/A"}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Contact Number</Typography>
                <Typography variant="body1">{viewDetailsRow.contactNumber || "N/A"}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Mentor Name</Typography>
                <Typography variant="body1">{viewDetailsRow.mentorName || "N/A"}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Department & Semester</Typography>
                <Typography variant="body1">{viewDetailsRow.department || "N/A"} - Sem {viewDetailsRow.sem || "N/A"}</Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Event Details</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Event Name</Typography>
                <Typography variant="body1">{viewDetailsRow.eventName || "N/A"}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Organized By</Typography>
                <Typography variant="body1">{viewDetailsRow.organizedBy || "N/A"}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Event Date</Typography>
                <Typography variant="body1">{formatDate(viewDetailsRow.eventDate)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                <Typography variant="body1">{viewDetailsRow.status || "N/A"}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Project Title</Typography>
                <Typography variant="body1">{viewDetailsRow.projectTitle || "N/A"}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                <Typography variant="body1">{viewDetailsRow.category || "N/A"}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Level</Typography>
                <Typography variant="body1">{viewDetailsRow.level || "N/A"}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Event Type & Affiliation</Typography>
                <Typography variant="body1">{viewDetailsRow.eventType || "N/A"} ({viewDetailsRow.eventAffiliation || "N/A"})</Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Awards & Support</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Cash Award/Trophy</Typography>
                <Typography variant="body1">{viewDetailsRow.cashAwardOrTrophy || "N/A"}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Financial Support Requested</Typography>
                <Typography variant="body1">{viewDetailsRow.financialSupportRequested ? "Yes" : "No"}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Amount Sanctioned</Typography>
                <Typography variant="body1">{viewDetailsRow.amountSanctioned || "N/A"}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Related To</Typography>
                <Typography variant="body1">{viewDetailsRow.relatedTo || "N/A"}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Proof Link</Typography>
                <Typography variant="body1">
                  {viewDetailsRow.proofLink && viewDetailsRow.proofLink !== "N/A" ? (
                    <a href={viewDetailsRow.proofLink} target="_blank" rel="noopener noreferrer">View Proof</a>
                  ) : "N/A"}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDetailsRow(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Page>
  );
};

export default CompetitionReportPage;
