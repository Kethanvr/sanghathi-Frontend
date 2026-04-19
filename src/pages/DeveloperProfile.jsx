import React from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Link as MuiLink,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink, useParams } from "react-router-dom";
import Page from "../components/Page";
import { developers } from "../data/developers";

const DeveloperProfile = () => {
  const theme = useTheme();
  const { developerId } = useParams();
  const developer = developers[developerId];
  const isLight = theme.palette.mode === "light";

  if (!developer) {
    return (
      <Page title="Developer Profile | Sanghathi">
        <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              p: { xs: 2.4, sm: 3.2 },
              border: `1px solid ${alpha(theme.palette.divider, 0.85)}`,
            }}
          >
            <Stack spacing={1.6}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Developer not found
              </Typography>
              <Typography variant="body1" color="text.secondary">
                The profile you are looking for does not exist.
              </Typography>
              <Button component={RouterLink} to="/about-developers" variant="contained" sx={{ width: "fit-content" }}>
                Back to Developers
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Page>
    );
  }

  const hasFullProfile = Boolean(developer.fullProfile);

  return (
    <Page title={`${developer.name} | Sanghathi`}>
      <Box
        sx={{
          minHeight: "100%",
          py: { xs: 4, md: 6 },
          background: isLight
            ? `radial-gradient(circle at 10% 10%, ${alpha(theme.palette.primary.light, 0.18)} 0%, transparent 38%),
               linear-gradient(180deg, ${alpha(theme.palette.grey[100], 0.95)} 0%, ${alpha(theme.palette.background.default, 0.98)} 100%)`
            : `radial-gradient(circle at 10% 10%, ${alpha(theme.palette.info.light, 0.18)} 0%, transparent 36%),
               linear-gradient(180deg, ${alpha(theme.palette.background.default, 0.98)} 0%, ${alpha("#0D1117", 0.98)} 100%)`,
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={3}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.2, sm: 3.2 },
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.85)}`,
                backgroundColor: alpha(theme.palette.background.paper, 0.84),
              }}
            >
              <Stack spacing={2}>
                <Button
                  component={RouterLink}
                  to="/about-developers"
                  variant="text"
                  sx={{ width: "fit-content", px: 0, fontWeight: 700 }}
                >
                  Back to Developers
                </Button>

                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={2.2}
                  alignItems={{ xs: "flex-start", md: "center" }}
                >
                  {developer.image ? (
                    <Box
                      component="img"
                      src={developer.image}
                      alt={developer.name}
                      sx={{
                        width: { xs: "100%", md: 260 },
                        height: { xs: 250, md: 260 },
                        objectFit: "cover",
                        borderRadius: 3,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.35)}`,
                      }}
                    />
                  ) : (
                    <Avatar
                      sx={{
                        width: 96,
                        height: 96,
                        bgcolor: theme.palette.mode === "light" ? "primary.main" : "info.main",
                        fontSize: 36,
                        fontWeight: 800,
                      }}
                    >
                      {developer.name.charAt(0).toUpperCase()}
                    </Avatar>
                  )}

                  <Stack spacing={1.1}>
                    <Typography variant="h4" sx={{ fontWeight: 900 }}>
                      {developer.name}
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 700 }}>
                      {developer.role}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {developer.shortBio}
                    </Typography>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                      <MuiLink href={developer.github} target="_blank" rel="noreferrer" underline="hover" sx={{ fontWeight: 700 }}>
                        GitHub Profile
                      </MuiLink>
                      {developer.linkedin && (
                        <MuiLink
                          href={developer.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          underline="hover"
                          sx={{ fontWeight: 700 }}
                        >
                          LinkedIn Profile
                        </MuiLink>
                      )}
                    </Stack>
                  </Stack>
                </Stack>
              </Stack>
            </Paper>

            {hasFullProfile ? (
              <Stack spacing={2.5}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2.2, sm: 3 },
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.divider, 0.85)}`,
                    backgroundColor: alpha(theme.palette.background.paper, 0.84),
                  }}
                >
                  <Stack spacing={1.1}>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      Overview
                    </Typography>
                    {developer.fullProfile.intro.map((paragraph) => (
                      <Typography key={paragraph} variant="body1" color="text.secondary">
                        {paragraph}
                      </Typography>
                    ))}
                    <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                      {developer.fullProfile.philosophy}
                    </Typography>
                  </Stack>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2.2, sm: 3 },
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.divider, 0.85)}`,
                    backgroundColor: alpha(theme.palette.background.paper, 0.84),
                  }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5 }}>
                    Tech Stack
                  </Typography>
                  <Grid container spacing={1.8}>
                    {Object.entries(developer.fullProfile.techStack).map(([group, items]) => (
                      <Grid item xs={12} sm={6} key={group}>
                        <Card
                          sx={{
                            borderRadius: 2.2,
                            border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                            backgroundColor: alpha(theme.palette.background.paper, 0.8),
                            height: "100%",
                          }}
                        >
                          <CardContent>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.1 }}>
                              {group}
                            </Typography>
                            <Stack direction="row" spacing={0.8} useFlexGap flexWrap="wrap">
                              {items.map((item) => (
                                <Chip key={item} label={item} size="small" variant="outlined" />
                              ))}
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2.2, sm: 3 },
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.divider, 0.85)}`,
                    backgroundColor: alpha(theme.palette.background.paper, 0.84),
                  }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.5 }}>
                    Featured Work
                  </Typography>
                  <Grid container spacing={1.8}>
                    {developer.fullProfile.featuredWork.map((work) => (
                      <Grid item xs={12} md={4} key={work.title}>
                        <Card
                          sx={{
                            borderRadius: 2.2,
                            border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                            backgroundColor: alpha(theme.palette.background.paper, 0.8),
                            height: "100%",
                          }}
                        >
                          <CardContent>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.9 }}>
                              {work.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {work.description}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2.2, sm: 3 },
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.divider, 0.85)}`,
                    backgroundColor: alpha(theme.palette.background.paper, 0.84),
                  }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.3 }}>
                    Current Focus
                  </Typography>
                  <Stack spacing={0.8}>
                    {developer.fullProfile.currentFocus.map((focus) => (
                      <Typography key={focus} variant="body1" color="text.secondary">
                        - {focus}
                      </Typography>
                    ))}
                  </Stack>
                </Paper>
              </Stack>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.2, sm: 3 },
                  borderRadius: 3,
                  border: `1px solid ${alpha(theme.palette.divider, 0.85)}`,
                  backgroundColor: alpha(theme.palette.background.paper, 0.84),
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1.2 }}>
                  Profile Details
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Detailed profile information for {developer.name} will be updated soon.
                </Typography>
              </Paper>
            )}
          </Stack>
        </Container>
      </Box>
    </Page>
  );
};

export default DeveloperProfile;
