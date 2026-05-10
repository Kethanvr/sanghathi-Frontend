import logo from "../public/cmrit_logo.png";
import sidelogo from "../../public/logo.svg";
import {
  Box,
  Card,
  Typography,
  Container,
  TextField,
  FormControlLabel,
  Radio,
  Button,
  CircularProgress,
  Grid,
  Stack,
  Avatar,
  Link,
  useTheme,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useContext, useRef, useState } from "react";
import { loginCall } from "../apiCalls";
import { AuthContext } from "../context/AuthContext";
import Image from "mui-image";
import Page from "../components/Page";
import { useSnackbar } from "notistack";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";

import Illustration from "../public/login_illustration.png";

import logger from "../utils/logger.js";
const Login = () => {
  const RELEASE_ANNOUNCEMENT_SESSION_KEY = "showSanghathi20Announcement";
  const location = useLocation();
  const email = useRef();
  const password = useRef();
  const { enqueueSnackbar } = useSnackbar();
  const { isFetching, dispatch } = useContext(AuthContext);
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const from = location.state?.from;
  const redirectParam = new URLSearchParams(location.search).get("redirect");

  const [isAdminDemoChecked, setIsAdminDemoChecked] = useState(false);
  const [isFacultyDemoChecked, setIsFacultyDemoChecked] = useState(false);
  const [isStudentDemoChecked, setIsStudentDemoChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAdminDemoChange = (event) => {
    setIsAdminDemoChecked(event.target.checked);
    if (event.target.checked) {
      setIsStudentDemoChecked(false);
      setIsFacultyDemoChecked(false);
    } else {
      email.current.value = "";
      password.current.value = "";
    }
  };

  const handleFacultyDemoChange = (event) => {
    setIsFacultyDemoChecked(event.target.checked);
    if (event.target.checked) {
      setIsStudentDemoChecked(false);
      setIsAdminDemoChecked(false);
    } else {
      email.current.value = "";
      password.current.value = "";
    }
  };

  const handleStudentDemoChange = (event) => {
    setIsStudentDemoChecked(event.target.checked);
    if (event.target.checked) {
      setIsFacultyDemoChecked(false);
      setIsAdminDemoChecked(false);
    } else {
      email.current.value = "";
      password.current.value = "";
    }
  };

  const handleShowPasswordToggle = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const loginResponse = await loginCall(
        { email: email.current.value, password: password.current.value },
        dispatch
      );
      
      const userRole = loginResponse?.data?.user?.roleName;
      const userDepartment = loginResponse?.data?.user?.department;
      
      const savedRedirectPath = sessionStorage.getItem("postLoginRedirectPath");
      let redirectPath =
        redirectParam ||
        savedRedirectPath ||
        (from ? `${from.pathname || "/"}${from.search || ""}` : "/");

      if (redirectPath.startsWith("/admin/") && userRole !== "admin") {
        redirectPath = "/";
      } else if (redirectPath.startsWith("/faculty/") && userRole !== "faculty") {
        redirectPath = "/";
      } else if (redirectPath.startsWith("/director/") && userRole !== "director") {
        redirectPath = "/";
      } else if (redirectPath.startsWith("/hod/") && userRole !== "hod") {
        redirectPath = "/";
      } else if (
        redirectPath.startsWith("/strcoordinator/") &&
        userRole !== "strcoordinator" &&
        userRole !== "director"
      ) {
        redirectPath = "/";
      }

      // Always show department selection cards for strcoordinator after login
      if (userRole === "strcoordinator") {
        redirectPath = "/strcoordinator/select-department";
      } else if (userRole === "director" && !userDepartment) {
        redirectPath = "/strcoordinator/select-department";
      }

      sessionStorage.removeItem("postLoginRedirectPath");
      window.location.href = redirectPath;
    } catch (err) {
      logger.info(err);
      enqueueSnackbar(err?.response?.data?.message || "Login failed", {
        variant: "error",
      });
    }
  };

  return (
    <Page title="Login">
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 0 } }}>
        <Grid
          container
          spacing={{ xs: 1.5, md: 2 }}
          sx={{ minHeight: "100dvh", height: { md: "100vh" } }}
        >
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              display: { xs: "none", md: "flex" },
              backgroundImage: `url(${Illustration})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: "1rem",
            }}
          />
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              py: { xs: 3, sm: 4, md: 8 },
              px: { xs: 1, sm: 3, md: 8 },
              display: "flex",
              alignItems: { xs: "flex-start", md: "center" },
            }}
          >
            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              <Box
                component="form"
                noValidate
                onSubmit={handleLogin}
                display="flex"
                flexDirection="column"
                width="100%"
                maxWidth={{ xs: "100%", sm: 460, md: 500 }}
                mx="auto"
              >
                <Stack spacing={{ xs: 2.5, sm: 3 }} mb={3}>
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    mb={{ xs: 2, md: 4 }}
                    gap={{ xs: 2.5, sm: 4, md: 8 }}
                    flexWrap="wrap"
                  >
                    <img
                      src={sidelogo}
                      alt="Side Logo"
                      style={{
                        width: "clamp(108px, 34vw, 140px)",
                        filter: "none"
                      }}
                    />
                    <img
                      src={logo}
                      alt="CMRIT Logo"
                      style={{
                        width: "clamp(62px, 20vw, 80px)",
                        filter: "none"
                      }}
                    />
                  </Box>
                  <Typography
                    variant="h5"
                    component="h1"
                    color=""
                    align="center"
                    gutterBottom
                    sx={{ fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" } }}
                  >
                    Sign in to Sanghathi
                  </Typography>
                  <Box
                    sx={{
                      display: { xs: "block", md: "none" },
                      width: "100%",
                      borderRadius: 2,
                      overflow: "hidden",
                      mt: -0.5,
                      mb: 0.5,
                    }}
                  >
                    <Image
                      src={Illustration}
                      alt="Login illustration"
                      fit="cover"
                      duration={0}
                      style={{
                        width: "100%",
                        height: "clamp(130px, 24vh, 180px)",
                        borderRadius: "12px",
                      }}
                    />
                  </Box>
                  <TextField
                    label="Email"
                    variant="outlined"
                    fullWidth
                    inputRef={email}
                    autoComplete="email"
                  />
                  <TextField
                    label="Password"
                    variant="outlined"
                    type={showPassword ? "text" : "password"}
                    fullWidth
                    inputRef={password}
                    autoComplete="current-password"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleShowPasswordToggle}
                            edge="end"
                            aria-label="toggle password visibility"
                            size="small"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <Box display="flex" justifyContent="flex-end">
                    <Link component={RouterLink} to="/forgot-password" underline="hover">
                      Forgot Password?
                    </Link>
                  </Box>

                  {/* <Stack direction="row" justifyContent="space-between">
                    <FormControlLabel
                      control={
                        <Radio
                          checked={isAdminDemoChecked}
                          onChange={handleAdminDemoChange}
                          name="adminDemo"
                        />
                      }
                      label="Admin"
                    />
                    <FormControlLabel
                      control={
                        <Radio
                          checked={isFacultyDemoChecked}
                          onChange={handleFacultyDemoChange}
                          name="faculty"
                        />
                      }
                      label="Faculty"
                    />
                    <FormControlLabel
                      control={
                        <Radio
                          checked={isStudentDemoChecked}
                          onChange={handleStudentDemoChange}
                          name="studentDemo"
                        />
                      }
                      label="Student"
                    />
                  </Stack> */}

                  <Button
                    type="submit"
                    variant="contained"
                    color={isLight ? "primary" : "info"}
                    size="large"
                    fullWidth
                    disabled={isFetching}
                    startIcon={
                      isFetching ? <CircularProgress size={20} /> : null
                    }
                  >
                    {isFetching ? "Signing in..." : "Sign in"}
                  </Button>
                </Stack>

              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
};

export default Login;
