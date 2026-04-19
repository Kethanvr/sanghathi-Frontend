import React from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Paper,
  Link as MuiLink,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import Page from "../components/Page";
import { developers, developerGroups } from "../data/developers";

const DeveloperPreviewCard = ({ developer, featured = false }) => {
  const theme = useTheme();
  const hasImage = Boolean(developer.image);

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.85)}`,
        backgroundColor: alpha(theme.palette.background.paper, 0.84),
        height: "100%",
      }}
    >
      <CardContent>
        <Stack
          direction={featured ? { xs: "column", md: "row" } : "row"}
          spacing={2}
          alignItems={featured ? { xs: "flex-start", md: "center" } : "center"}
        >
          {hasImage ? (
            <Box
              component="img"
              src={developer.image}
              alt={developer.name}
              sx={{
                width: featured ? { xs: "100%", md: 220 } : 68,
                height: featured ? { xs: 240, md: 220 } : 68,
                objectFit: "cover",
                borderRadius: 2.2,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.35)}`,
                flexShrink: 0,
              }}
            />
          ) : (
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: theme.palette.mode === "light" ? "primary.main" : "info.main",
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {developer.name.charAt(0).toUpperCase()}
            </Avatar>
          )}

          <Stack spacing={1.1} sx={{ width: "100%" }}>
            <Typography variant={featured ? "h5" : "h6"} sx={{ fontWeight: 800 }}>
              {developer.name}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700 }}>
              {developer.role}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {developer.shortBio}
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <MuiLink
                href={developer.github}
                target="_blank"
                rel="noreferrer"
                underline="hover"
                sx={{ fontWeight: 600, width: "fit-content" }}
              >
                GitHub
              </MuiLink>
              <Button
                component={RouterLink}
                to={`/about-developers/${developer.id}`}
                variant="outlined"
                size="small"
                sx={{ width: "fit-content" }}
              >
                Read More
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

const TeamSection = ({ title, ids, featuredFirst = false }) => (
  <Stack spacing={1.6}>
    <Typography variant="h5" sx={{ fontWeight: 800 }}>
      {title}
    </Typography>
    <Grid container spacing={2.2}>
      {ids.map((id, index) => {
        const developer = developers[id];

        if (!developer) {
          return null;
        }

        const isFeatured = featuredFirst && index === 0;

        return (
          <Grid item xs={12} md={isFeatured ? 12 : 6} key={developer.id}>
            <DeveloperPreviewCard developer={developer} featured={isFeatured} />
          </Grid>
        );
      })}
    </Grid>
  </Stack>
);

const AboutDevelopers = () => {
  const theme = useTheme();
  const isLight = theme.palette.mode === "light";

  return (
    <Page title="About Developers">
      <Box
        sx={{
          pt: 3,
          pb: 5,
          backgroundColor: isLight
            ? alpha(theme.palette.primary.lighter, 0.4)
            : alpha(theme.palette.grey[900], 0.2),
          minHeight: "calc(100vh - 64px)",
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 1.5, sm: 0 } }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 4 },
              mb: 4,
              mt: 1,
              borderRadius: 3,
              backgroundColor: isLight
                ? "rgba(255, 255, 255, 0.8)"
                : alpha(theme.palette.background.paper, 0.6),
              backdropFilter: "blur(20px)",
              border: `1px solid ${alpha(
                isLight ? theme.palette.primary.main : theme.palette.info.main,
                0.15
              )}`,
            }}
          >
            <Stack spacing={1.2} sx={{ textAlign: "left" }}>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                About Developers
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Explore the team behind Sanghathi. Each card shows a short overview, and Read More opens the dedicated profile page.
              </Typography>
            </Stack>
          </Paper>

          <Stack spacing={3}>
            <TeamSection
              title="NewBiee in Team"
              ids={developerGroups.newbie}
              featuredFirst
            />
            <TeamSection title="Founders" ids={developerGroups.founders} />
            <TeamSection title="Other Developers" ids={developerGroups.others} />
          </Stack>
        </Container>
      </Box>
    </Page>
  );
};

export default AboutDevelopers;
