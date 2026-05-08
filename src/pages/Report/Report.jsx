  import { Box, Container, Paper, Stack, Typography } from "@mui/material";
import { useNavigate, Navigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import UpgradeOutlinedIcon from "@mui/icons-material/UpgradeOutlined";
import Page from "../../components/Page";

const Report = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Redirect HOD to new Thread Reports page
  useEffect(() => {
    if (user?.roleName === "hod") {
      navigate("/hod/thread-reports", { replace: true });
    } else if (user?.roleName === "admin" || user?.roleName === "director") {
      // For admin and director, also redirect to thread reports
      navigate("/hod/thread-reports", { replace: true });
    }
  }, [user, navigate]);

  // Show upgrade notice for other roles
  return (
    <Page title="Thread Reports">
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            overflow: "hidden",
            background: (theme) =>
              theme.palette.mode === "light"
                ? "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(246,248,252,0.98) 100%)"
                : "linear-gradient(180deg, rgba(17,24,39,0.98) 0%, rgba(15,23,42,0.98) 100%)",
          }}
        >
          <Box
            sx={{
              height: 8,
              background: (theme) =>
                `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.info.main})`,
            }}
          />
          <Box sx={{ p: { xs: 3, sm: 4, md: 6 } }}>
            <Stack spacing={3} alignItems="center" textAlign="center">
              <Box
                sx={{
                  width: 88,
                  height: 88,
                  borderRadius: 4,
                  display: "grid",
                  placeItems: "center",
                  color: "primary.main",
                  backgroundColor: (theme) =>
                    theme.palette.mode === "light"
                      ? "rgba(25, 118, 210, 0.08)"
                      : "rgba(125, 173, 255, 0.14)",
                }}
              >
                <UpgradeOutlinedIcon sx={{ fontSize: 42 }} />
              </Box>

              <Stack spacing={1.2} alignItems="center">
                <Typography variant="h3" sx={{ fontWeight: 800 }}>
                  Thread Reports are under upgrade
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ maxWidth: 760, lineHeight: 1.8 }}
                >
                  This section is temporarily unavailable while we upgrade the report system.
                  It will be back soon for all users and departments.
                </Typography>
              </Stack>

              <Box
                sx={{
                  px: 2.5,
                  py: 1.5,
                  borderRadius: 999,
                  backgroundColor: (theme) =>
                    theme.palette.mode === "light"
                      ? "rgba(15, 23, 42, 0.04)"
                      : "rgba(255, 255, 255, 0.06)",
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Coming soon for students, faculty, HOD, admin, and director users.
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Page>
  );
};

