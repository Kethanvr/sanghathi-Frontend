import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar/Sidebar";
import DashboardHeader from "./header/DashboardHeader";
import useResponsive from "../hooks/useResponsive";

const DashboardLayout = () => {
  const isNonMobile = useResponsive("up", "sm");
  const [isSidebarOpen, setIsSidebarOpen] = useState(isNonMobile);

  useEffect(() => {
    setIsSidebarOpen(isNonMobile);
  }, [isNonMobile]);

  const handleBackdropClick = () => {
    if (!isNonMobile) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      <Sidebar
        isNonMobile={isNonMobile}
        drawerWidth={{ xs: "84vw", sm: 250 }}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        onBackdropClick={handleBackdropClick}
      />
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <DashboardHeader
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;
