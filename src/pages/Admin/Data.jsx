import { capitalCase } from "change-case";

import { useState } from "react";
// @mui
import { Container, Tab, Box, Tabs } from "@mui/material";
// routes

// hooks
import useTabs from "../../hooks/useTabs";

// components
import Page from "../../components/Page";
import Iconify from "../../components/Iconify";
import HeaderBreadcrumbs from "../../components/HeaderBreadcrumbs";
// sections

import marks from "./AddMarks";
import attendance from "./AddAttendance";
import React from "react";

// ----------------------------------------------------------------------

export default function Data() {
  const [editingUser, setEditingUser] = useState(null);
  const { currentTab, onChangeTab } = useTabs("Create User");

  const ACCOUNT_TABS = [
    {
      value: "Add Attendance",
      icon: <Iconify icon={"ic:round-account-box"} width={20} height={20} />,
      component: <marks editingUser={editingUser} />,
    },
    {
      value: "Add IAT Marks",
      icon: <Iconify icon={"ic:round-account-box"} width={20} height={20} />,
      component: (
        <attendance
          onEdit={(user) => {
            setEditingUser(user);
            onChangeTab(null, "Create User");
          }}
        />
      ),
    },
    {
      value: "Add External Marks",
      icon: <Iconify icon={"ic:round-account-box"} width={20} height={20} />,
      component: (
        <attendance
          onEdit={(user) => {
            setEditingUser(user);
            onChangeTab(null, "Create User");
          }}
        />
      ),
    },
  ];

  return (
    <Page title="User: Account Settings">
      <Container maxWidth="lg">
        <Tabs
          allowScrollButtonsMobile
          variant="scrollable"
          scrollButtons="auto"
          value={currentTab}
          onChange={onChangeTab}
        >
          {ACCOUNT_TABS.map((tab) => (
            <Tab
              disableRipple
              key={tab.value}
              label={capitalCase(tab.value)}
              icon={tab.icon}
              value={tab.value}
            />
          ))}
        </Tabs>

        <Box sx={{ mb: 5 }} />

        {ACCOUNT_TABS.map((tab) => {
          const isMatched = tab.value === currentTab;
          return isMatched && <Box key={tab.value}>{tab.component}</Box>;
        })}
      </Container>
    </Page>
  );
}
