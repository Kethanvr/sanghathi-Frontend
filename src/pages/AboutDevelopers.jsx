import React from "react";
import {
  Box,
  Container,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Link as MuiLink,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import Page from "../components/Page";

const newbieTeam = [{ name: "Kethan VR", github: "https://github.com/Kethanvr" }];

const founders = [
  { name: "shovan-mondal", github: "https://github.com/shovan-mondal" },
  { name: "monu564100", github: "https://github.com/monu564100" },
];

const otherDevelopers = [
  { name: "SUJAY-HK", github: "https://github.com/SUJAY-HK" },
  { name: "Kulsum06", github: "https://github.com/Kulsum06" },
  { name: "Sai-Emani25", github: "https://github.com/Sai-Emani25" },
  { name: "vsuryacharan", github: "https://github.com/vsuryacharan" },
  { name: "advitha24", github: "https://github.com/advitha24" },
];

const ContributorSection = ({ title, contributors }) => (
  <Paper
    elevation={0}
    sx={{
      borderRadius: 3,
      border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.85)}`,
      backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.8),
      p: { xs: 2, sm: 2.5 },
    }}
  >
    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
      {title}
    </Typography>
    <Divider sx={{ mb: 1 }} />
    <List disablePadding>
      {contributors.map((contributor, index) => (
        <ListItem
          key={contributor.name}
          disableGutters
          sx={{
            py: 1,
            borderBottom:
              index < contributors.length - 1
                ? (theme) => `1px dashed ${alpha(theme.palette.divider, 0.7)}`
                : "none",
          }}
        >
          <ListItemText
            primary={
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {contributor.name}
              </Typography>
            }
            secondary={
              <MuiLink
                href={contributor.github}
                target="_blank"
                rel="noreferrer"
                underline="hover"
              >
                {contributor.github}
              </MuiLink>
            }
          />
        </ListItem>
      ))}
    </List>
  </Paper>
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
                Contributors listed here are based on the contributors sections in the frontend and backend README files.
              </Typography>
            </Stack>
          </Paper>

          <Stack spacing={2.5}>
            <ContributorSection
              title="NewBiee in Team"
              contributors={newbieTeam}
            />
            <ContributorSection title="Founders" contributors={founders} />
            <ContributorSection
              title="Other Developers"
              contributors={otherDevelopers}
            />
          </Stack>
        </Container>
      </Box>
    </Page>
  );
};

export default AboutDevelopers;
