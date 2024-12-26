import React, { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import Clubs from "./Clubs";
import ClubEvents from "./ClubEvents";

export default function ClubsSection() {
  const [currentTab, setCurrentTab] = useState("Clubs Registered");

  const handleChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const TABS = [
    { value: "Clubs Registered", component: <Clubs Registered /> },
    { value: "Club Events", component: <ClubEvents /> },
  ];
  return (
    <Box>
      <Tabs value={currentTab} onChange={handleChange} variant="fullWidth">
        {TABS.map((tab) => (
          <Tab key={tab.value} label={tab.value} value={tab.value} />
        ))}
      </Tabs>
      <Box sx={{ mt: 3 }}>
        {TABS.map((tab) => tab.value === currentTab && <Box key={tab.value}>{tab.component}</Box>)}
      </Box>
    </Box>
  );
}
