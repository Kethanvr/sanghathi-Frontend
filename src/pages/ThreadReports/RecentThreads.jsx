import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  AvatarGroup,
  Button,
  useTheme,
  TextField,
  MenuItem,
  InputAdornment,
  CircularProgress,
  Stack,
  Chip,
  alpha,
} from "@mui/material";
import {
  Search as SearchIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  MessageRounded as MessageRoundedIcon,
  OpenInNew as OpenInNewIcon,
} from "@mui/icons-material";
import { useSnackbar } from "notistack";
import Page from "../../components/Page";
import api from "../../utils/axios";
import { AuthContext } from "../../context/AuthContext";
import { getAvatarSrc, getAvatarFallbackText } from "../../utils/avatarResolver";
import { Grid } from "@mui/material";

const RecentThreads = () => {
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useContext(AuthContext);

  const [threads, setThreads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("desc"); // newest first
  const [categories, setCategories] = useState([]);

  // Fetch recent threads
  useEffect(() => {
    const fetchRecentThreads = async () => {
      try {
        setIsLoading(true);
        const response = await api.get(`/threads`, {
          params: {
            limit: 100,
            sort: "-createdAt",
          },
        });

        const threadsData = response.data.data?.threads || [];
        setThreads(Array.isArray(threadsData) ? threadsData : []);

        // Extract unique categories
        const uniqueCategories = [
          ...new Set(threadsData.map((t) => t?.topic).filter(Boolean)),
        ];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Error fetching recent threads:", error);
        enqueueSnackbar("Failed to load threads", { variant: "error" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentThreads();
  }, [enqueueSnackbar]);

  // Filter and sort threads
  const filteredThreads = threads
    .filter((thread) => {
      const searchMatch =
        (thread?.title || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (thread?.description || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (thread?.author?.name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const statusMatch = !statusFilter || thread?.status === statusFilter;
      const categoryMatch = !categoryFilter || thread?.topic === categoryFilter;

      return searchMatch && statusMatch && categoryMatch;
    })
    .sort((a, b) => {
      const dateA = new Date(a?.createdAt);
      const dateB = new Date(b?.createdAt);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

  const handleViewThread = (threadId) => {
    navigate(`/threads/${threadId}`);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "#4caf50";
      case "closed":
        return "#f44336";
      case "in progress":
        return "#ff9800";
      default:
        return "#9e9e9e";
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc");
  };

  return (
    <Page title="Recent Threads">
      <Box
        sx={{
          pt: 3,
          pb: 5,
          backgroundColor: isLight
            ? alpha(theme.palette.primary.lighter, 0.4)
            : alpha(theme.palette.grey[900], 0.2),
          minHeight: "100vh",
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 1.5, sm: 0 } }}>
          {/* Header */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4 },
              mb: 4,
              borderRadius: 3,
              backgroundColor: isLight
                ? "rgba(255, 255, 255, 0.9)"
                : alpha(theme.palette.background.paper, 0.7),
              backdropFilter: "blur(20px)",
              border: `1px solid ${alpha(
                isLight ? theme.palette.primary.main : theme.palette.info.main,
                0.1
              )}`,
            }}
          >
            <Stack spacing={2}>
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    mb: 0.5,
                    color: theme.palette.text.primary,
                  }}
                >
                  Recent Threads
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  View latest threads created across departments
                </Typography>
              </Box>

              {/* Filters */}
              <Grid container spacing={2} alignItems="flex-end">
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search threads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Status"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="">All Status</MenuItem>
                    <MenuItem value="open">Open</MenuItem>
                    <MenuItem value="closed">Closed</MenuItem>
                    <MenuItem value="in progress">In Progress</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Category"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat || "Uncategorized"}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={
                      sortOrder === "desc" ? (
                        <ArrowDownwardIcon />
                      ) : (
                        <ArrowUpwardIcon />
                      )
                    }
                    onClick={toggleSortOrder}
                    color={isLight ? "primary" : "info"}
                  >
                    {sortOrder === "desc" ? "Newest" : "Oldest"}
                  </Button>
                </Grid>
              </Grid>
            </Stack>
          </Paper>

          {/* Content */}
          {isLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "400px",
              }}
            >
              <CircularProgress />
            </Box>
          ) : filteredThreads.length > 0 ? (
            <TableContainer
              component={Paper}
              sx={{
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                backgroundColor: isLight
                  ? "rgba(255, 255, 255, 0.8)"
                  : alpha(theme.palette.background.paper, 0.7),
              }}
            >
              <Table>
                <TableHead
                  sx={{
                    backgroundColor: isLight
                      ? alpha(theme.palette.primary.main, 0.08)
                      : alpha(theme.palette.info.main, 0.1),
                  }}
                >
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }} align="center">
                      Status
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Created</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Author</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }} align="center">
                      Participants
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }} align="center">
                      Messages
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold" }} align="center">
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredThreads.map((thread) => (
                    <TableRow
                      key={thread._id}
                      hover
                      sx={{
                        "&:hover": {
                          backgroundColor: isLight
                            ? alpha(theme.palette.primary.main, 0.04)
                            : alpha(theme.palette.info.main, 0.08),
                        },
                      }}
                    >
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 500, maxWidth: 200 }}
                          noWrap
                        >
                          {thread?.title || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={thread?.topic || "Uncategorized"}
                          size="small"
                          sx={{
                            backgroundColor: isLight
                              ? alpha(theme.palette.primary.main, 0.1)
                              : alpha(theme.palette.info.main, 0.15),
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={thread?.status || "N/A"}
                          size="small"
                          sx={{
                            backgroundColor: alpha(
                              getStatusColor(thread?.status),
                              0.2
                            ),
                            color: getStatusColor(thread?.status),
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(thread?.createdAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Avatar
                            src={getAvatarSrc(thread?.author) || undefined}
                            sx={{
                              width: 28,
                              height: 28,
                              mr: 1,
                              bgcolor: isLight
                                ? theme.palette.primary.main
                                : theme.palette.info.main,
                              fontSize: "0.75rem",
                            }}
                          >
                            {!getAvatarSrc(thread?.author)
                              ? getAvatarFallbackText(thread?.author?.name)
                              : null}
                          </Avatar>
                          <Typography variant="body2">
                            {thread?.author?.name || "Unknown"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <AvatarGroup max={3} sx={{ justifyContent: "center" }}>
                          {(thread?.participants || []).slice(0, 3).map((p) => (
                            <Avatar
                              key={p._id}
                              src={getAvatarSrc(p) || undefined}
                              sx={{
                                width: 28,
                                height: 28,
                                bgcolor: isLight
                                  ? theme.palette.primary.main
                                  : theme.palette.info.main,
                                fontSize: "0.7rem",
                              }}
                            >
                              {!getAvatarSrc(p)
                                ? getAvatarFallbackText(p?.name)
                                : null}
                            </Avatar>
                          ))}
                        </AvatarGroup>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          icon={<MessageRoundedIcon />}
                          label={thread?.messages?.length || 0}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          size="small"
                          endIcon={<OpenInNewIcon />}
                          onClick={() => handleViewThread(thread._id)}
                          color={isLight ? "primary" : "info"}
                        >
                          Open
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 4,
                textAlign: "center",
                borderRadius: 2,
                backgroundColor: isLight
                  ? alpha(theme.palette.primary.main, 0.05)
                  : alpha(theme.palette.info.main, 0.1),
                border: `1px dashed ${alpha(theme.palette.divider, 0.3)}`,
              }}
            >
              <MessageRoundedIcon
                sx={{
                  fontSize: 48,
                  color: "text.secondary",
                  mb: 2,
                  opacity: 0.5,
                }}
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No threads found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchTerm || statusFilter || categoryFilter
                  ? "Try adjusting your filters"
                  : "No recent threads available"}
              </Typography>
            </Paper>
          )}
        </Container>
      </Box>
    </Page>
  );
};

export default RecentThreads;
