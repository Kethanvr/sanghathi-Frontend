import React, { useState } from "react";
import { Box, Grid, Card, Stack, TextField, Button, IconButton, Link } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import DeleteIcon from "@mui/icons-material/Delete";

const DEFAULT_VALUES = {
  portal: "",
  title: "",
  startDate: "",
  completedDate: "",
  score: "",
  certificateLink: "",
};

export default function Mooc() {
  const [rows, setRows] = useState([{ slNo: 1, ...DEFAULT_VALUES }]);
  const [isEditable, setIsEditable] = useState(false); // Tracks if editing is enabled
  const [editingCertificateIndex, setEditingCertificateIndex] = useState(-1); // Tracks the row index being edited for certificate link

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
        portal: "Coursera",
        title: "AI for Everyone",
        startDate: "2024-01-01",
        completedDate: "2024-03-01",
        score: "95%",
        certificateLink: "https://coursera.org/certificate/xyz",
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
                    label="Course Portal"
                    value={row.portal}
                    onChange={(e) =>
                      handleInputChange(index, "portal", e.target.value)
                    }
                    sx={{ width: "15%" }}
                    disabled={!isEditable}
                  />
                  <TextField
                    label="Mooc Title"
                    value={row.title}
                    onChange={(e) =>
                      handleInputChange(index, "title", e.target.value)
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
                  <TextField
                    label="Score"
                    value={row.score}
                    onChange={(e) =>
                      handleInputChange(index, "score", e.target.value)
                    }
                    sx={{ width: "10%" }}
                    disabled={!isEditable}
                  />
                  {editingCertificateIndex === index ? (
                    <TextField
                      label="Certificate Link"
                      value={row.certificateLink}
                      onChange={(e) =>
                        handleInputChange(index, "certificateLink", e.target.value)
                      }
                      onBlur={() => setEditingCertificateIndex(-1)} // Exit editing mode on blur
                      sx={{ width: "20%" }}
                    />
                  ) : (
                    <Link
                      href={row.certificateLink || "#"}
                      onClick={(e) => {
                        e.preventDefault();
                        if (isEditable) setEditingCertificateIndex(index);
                      }}
                      underline={row.certificateLink ? "hover" : "none"}
                      sx={{ width: "20%", color: row.certificateLink ? "primary.main" : "text.secondary" }}
                    >
                      {row.certificateLink || "Add Certificate Link"}
                    </Link>
                  )}
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
