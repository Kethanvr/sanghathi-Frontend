import React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import logger from "../utils/logger";

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    logger.error("Unhandled UI error captured by AppErrorBoundary", {
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            px: 2,
            textAlign: "center",
            bgcolor: "background.default",
          }}
        >
          <Stack spacing={2} alignItems="center" sx={{ maxWidth: 460 }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Something went wrong
            </Typography>
            <Typography color="text.secondary">
              The page failed to load due to an unexpected error. Reload and sign in again if needed.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Button variant="contained" onClick={() => window.location.reload()}>
                Reload Page
              </Button>
              <Button variant="outlined" onClick={() => window.location.assign("/login")}>
                Go to Login
              </Button>
            </Stack>
          </Stack>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
