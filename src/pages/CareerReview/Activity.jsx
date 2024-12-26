import React, { useState } from "react";
import { Box, Grid, Card, Stack, TextField, Button, Typography, IconButton } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import DeleteIcon from "@mui/icons-material/Delete";

const DEFAULT_VALUES = {
  eventType: "",
  eventTitle: "",
  description: "",
  eventDate: "",
};

export default function Activity() {
  const [rows, setRows] = useState([{ slNo: 1, ...DEFAULT_VALUES }]);
  const [isEditable, setIsEditable] = useState(false); // Tracks if editing is enabled

  const handleAddRow = () => {
    setRows([
      ...rows,
      {
        slNo: rows.length + 1,
        ...DEFAULT_VALUES,
      },
    ]);
  };

  const handleInputChange = (index, field, value) => {
    const updatedRows = rows.map((row, i) =>
      i === index ? { ...row, [field]: value } : row
    );
    setRows(updatedRows);
  };

  const handleDeleteRow = (index) => {
    const updatedRows = rows.filter((_, i) => i !== index);
    const reIndexedRows = updatedRows.map((row, i) => ({
      ...row,
      slNo: i + 1,
    }));
    setRows(reIndexedRows);
  };

  const handleReset = () => {
    setRows([{ slNo: 1, ...DEFAULT_VALUES }]);
  };

  const handleMockData = () => {
    setRows([
      {
        slNo: 1,
        eventType: "Sports",
        eventTitle: "Inter-College Basketball Tournament",
        description: "Participated as a team captain and secured 2nd place.",
        eventDate: "2024-03-01",
      },
      {
        slNo: 2,
        eventType: "Cultural",
        eventTitle: "Annual Drama Competition",
        description: "Performed in a theatrical play and won best actor award.",
        eventDate: "2024-04-15",
      },
    ]);
  };

  const handleSave = () => {
    console.log("Saved data:", rows);
  };

  const toggleEdit = () => {
    setIsEditable(!isEditable);
  };

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Typography
                variant="h6"
                textAlign="center"
                sx={{ mb: 2, fontWeight: "bold" }}
              >
                Event Participation Record in Sports, Cultural, Societal, etc by the Student
              </Typography>
              {rows.map((row, index) => (
                <Box
                  key={index}
                  display="flex"
                  alignItems="center"
                  gap={2}
                  sx={{
                    "&:not(:first-of-type)": { mt: 2 },
                    justifyContent: "space-between",
                  }}
                >
                  <TextField
                    label="Sl No"
                    value={row.slNo}
                    disabled
                    sx={{ width: "5%" }}
                  />
                  <TextField
                    label="Event Type"
                    value={row.eventType}
                    onChange={(e) =>
                      handleInputChange(index, "eventType", e.target.value)
                    }
                    sx={{ width: "20%" }}
                    disabled={!isEditable}
                  />
                  <TextField
                    label="Event Title"
                    value={row.eventTitle}
                    onChange={(e) =>
                      handleInputChange(index, "eventTitle", e.target.value)
                    }
                    sx={{ width: "25%" }}
                    disabled={!isEditable}
                  />
                  <TextField
                    label="Description"
                    value={row.description}
                    onChange={(e) =>
                      handleInputChange(index, "description", e.target.value)
                    }
                    sx={{ width: "30%" }}
                    disabled={!isEditable}
                  />
                  <TextField
                    type="date"
                    label="Event Date"
                    value={row.eventDate}
                    onChange={(e) =>
                      handleInputChange(index, "eventDate", e.target.value)
                    }
                    InputLabelProps={{ shrink: true }}
                    sx={{ width: "15%" }}
                    disabled={!isEditable}
                  />
                  {isEditable && (
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteRow(index)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              ))}
              <Box textAlign="center" sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleAddRow}
                  sx={{ mt: 1 }}
                >
                  Add Row
                </Button>
              </Box>
            </Stack>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card sx={{ p: 2 }}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <LoadingButton
                variant="contained"
                onClick={toggleEdit}
                sx={{
                  bgcolor: isEditable ? "error.main" : "primary.main",
                  color: "white",
                }}
              >
                {isEditable ? "Disable Edit" : "Edit"}
              </LoadingButton>
              <LoadingButton variant="outlined" onClick={handleMockData}>
                Fill Mock Data
              </LoadingButton>
              <LoadingButton variant="outlined" onClick={handleReset}>
                Reset
              </LoadingButton>
              <LoadingButton variant="contained" onClick={handleSave}>
                Save
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
