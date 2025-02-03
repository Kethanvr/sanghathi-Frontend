// MentorAssignmentDialog.jsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import api from "../../utils/axios";
import MentorSuggestionMenu from "./MentorSuggestionMenu";

const MentorAssignmentDialog = ({ open, studentIds, onClose }) => {
  const [selectedMentor, setSelectedMentor] = useState({ name: "" }); // Initialize with empty name
  const [anchorEl, setAnchorEl] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const response = await api.get("/users?role=faculty");
        const { data } = response.data;
        setMentors(data.users);
      } catch (error) {
        console.error(error);
      }
    };

    if (open) {
      fetchMentors();
    }
  }, [open]);

  const handleMentorNameChange = (event) => {
    const value = event.target.value;
    setSelectedMentor({ ...selectedMentor, name: value });
    
    if (value.trim() !== "") {
      setSuggestions(
        mentors.filter((mentor) =>
          mentor.name.toLowerCase().startsWith(value.toLowerCase())
        )
      );
      setAnchorEl(event.target);
    } else {
      setSuggestions([]);
      setAnchorEl(null);
    }
  };

  const handleSave = async () => {
    try {
      // Using the batch endpoint for multiple students
      const response = await api.post("/mentors/batch", {
        mentorId: selectedMentor._id,
        menteeIds: studentIds,
        startDate: new Date().toISOString(),
      });

      console.log(response.data.message); // Log success message
      handleCancel();
    } catch (error) {
      console.error("Error assigning mentor:", error);
    }
  };

  const handleCancel = () => {
    setSelectedMentor({ name: "" });
    setSuggestions([]);
    setAnchorEl(null);
    onClose();
  };

  const handleMentorSelect = (mentor) => {
    setSelectedMentor(mentor);
    setSuggestions([]);
    setAnchorEl(null);
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      aria-labelledby="mentor-dialog-title"
      maxWidth="md"
      fullWidth={true}
      sx={{ "& .MuiPaper-root": { maxWidth: 500 } }}
    >
      <DialogTitle id="mentor-dialog-title">
        Assign Mentor to {studentIds.length} Selected Student(s)
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Mentor Name"
          type="text"
          fullWidth
          value={selectedMentor.name || ""}
          onChange={handleMentorNameChange}
        />
        {suggestions.length > 0 && (
          <MentorSuggestionMenu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            suggestions={suggestions}
            onMentorSelect={handleMentorSelect}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          color="primary"
          disabled={!selectedMentor._id}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MentorAssignmentDialog;