import React, { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Typography,
  Divider,
  Button,
  CircularProgress,
  Container,
  useTheme,
} from "@mui/material";

import { useSnackbar } from "notistack";

import NewThreadDialog from "./NewThreadDialog";
import ThreadList from "./ThreadList";
import Page from "../../components/Page";

import { Add } from "@mui/icons-material";
import api from "../../utils/axios";

import { AuthContext } from "../../context/AuthContext";

import logger from "../../utils/logger.js";

const LoadingSpinner = () => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "80vh",
    }}
  >
    <CircularProgress />
  </Box>
);

const Thread = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [threads, setThreads] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [users, setUsers] = useState([]);
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();
  const isLight = theme.palette.mode === 'light';
  const colorMode = isLight ? 'primary' : 'info';

  const fetchThreads = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`users/${user._id}/threads`);
      if (response.data.status === "success") {
        setThreads(response.data.data.threads);
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      logger.error("Error fetching threads:", error);
    }
  }, [user]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await api.get("users");
      if (response.data.status === "success") {
        const allUsers = response.data.data.users;
        const shouldScopeToStudents = ["faculty", "hod", "director"].includes(
          user?.roleName
        );

        const scopedUsers = shouldScopeToStudents
          ? allUsers.filter((candidate) => candidate.roleName === "student")
          : allUsers;

        setUsers(scopedUsers);
      }
    } catch (error) {
      logger.error("Error fetching Users:", error);
    }
  }, [user?.roleName]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleThreadClick = (thread) => {
    navigate(`/threads/${thread._id}`);
  };

  const handleAddNewThread = async (newThreadData) => {
    setIsLoading(true);
    try {
      const response = await api.post("threads", newThreadData);
      if (response.data.status === "success") {
        const newThread = response.data.data.thread;
        setThreads((prevThreads) => [...prevThreads, newThread]);
        setIsLoading(false);
        return Promise.resolve();
      }
    } catch (error) {
      setIsLoading(false);
      return Promise.reject(error);
    }
  };

  const handleThreadEdit = async (thread) => {
    logger.info("Edit requested for thread", { threadId: thread._id });
    enqueueSnackbar("Thread edit is not available yet.", { variant: "info" });
  };

  const handleThreadDelete = async (thread) => {
    try {
      logger.info(`Delete thread ${thread._id}`);
      const response = await api.delete(`/threads/${thread._id}`);
      if (response.status === 204) {
        setThreads((prevThreads) =>
          prevThreads.filter((curr) => curr._id !== thread._id)
        );
        enqueueSnackbar("Thread Deleted successfully!", { variant: "success" });
      }
    } catch (error) {
      enqueueSnackbar("Something went wrong!", { variant: "error" });
      logger.error("ERROR OCCURED 💥 ", error);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  return (
    <Page title="Thread">
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            width: "100%",
            height: "100%",
            flexDirection: "column",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 2,
            }}
          >
            <Typography variant="h4" component="h1">
              Threads
            </Typography>
            <Button
              variant="contained"
              color={colorMode}
              onClick={handleOpenDialog}
              startIcon={<Add />}
              sx={{ mt: 1, mb: 2 }}
            >
              Add new
            </Button>
          </Box>
          <Divider />
          {isLoading ? (
            <LoadingSpinner />
          ) : threads.length === 0 ? (
            <Typography variant="h6" textAlign="center" mt={2}>
              No threads found. Create a new thread to get started!
            </Typography>
          ) : (
            <ThreadList
              threads={threads}
              onThreadClick={handleThreadClick}
              onThreadEdit={handleThreadEdit}
              onThreadDelete={handleThreadDelete}
              colorMode={colorMode}
            />
          )}
          <NewThreadDialog
            open={openDialog}
            onClose={handleCloseDialog}
            users={users}
            currentUser={user}
            onSave={handleAddNewThread}
            colorMode={colorMode}
          />
        </Box>
      </Container>
    </Page>
  );
};
export default React.memo(Thread);
