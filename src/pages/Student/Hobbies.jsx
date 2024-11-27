import React, { useState } from "react";
import { Box, Grid, Card, Stack, TextField, Button, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";

export default function Hobbies() {
  const [formData, setFormData] = useState({
    hobbies: "",
    nccNss: "",
    achievements: {
      academic: "",
      cultural: "",
      sports: "",
      others: "",
    },
    ambition: "",
    plans: "",
    roleModel: "",
    roleModelReason: "",
    selfDescription: "",
  });

  const handleChange = (field, value) => {
    if (field.includes(".")) {
      const [mainField, subField] = field.split(".");
      setFormData((prevState) => ({
        ...prevState,
        [mainField]: {
          ...prevState[mainField],
          [subField]: value,
        },
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [field]: value,
      }));
    }
  };

  const handleReset = () => {
    setFormData({
      hobbies: "",
      nccNss: "",
      achievements: {
        academic: "",
        cultural: "",
        sports: "",
        others: "",
      },
      ambition: "",
      plans: "",
      roleModel: "",
      roleModelReason: "",
      selfDescription: "",
    });
  };

  const handleSave = () => {
    console.log("Saved data:", formData);
  };

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <Typography
                variant="h6"
                textAlign="center"
                sx={{ fontWeight: "bold", mb: 2 }}
              >
                Hobbies and Aspirations
              </Typography>

              <TextField
                label="What are your hobbies?"
                value={formData.hobbies}
                onChange={(e) => handleChange("hobbies", e.target.value)}
                fullWidth
              />

              <TextField
                label="Are you a member of NCC/NSS? If yes, describe"
                value={formData.nccNss}
                onChange={(e) => handleChange("nccNss", e.target.value)}
                fullWidth
              />

              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  What are your achievements so far?
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    label="Academic"
                    value={formData.achievements.academic}
                    onChange={(e) =>
                      handleChange("achievements.academic", e.target.value)
                    }
                    fullWidth
                  />
                  <TextField
                    label="Cultural"
                    value={formData.achievements.cultural}
                    onChange={(e) =>
                      handleChange("achievements.cultural", e.target.value)
                    }
                    fullWidth
                  />
                  <TextField
                    label="Sports"
                    value={formData.achievements.sports}
                    onChange={(e) =>
                      handleChange("achievements.sports", e.target.value)
                    }
                    fullWidth
                  />
                  <TextField
                    label="Others"
                    value={formData.achievements.others}
                    onChange={(e) =>
                      handleChange("achievements.others", e.target.value)
                    }
                    fullWidth
                  />
                </Stack>
              </Box>

              <TextField
                label="What is your ambition or goal?"
                value={formData.ambition}
                onChange={(e) => handleChange("ambition", e.target.value)}
                fullWidth
              />

              <TextField
                label="What are your plans to achieve your goals?"
                value={formData.plans}
                onChange={(e) => handleChange("plans", e.target.value)}
                fullWidth
              />

              <Box>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Who is your role model and why?
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    label="Role Model"
                    value={formData.roleModel}
                    onChange={(e) => handleChange("roleModel", e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Reason"
                    value={formData.roleModelReason}
                    onChange={(e) =>
                      handleChange("roleModelReason", e.target.value)
                    }
                    fullWidth
                  />
                </Stack>
              </Box>

              <TextField
                label="Describe yourself"
                value={formData.selfDescription}
                onChange={(e) => handleChange("selfDescription", e.target.value)}
                fullWidth
                multiline
                rows={4}
              />
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ p: 2 }}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
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