export default Report;


                          <Box sx={{ 
                            width: 8, 
                            height: 8, 
                            borderRadius: '50%', 
                            backgroundColor: selectedStatus 
                              ? getStatusColor(selectedStatus) 
                              : 'text.disabled' 
                          }} />
                        </InputAdornment>
                      ),
                    }}
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="Open">Open</MenuItem>
                    <MenuItem value="In Progress">In Progress</MenuItem>
                    <MenuItem value="Closed">Closed</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Category"
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CategoryIcon 
                            fontSize="small" 
                            sx={{ 
                              color: selectedCategory 
                                ? activeColor 
                                : 'text.disabled' 
                            }} 
                          />
                        </InputAdornment>
                      ),
                    }}
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {[...new Set(threads.map((thread) => thread.topic).filter(Boolean))].map(
                      (topic, index) => (
                        <MenuItem key={index} value={topic}>
                          {topic || "Uncategorized"}
                        </MenuItem>
                      )
                    )}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Semester"
                    value={selectedSemester}
                    onChange={handleSemesterChange}
                  >
                    <MenuItem value="">All Semesters</MenuItem>
                    {semesterOptions.map((semester) => (
                      <MenuItem key={semester} value={semester}>
                        Sem {semester}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="From Date"
                    type="date"
                    value={fromDate}
                    onChange={handleFromDateChange}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarIcon 
                            fontSize="small" 
                            sx={{ 
                              color: fromDate 
                                ? activeColor 
                                : 'text.disabled' 
                            }} 
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="To Date"
                    type="date"
                    value={toDate}
                    onChange={handleToDateChange}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarIcon 
                            fontSize="small" 
                            sx={{ 
                              color: toDate 
                                ? activeColor 
                                : 'text.disabled' 
                            }} 
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Card>
          )}

          <Box sx={{ position: 'relative' }}>
            {filteredThreads.length > 0 ? (
              <>
                <TableContainer 
                  component={Paper} 
                  sx={{ 
                    borderRadius: 2,
                    boxShadow: 'none',
                    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    maxWidth: '100%',
                    backgroundColor: 'transparent'
                  }}
                >
                  <Table sx={{ minWidth: { xs: 980, md: 740 } }}>
                  <TableHead sx={{ 
                    backgroundColor: isLight 
                      ? alpha(theme.palette.primary.main, 0.08) 
                      : alpha(theme.palette.info.main, 0.1),
                    position: 'sticky',
                    top: 0,
                    zIndex: 10
                  }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Opened Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Closed date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Author</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Members</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedThreads.map((thread) => {
                      const authorAvatarSrc = getAvatarSrc(thread?.author);

                      return (
                      <TableRow 
                        key={thread._id}
                        hover
                        sx={{ 
                          '&:hover': { 
                            backgroundColor: isLight 
                              ? alpha(theme.palette.primary.main, 0.04) 
                              : alpha(theme.palette.info.main, 0.08),
                          },
                          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {thread.title}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              maxHeight: "4rem",
                              maxWidth: { xs: "11rem", md: "15rem" },
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                textAlign: "justify",
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                            >
                              {thread.description}
                            </Typography>
                          </Box>
                          <Button 
                            size="small" 
                            onClick={() => handleOpenDialog(thread._id)}
                            sx={{ 
                              textTransform: 'none', 
                              mt: 0.5,
                              color: isLight ? theme.palette.primary.main : theme.palette.info.main,
                              px: 1,
                              '&:hover': {
                                backgroundColor: isLight 
                                  ? alpha(theme.palette.primary.main, 0.08) 
                                  : alpha(theme.palette.info.main, 0.1),
                              }
                            }}
                          >
                            Read more
                          </Button>
                          <Dialog
                            open={openDialogThreadId === thread._id}
                            onClose={handleCloseDialog}
                            fullScreen={isMobile}
                            PaperProps={{
                              sx: {
                                borderRadius: 2,
                                maxWidth: 'sm',
                                width: '100%'
                              }
                            }}
                          >
                            <DialogContent>
                              <Typography variant="h6" gutterBottom>
                                {thread.title}
                              </Typography>
                              <Divider sx={{ mb: 2 }} />
                              <Typography variant="body2">
                                {thread.description}
                              </Typography>
                            </DialogContent>
                            <DialogActions>
                              <Button 
                                onClick={handleCloseDialog}
                                variant="outlined"
                                color={isLight ? "primary" : "info"}
                                size="small"
                              >
                                Close
                              </Button>
                            </DialogActions>
                          </Dialog>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={thread.status}
                            size="small"
                            sx={{
                              backgroundColor: getStatusBgColor(thread.status),
                              color: getStatusColor(thread.status),
                              fontWeight: 'medium',
                              borderRadius: '8px',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {thread.topic ? (
                            <Chip
                              label={thread.topic}
                              size="small"
                              sx={{
                                backgroundColor: isLight 
                                  ? alpha(theme.palette.primary.main, 0.08) 
                                  : alpha(theme.palette.info.main, 0.1),
                                color: isLight 
                                  ? theme.palette.primary.main 
                                  : theme.palette.info.main,
                                borderRadius: '8px',
                              }}
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No Category
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(thread.createdAt).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {thread.closedAt
                              ? new Date(thread.closedAt).toLocaleDateString()
                              : "N/A"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar 
                              src={authorAvatarSrc || undefined}
                              sx={{ 
                                width: 28, 
                                height: 28,
                                bgcolor: isLight 
                                  ? theme.palette.primary.main 
                                  : theme.palette.info.main,
                                fontSize: '0.875rem',
                                mr: 1
                              }}
                            >
                              {!authorAvatarSrc
                                ? getAvatarFallbackText(thread?.author?.name)
                                : null}
                            </Avatar>
                            <Typography variant="body2" noWrap sx={{ maxWidth: 100 }}>
                              {thread?.author?.name || "Unknown"}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <AvatarGroup
                            max={3}
                            sx={{
                              '& .MuiAvatar-root': {
                                width: 28,
                                height: 28,
                                fontSize: '0.875rem',
                                backgroundColor: isLight 
                                  ? alpha(theme.palette.primary.main, 0.8) 
                                  : alpha(theme.palette.info.main, 0.8),
                              },
                            }}
                          >
                            {thread.participants.map((participant, idx) => {
                              const participantAvatarSrc = getAvatarSrc(participant);

                              return (
                              <Tooltip
                                key={idx}
                                title={participant.name}
                                placement="top"
                              >
                                <Avatar
                                  alt={participant.name}
                                  src={participantAvatarSrc || undefined}
                                >
                                  {!participantAvatarSrc
                                    ? getAvatarFallbackText(participant.name)
                                    : null}
                                </Avatar>
                              </Tooltip>
                              );
                            })}
                          </AvatarGroup>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            size={isMobile ? "small" : "medium"}
                            startIcon={!isMobile ? <ChatIcon /> : null}
                            onClick={() => handleOpenChatDialog(thread._id)}
                            sx={{
                              borderRadius: 2,
                              textTransform: 'none',
                              whiteSpace: 'nowrap',
                              color: isLight ? theme.palette.primary.main : theme.palette.info.main,
                              borderColor: isLight ? theme.palette.primary.main : theme.palette.info.main,
                              '&:hover': {
                                backgroundColor: isLight 
                                  ? alpha(theme.palette.primary.main, 0.08) 
                                  : alpha(theme.palette.info.main, 0.1),
                              }
                            }}
                          >
                            View Chat
                          </Button>
                        </TableCell>
                      </TableRow>
                      );
                    })}
                  </TableBody>
                  </Table>
                </TableContainer>
                <TablePagination
                  component="div"
                  count={filteredThreads.length}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={isMobile ? [10, 25, 50] : [10, 25, 50, 100, 250, 500, 1000]}
                />
              </>
            ) : (
              <Box 
                sx={{ 
                  py: 6, 
                  textAlign: 'center',
                  backgroundColor: alpha(theme.palette.background.paper, 0.5),
                  borderRadius: 2,
                  border: `1px dashed ${alpha(theme.palette.divider, 0.3)}`
                }}
              >
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No threads match your search criteria
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your filters or search terms
                </Typography>
                {(selectedCategory || selectedStatus || selectedSemester || fromDate || toDate || searchTerm) && (
                  <Button 
                    variant="outlined" 
                    color={isLight ? "primary" : "info"}
                    size="small" 
                    onClick={clearFilters}
                    sx={{ mt: 2 }}
                  >
                    Clear All Filters
                  </Button>
                )}
              </Box>
            )}
          </Box>
        </Paper>

        {/* Chat Messages Dialog */}
        <Dialog
          open={Boolean(openChatDialogThreadId)}
          onClose={handleCloseChatDialog}
          fullScreen={isMobile}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              minHeight: '60vh',
              maxHeight: '80vh'
            }
          }}
        >
          <DialogContent sx={{ p: 0 }}>
            <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
              <Typography variant="h6">
                Chat Messages
              </Typography>
            </Box>
            <Box sx={{ height: 'calc(100% - 64px)', overflow: 'auto' }}>
              {chatMessages.length > 0 ? (
                <MessageList 
                  conversation={threads.find(t => t._id === openChatDialogThreadId)} 
                  messages={chatMessages} 
                />
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  height: '100%',
                  color: 'text.secondary'
                }}>
                  <Typography>No messages in this thread</Typography>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <Button 
              onClick={handleCloseChatDialog}
              variant="outlined"
              color={isLight ? "primary" : "info"}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Page>
  );
};

export default Report;
