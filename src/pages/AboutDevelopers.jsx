import React from "react";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Link as MuiLink,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import Page from "../components/Page";

const developers = [
  {
    name: "Kethan VR",
    github: "https://github.com/Kethanvr",
    source: "Frontend README + Backend README",
  },
  {
    name: "shovan-mondal",
    github: "https://github.com/shovan-mondal",
    source: "Frontend README + Backend README",
  },
  {
    name: "SUJAY-HK",
    github: "https://github.com/SUJAY-HK",
    source: "Frontend README + Backend README",
  },
  {
    name: "Kulsum06",
    github: "https://github.com/Kulsum06",
    source: "Frontend README + Backend README",
  },
  {
    name: "Sai-Emani25",
    github: "https://github.com/Sai-Emani25",
    source: "Frontend README + Backend README",
  },
  {
    name: "monu564100",
    github: "https://github.com/monu564100",
    source: "Frontend README + Backend README",
  },
  {
    name: "vsuryacharan",
    github: "https://github.com/vsuryacharan",
    source: "Frontend README + Backend README",
  },
  {
    name: "advitha24",
    github: "https://github.com/advitha24",
    source: "Frontend README",
  },
];

const AboutDevelopers = () => {
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";

  return (
    <Page title="About Developers">
      <Box
        sx={{
          minHeight: "100vh",
          py: { xs: 4, sm: 6 },
          background: isLight
            ? "linear-gradient(180deg, rgba(25,118,210,0.08) 0%, rgba(255,255,255,1) 55%)"
            : "linear-gradient(180deg, rgba(20,29,48,0.7) 0%, rgba(10,15,28,1) 60%)",
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={1.2} sx={{ mb: 4 }}>
            <Typography variant="h3" sx={{ fontWeight: 800 }}>
              About Developers
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Developer names below are sourced from the contributors sections in
              the project README files.
            </Typography>
            <MuiLink component={RouterLink} to="/" underline="hover" sx={{ width: "fit-content" }}>
              Back to Home
            </MuiLink>
          </Stack>

          <Grid container spacing={2.5}>
            {developers.map((developer) => (
              <Grid item xs={12} sm={6} md={4} key={developer.name}>
                <Card
                  sx={{
                    borderRadius: 3,
                    height: "100%",
                    border: `1px solid ${alpha(theme.palette.divider, 0.85)}`,
                    backgroundColor: alpha(theme.palette.background.paper, isLight ? 0.92 : 0.75),
                  }}
                >
                  <CardContent>
                    <Stack spacing={1.5}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar
                          sx={{
                            bgcolor: isLight ? "primary.main" : "info.main",
                            fontWeight: 700,
                          }}
                        >
                          {developer.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {developer.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Contributor
                          </Typography>
                        </Box>
                      </Stack>

                      <Chip label={developer.source} size="small" variant="outlined" />

                      <MuiLink
                        href={developer.github}
                        target="_blank"
                        rel="noreferrer"
                        underline="hover"
                        sx={{ fontWeight: 600 }}
                      >
                        View GitHub Profile
                      </MuiLink>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Page>
  );
};

export default AboutDevelopers;
