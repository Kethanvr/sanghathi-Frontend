import React, { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";
import ProfessionalBodies from "./ProfessionalBodies";
import ProfessionalBodiesEvents from "./ProfessionalBodiesEvents";

export default function ClubsSection() {
  const [currentTab, setCurrentTab] = useState("Professional Bodies");

  const handleChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const TABS = [
    { value: "Professional Bodies", component: <ProfessionalBodies/> },
    { value: "Professional Bodies Events", component: <ProfessionalBodiesEvents /> },
  ];
  return (
    <Box>
      <Tabs value={currentTab} onChange={handleChange} variant="fullWidth">
        {TABS.map((tab) => (
          <Tab key={tab.value} label={tab.value} value={tab.value} />
        ))}
      </Tabs>
      <Box sx={{ mt:3 }}>
        {TABS.map((tab) => tab.value === currentTab && <Box key={tab.value}>{tab.component}</Box>)}
      </Box>
    </Box>
  );
}
