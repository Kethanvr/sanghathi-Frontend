import React, { useState } from "react";
import { Box, Grid, Card, Stack, TextField, Button, IconButton } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import DeleteIcon from "@mui/icons-material/Delete";

const DEFAULT_VALUES = {
  title: "",
  manHours: "",
  startDate: "",
  completedDate: "",
};

export default function MiniProject() {
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
        title: "AI Chatbot Development",
        manHours: "120",
        startDate: "2024-01-01",
        completedDate: "2024-01-20",
      },
      {
        slNo: 2,
        title: "IoT Smart Home System",
        manHours: "150",
        startDate: "2024-02-15",
        completedDate: "2024-03-10",
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
                    label="Mini Project Title"
                    value={row.title}
                    onChange={(e) =>
                      handleInputChange(index, "title", e.target.value)
                    }
                    sx={{ width: "40%" }}
                    disabled={!isEditable}
                  />
                  <TextField
                    label="Man Hours"
                    value={row.manHours}
                    onChange={(e) =>
                      handleInputChange(index, "manHours", e.target.value)
                    }
                    sx={{ width: "15%" }}
                    disabled={!isEditable}
                  />
                  <TextField
                    type="date"
                    label="Start Date"
                    value={row.startDate}
                    onChange={(e) =>
                      handleInputChange(index, "startDate", e.target.value)
                    }
                    InputLabelProps={{ shrink: true }}
                    sx={{ width: "15%" }}
                    disabled={!isEditable}
                  />
                  <TextField
                    type="date"
                    label="Completed Date"
                    value={row.completedDate}
                    onChange={(e) =>
                      handleInputChange(index, "completedDate", e.target.value)
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
