import { useSnackbar } from "notistack";
import { useCallback, useContext, useState, useEffect } from "react";

import api from "../../utils/axios";

// form
import { useForm } from "react-hook-form";
import { AuthContext } from "../../context/AuthContext";

// @mui
import { Box, Grid, Card, Stack } from "@mui/material";
import { LoadingButton } from "@mui/lab";

// components
import {
  FormProvider,
  RHFTextField,
  RHFSelect,
  RHFUploadAvatar,
} from "../../components/hook-form";

const yesNoOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

export default function StudentDetailsForm() {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useContext(AuthContext);
  const [isDataFetched, setIsDataFetched] = useState(false);
  const methods = useForm();
  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
    setValue,
  } = methods;

  const fetchStudentData = useCallback(async () => {
    try {
      const response = await api.get(`/students/profile/${user._id}`);
      const { data } = response.data;
      
      if (data) {
        // Set each form field using the fetched data
        Object.keys(data.studentProfile).forEach((key) => {
          if (data.studentProfile[key] && typeof data.studentProfile[key] === "object") {
            Object.keys(data.studentProfile[key]).forEach((innerKey) => {
              setValue(`studentProfile.${key}.${innerKey}`, data.studentProfile[key][innerKey]);
            });
          } else {
            setValue(`studentProfile.${key}`, data.studentProfile[key]);
          }
        });
        setIsDataFetched(true);
      }
      console.log("Student data fetched successfully:", data);
    } catch (error) {
      console.error("Error fetching student data:", error.response || error);
    }
  }, [user._id, setValue]);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  const handleReset = () => {
    reset();
    setIsDataFetched(false);
  };

  const onSubmit = useCallback(async (formData) => {
    try {
      await api.post("/students/profile", formData.studentProfile);
      enqueueSnackbar("Student profile updated successfully!", {
        variant: "success",
      });
      reset();
    } catch (error) {
      console.error(error);
      enqueueSnackbar("An error occurred while processing the request", {
        variant: "error",
      });
    }
  }, [enqueueSnackbar, reset]);

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: "100%", py: 10, px: 3, textAlign: "center" }}>
            <RHFUploadAvatar
              name="studentProfile.photo"
              accept="image/*"
              maxSize={3145728}
              helperText={
                <Box
                  component="span"
                  sx={{
                    mt: 2,
                    mx: "auto",
                    display: "block",
                    textAlign: "center",
                    color: "text.secondary",
                  }}
                >
                  Allowed *.jpeg, *.jpg, *.png, *.gif
                  <br /> max size of 3MB
                </Box>
              }
            />
          </Card>
        </Grid>
        <Grid item xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={3} sx={{ mt: 3 }}>
              <RHFTextField
                name="studentProfile.fullName.firstName"
                label="First Name"
                fullWidth
                required={!isDataFetched}
                autoComplete="given-name"
                InputLabelProps={{ shrink: isDataFetched }}
              />
              <RHFTextField
                name="studentProfile.fullName.middleName"
                label="Middle Name"
                fullWidth
                autoComplete="additional-name"
                InputLabelProps={{ shrink: isDataFetched }}
              />
              <RHFTextField
                name="studentProfile.fullName.lastName"
                label="Last Name"
                fullWidth
                autoComplete="family-name"
                InputLabelProps={{ shrink: isDataFetched }}
              />
              <RHFTextField
                name="studentProfile.department"
                label="Department"
                fullWidth
                required={!isDataFetched}
                autoComplete="off"
                InputLabelProps={{ shrink: isDataFetched }}
              />
              <RHFTextField
                name="studentProfile.personalEmail"
                label="Personal Email"
                type="email"
                fullWidth
                required={!isDataFetched}
                autoComplete="email"
                InputLabelProps={{ shrink: isDataFetched }}
              />
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} md={12}>
          <Card sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <RHFTextField
                  name="studentProfile.email"
                  label="College Email"
                  type="email"
                  fullWidth
                  required={!isDataFetched}
                  autoComplete="email"
                  InputLabelProps={{ shrink: isDataFetched }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <RHFTextField
                  name="studentProfile.usn"
                  label="USN"
                  fullWidth
                  required={!isDataFetched}
                  autoComplete="off"
                  InputLabelProps={{ shrink: isDataFetched }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <RHFTextField
                  name="studentProfile.dateOfBirth"
                  label="Date of Birth"
                  type="date"
                  fullWidth
                  required={!isDataFetched}
                  InputLabelProps={{ shrink: isDataFetched }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <RHFTextField
                  name="studentProfile.bloodGroup"
                  label="Blood Group"
                  fullWidth
                  autoComplete="off"
                  InputLabelProps={{ shrink: isDataFetched }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <RHFTextField
                  name="studentProfile.mobileNumber"
                  label="Mobile Number"
                  type="tel"
                  fullWidth
                  required={!isDataFetched}
                  autoComplete="tel"
                  InputLabelProps={{ shrink: isDataFetched }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <RHFTextField
                  name="studentProfile.alternatePhoneNumber"
                  label="Alternate Phone Number"
                  type="tel"
                  fullWidth
                  autoComplete="tel"
                  InputLabelProps={{ shrink: isDataFetched }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <RHFTextField
                  name="studentProfile.nationality"
                  label="Nationality"
                  fullWidth
                  required={!isDataFetched}
                  autoComplete="off"
                  InputLabelProps={{ shrink: isDataFetched }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <RHFTextField
                  name="studentProfile.domicile"
                  label="Domicile"
                  fullWidth
                  autoComplete="off"
                  InputLabelProps={{ shrink: isDataFetched }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <RHFTextField
                  name="studentProfile.category"
                  label="Category"
                  fullWidth
                  autoComplete="off"
                  InputLabelProps={{ shrink: isDataFetched }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <RHFTextField
                  name="studentProfile.caste"
                  label="Caste"
                  fullWidth
                  autoComplete="off"
                  InputLabelProps={{ shrink: isDataFetched }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <RHFTextField
                  name="studentProfile.aadharCardNumber"
                  label="Aadhar Card Number"
                  fullWidth
                  required={!isDataFetched}
                  autoComplete="off"
                  InputLabelProps={{ shrink: isDataFetched }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <RHFTextField
                  name="studentProfile.admissionDate"
                  label="Admission Date"
                  type="date"
                  fullWidth
                  required={!isDataFetched}
                  InputLabelProps={{ shrink: isDataFetched }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <RHFSelect
                  name="studentProfile.hostelite"
                  label="Hostelite"
                  fullWidth
                  required={!isDataFetched}
                  InputLabelProps={{ shrink: isDataFetched }}
                >
                  {yesNoOptions.map((option) => (
                    <option key={option.value}>{option.label}</option>
                  ))}
                </RHFSelect>
              </Grid>
              <Grid item xs={12} md={4}>
                <RHFSelect
                  name="studentProfile.physicallyChallenged"
                  label="Physically Challenged"
                  fullWidth
                  required={!isDataFetched}
                  InputLabelProps={{ shrink: isDataFetched }}
                >
                  {yesNoOptions.map((option) => (
                    <option key={option.value}>{option.label}</option>
                  ))}
                </RHFSelect>
              </Grid>
            </Grid>
            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
              <Box display="flex" gap={1}>
                {import.meta.env.MODE === "development" && (
                  <LoadingButton
                    variant="outlined"
                    onClick={handleReset}
                  >
                    Reset
                  </LoadingButton>
                )}
                <LoadingButton
                  type="submit"
                  variant="contained"
                  loading={isSubmitting}
                >
                  Save
                </LoadingButton>
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
