import React, { useState } from "react";
import {
  Box,
  Grid,
  Card,
  Stack,
  Button,
  TextField,
  IconButton,
  Typography,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Delete as DeleteIcon } from "@mui/icons-material";

export default function ClubEvents() {
  const [rows, setRows] = useState([
    {
      slNo: 1,
      clubName: "",
      eventTitle: "",
      eventDate: "",
    },
  ]);

  const handleAddRow = () => {
    const newRow = {
      slNo: rows.length + 1,
      clubName: "",
      eventTitle: "",
      eventDate: "",
    };
    setRows([...rows, newRow]);
  };

  const handleInputChange = (index, field, value) => {
    const updatedRows = [...rows];
    updatedRows[index][field] = value;
    setRows(updatedRows);
  };

  const handleDeleteRow = (index) => {
    const updatedRows = rows.filter((_, i) => i !== index);
    setRows(updatedRows.map((row, i) => ({ ...row, slNo: i + 1 })));
  };

  const handleSave = () => {
    console.log("Saving Data: ", rows);
  };

  const handleReset = () => {
    setRows([
      {
        slNo: 1,
        clubName: "",
        eventTitle: "",
        eventDate: "",
      },
    ]);
  };

  const handleFillMockData = () => {
    setRows([
      {
        slNo: 1,
        clubName: "Literary Club",
        eventTitle: "Poetry Slam",
        eventDate: "2024-12-01",
      },
      {
        slNo: 2,
        clubName: "Coding Club",
        eventTitle: "Hackathon",
        eventDate: "2024-12-10",
      },
    ]);
  };

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Events Attended under the clubs
      </Typography>
      <Grid container spacing={2}>
        {rows.map((row, index) => (
          <Grid
            container
            spacing={2}
            key={row.slNo}
            alignItems="center"
            sx={{ mb: 1, mt: 1 }} 
          >
            <Grid item xs={1}>
              <TextField
                fullWidth
                disabled
                value={row.slNo}
                label="Sl. No."
                variant="outlined"
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                fullWidth
                value={row.clubName}
                onChange={(e) =>
                  handleInputChange(index, "clubName", e.target.value)
                }
                label="Club Name"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                value={row.eventTitle}
                onChange={(e) =>
                  handleInputChange(index, "eventTitle", e.target.value)
                }
                label="Event Title"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                fullWidth
                value={row.eventDate}
                onChange={(e) =>
                  handleInputChange(index, "eventDate", e.target.value)
                }
                label="Event Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={1}>
              <IconButton
                color="error"
                onClick={() => handleDeleteRow(index)}
                sx={{ mt: 1 }}
              >
                <DeleteIcon />
              </IconButton>
            </Grid>
          </Grid>
        ))}
        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={handleAddRow}
            sx={{ mt: 2, display: "block", mx: "auto" }}
          >
            Add Event
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
            <LoadingButton
              variant="outlined"
              onClick={handleFillMockData}
              color="info"
            >
              Fill Mock Data
            </LoadingButton>
            <LoadingButton variant="outlined" onClick={handleReset}>
              Reset
            </LoadingButton>
            <LoadingButton variant="contained" onClick={handleSave}>
              Save
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
    </Card>
  );
}
