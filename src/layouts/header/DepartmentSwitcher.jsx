import React, { useState, useEffect, useContext } from "react";
import {
  Button,
  Menu,
  MenuItem,
  CircularProgress,
  Tooltip,
  Box,
  Typography,
  useTheme,
  Chip,
} from "@mui/material";
import { ArrowDropDownOutlined, DomainOutlined } from "@mui/icons-material";
import { AuthContext } from "../../context/AuthContext";
import api from "../../utils/axios";
import logger from "../../utils/logger";

const ALLOWED_DEPARTMENT_CODES = new Set(["ISE", "MCA"]);

const DepartmentSwitcher = ({ variant = "header" }) => {
  const theme = useTheme();
  const { user, dispatch } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [switching, setSwitching] = useState(false);
  const menuOpen = Boolean(anchorEl);

  // Only show for strcoordinator and director roles
  if (user?.roleName !== "strcoordinator" && user?.roleName !== "director") {
    return null;
  }

  // Fetch departments on menu open
  const handleMenuOpen = async (event) => {
    setAnchorEl(event.currentTarget);
    if (departments.length === 0) {
      await fetchDepartments();
    }
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await api.get("/departments", {
        params: { status: "active" },
      });
      const depts = (response.data?.data?.departments || []).filter((dept) => {
        const departmentCode = (dept?.code || "").toUpperCase();
        return ALLOWED_DEPARTMENT_CODES.has(departmentCode);
      });
      setDepartments(depts);
    } catch (err) {
      logger.error("Failed to fetch departments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDepartment = async (dept) => {
    if (dept.name === user?.department) {
      // Already selected
      handleMenuClose();
      return;
    }

    try {
      setSwitching(true);
      const response = await api.patch("/users/set-department", {
        department: dept.name,
      });

      const updatedUser = response.data?.data?.user;
      if (updatedUser) {
        dispatch({
          type: "UPDATE_USER_PROFILE",
          payload: {
            ...user,
            department: updatedUser.department,
          },
        });
        logger.info(`Switched to department: ${dept.name}`);
      }
      handleMenuClose();
      window.location.reload();
    } catch (err) {
      logger.error("Failed to switch department:", err);
    } finally {
      setSwitching(false);
    }
  };

  if (variant === "sidebar") {
    return (
      <Box sx={{ px: 1.5, mb: 2 }}>
        <Tooltip title="Click to switch department">
          <Button
            onClick={handleMenuOpen}
            disabled={switching}
            variant="contained"
            fullWidth
            startIcon={<DomainOutlined />}
            endIcon={<ArrowDropDownOutlined />}
            sx={{
              textTransform: "none",
              fontSize: "0.9rem",
              fontWeight: 700,
              py: 1.2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              boxShadow: `0 4px 12px ${theme.palette.primary.main}40`,
              "&:hover": {
                boxShadow: `0 6px 16px ${theme.palette.primary.main}60`,
                transform: "translateY(-2px)",
              },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                Department:
              </Typography>
              <Chip
                label={user?.department || "Select"}
                size="small"
                sx={{
                  backgroundColor: theme.palette.background.paper,
                  color: theme.palette.primary.main,
                  fontWeight: 700,
                  height: 24,
                }}
              />
            </Box>
            {switching && <CircularProgress size={18} sx={{ ml: 1 }} />}
          </Button>
        </Tooltip>

        <Menu
          id="department-menu-sidebar"
          anchorEl={anchorEl}
          open={menuOpen && !switching}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
        >
          {loading ? (
            <MenuItem disabled>
              <CircularProgress size={20} />
            </MenuItem>
          ) : departments.length === 0 ? (
            <MenuItem disabled>No departments available</MenuItem>
          ) : (
            departments.map((dept) => (
              <MenuItem
                key={dept._id}
                onClick={() => handleSelectDepartment(dept)}
                selected={dept.name === user?.department}
                sx={{
                  fontWeight:
                    dept.name === user?.department ? 700 : 500,
                  backgroundColor:
                    dept.name === user?.department
                      ? `${theme.palette.primary.main}20`
                      : "transparent",
                }}
              >
                <DomainOutlined sx={{ mr: 1.5, fontSize: "1.2rem" }} />
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {dept.name}
                </Typography>
                {dept.name === user?.department && (
                  <Box
                    sx={{
                      ml: 1,
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: theme.palette.primary.main,
                    }}
                  />
                )}
              </MenuItem>
            ))
          )}
        </Menu>
      </Box>
    );
  }

  // Header variant (original)
  return (
    <>
      <Tooltip title="Switch Department">
        <Button
          onClick={handleMenuOpen}
          disabled={switching}
          variant="contained"
          size="small"
          endIcon={<ArrowDropDownOutlined />}
          startIcon={<DomainOutlined />}
          sx={{
            fontWeight: 700,
            textTransform: "none",
            fontSize: "0.875rem",
            whiteSpace: "nowrap",
            minWidth: 0,
            px: { xs: 1, sm: 1.5 },
            py: 0.8,
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          }}
        >
          <Box
            component="span"
            sx={{
              display: { xs: "none", sm: "inline" },
              mr: 0.5,
            }}
          >
            Dept:
          </Box>
          <Typography
            variant="inherit"
            sx={{
              fontWeight: 700,
              color: "white",
            }}
          >
            {user?.department || "Select"}
          </Typography>
          {switching && <CircularProgress size={16} sx={{ ml: 1 }} />}
        </Button>
      </Tooltip>

      <Menu
        id="department-menu"
        anchorEl={anchorEl}
        open={menuOpen && !switching}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        {loading ? (
          <MenuItem disabled>
            <CircularProgress size={20} />
          </MenuItem>
        ) : departments.length === 0 ? (
          <MenuItem disabled>No departments available</MenuItem>
        ) : (
          departments.map((dept) => (
            <MenuItem
              key={dept._id}
              onClick={() => handleSelectDepartment(dept)}
              selected={dept.name === user?.department}
              sx={{
                fontWeight:
                  dept.name === user?.department ? 700 : 500,
                backgroundColor:
                  dept.name === user?.department
                    ? `${theme.palette.primary.main}20`
                    : "transparent",
              }}
            >
              <DomainOutlined sx={{ mr: 1, fontSize: "1.1rem" }} />
              {dept.name}
              {dept.name === user?.department && (
                <Box
                  sx={{
                    ml: 1,
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: theme.palette.primary.main,
                  }}
                />
              )}
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
};

export default DepartmentSwitcher;
