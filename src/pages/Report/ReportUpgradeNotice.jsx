import { Box, Container, Paper, Stack, Typography } from "@mui/material";
import UpgradeOutlinedIcon from "@mui/icons-material/UpgradeOutlined";
import Page from "../../components/Page";

const ReportUpgradeNotice = () => {
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

export default ReportUpgradeNotice;
