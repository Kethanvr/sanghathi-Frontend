import React, { useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Select,
  TextField,
  Typography,
  MenuItem,
  Avatar,
  useTheme,
} from "@mui/material";
import { Close, Search } from "@mui/icons-material";
import {
  getAvatarSrc,
  getAvatarFallbackText,
} from "../../utils/avatarResolver";

import logger from "../../utils/logger.js";

const NewThreadDialog = ({
  open,
  onClose,
  users,
  currentUser,
  onSave,
  colorMode = "primary",
}) => {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  const [newThreadData, setNewThreadData] = useState({
    title: "",
    topic: "",
    author: currentUser._id,
    participants: [{ _id: currentUser._id, name: currentUser.name }],
  });

  const TOPICS = ["general", "attendance", "performance", "well-being"];

  const membersForDisplay =
    currentUser?.roleName === "faculty"
      ? newThreadData.participants.filter(
          (participant) => participant._id !== currentUser._id
        )
      : newThreadData.participants;

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = users.filter((user) =>
        user.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers([]);
    }
  }, [searchTerm, users]);

  const handleCloseDialog = () => {
    onClose();
    setNewThreadData({
      title: "",
      topic: "",
      author: currentUser._id,
      participants: [{ _id: currentUser._id, name: currentUser.name }],
    });
    setSearchTerm("");
    setFilteredUsers([]);
  };

  const handleNewThreadChange = (e) => {
    setNewThreadData({ ...newThreadData, [e.target.name]: e.target.value });
  };

  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleAddMember = (member) => {
    if (!newThreadData.participants.find((m) => m._id === member._id)) {
      setNewThreadData((prevState) => ({
        ...prevState,
        participants: [...prevState.participants, member],
      }));
    }

    setSearchTerm("");
    setFilteredUsers([]);
  };

  const handleDeselectMember = (memberId) => {
    if (memberId === currentUser._id) return;

    setNewThreadData((prevState) => ({
      ...prevState,
      participants: prevState.participants.filter(
        (participant) => participant._id !== memberId
      ),
    }));
  };

  const handleSave = () => {
    onSave(newThreadData)
      .then(() => {
        enqueueSnackbar("Thread created successfully!", { variant: "success" });
      })
      .catch((error) => {
        enqueueSnackbar("Error creating thread!", { variant: "error" });
        logger.error("Error creating new thread:", error);
      });

    handleCloseDialog();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseDialog}
      sx={{
        "& .MuiPaper-root": {
          width: "50vh",
        },
      }}
    >
      <DialogTitle>Create a new thread</DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexDirection: "column",
          }}
        >
          <Box sx={{ py: 1 }}>
            <TextField
              label="Title"
              name="title"
              value={newThreadData.title}
              onChange={handleNewThreadChange}
              fullWidth
              color={colorMode}
            />
          </Box>
          <Box sx={{ py: 1 }}>
            <InputLabel shrink htmlFor="topic-select" color={colorMode}>
              Topic
            </InputLabel>
            <Select
              name="topic"
              value={newThreadData.topic}
              onChange={handleNewThreadChange}
              inputProps={{ name: "topic", id: "topic-select" }}
              fullWidth
              color={colorMode}
            >
              <MenuItem value="" disabled>
                Topic
              </MenuItem>
              {TOPICS.map((topic, index) => (
                <MenuItem key={index} value={topic}>
                  {topic.charAt(0).toUpperCase() + topic.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </Box>
          <Box sx={{ py: 1 }}>
            <TextField
              label="Search user"
              value={searchTerm}
              onChange={handleSearchTermChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton color={colorMode}>
                      <Search />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              fullWidth
              color={colorMode}
            />
          </Box>
        </Box>

        <List>
          {filteredUsers.map((user) => {
            const userAvatarSrc = getAvatarSrc(user);

            return (
              <ListItem
                key={user._id}
                onClick={() => handleAddMember(user)}
                sx={{
                  "&:hover": { backgroundColor: theme.palette.action.hover },
                }}
              >
                <ListItemAvatar>
                  <Avatar alt={user.name} src={userAvatarSrc || undefined}>
                    {!userAvatarSrc ? getAvatarFallbackText(user.name) : null}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={user.name} />
              </ListItem>
            );
          })}
        </List>

        <Typography variant="subtitle1" mt={2}>
          Members:
        </Typography>
        <List>
          {membersForDisplay.map((participant) => {
            const participantAvatarSrc = getAvatarSrc(participant);

            return (
              <ListItem
                key={participant._id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Avatar
                    alt={participant.name}
                    src={participantAvatarSrc || undefined}
                  >
                    {!participantAvatarSrc
                      ? getAvatarFallbackText(participant.name)
                      : null}
                  </Avatar>
                  <ListItemText sx={{ ml: 2 }} primary={participant.name} />
                </Box>
                {participant._id !== currentUser._id && (
                  <IconButton
                    onClick={() => handleDeselectMember(participant._id)}
                  >
                    <Close />
                  </IconButton>
                )}
              </ListItem>
            );
          })}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog}>Cancel</Button>
        <Button onClick={handleSave} color={colorMode}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewThreadDialog;
