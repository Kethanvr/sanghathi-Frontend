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
      clubdepartment: "",
      registeredDate: "",
    },
  ]);

  const handleAddRow = () => {
    const newRow = {
      slNo: rows.length + 1,
      clubName: "",
      clubdepartment: "",
      registeredDate: "",
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
        clubdepartment: "",
        registeredDate: "",
      },
    ]);
  };

  const handleFillMockData = () => {
    setRows([
      {
        slNo: 1,
        clubName: "Literary Club",
        clubdepartment: "Poetry Slam",
        registeredDate: "2024-12-01",
      },
      {
        slNo: 2,
        clubName: "Coding Club",
        clubdepartment: "Hackathon",
        registeredDate: "2024-12-10",
      },
    ]);
  };

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Clubs Registered (Department Specific or Institution Specific)
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
                value={row.clubdepartment}
                onChange={(e) =>
                  handleInputChange(index, "clubdepartment", e.target.value)
                }
                label="Club Department"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                fullWidth
                value={row.registeredDate}
                onChange={(e) =>
                  handleInputChange(index, "registeredDate", e.target.value)
                }
                label="registeredDate"
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
            Add Clubs
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
