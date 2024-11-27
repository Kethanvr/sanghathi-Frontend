import React from "react";
import { useState } from "react";
import { useSnackbar } from "notistack";
import { useCallback } from "react";
import api from "../../utils/axios";

// form
import { useForm } from "react-hook-form";

// @mui
import { Box, Grid, Card, Stack } from "@mui/material";
import { LoadingButton } from "@mui/lab";

// components
import {
  FormProvider,
  RHFTextField,
  RHFSelect,
  RHFUploadAvatar,
  RHFCheckbox,
} from "../../components/hook-form";

const DEFAULT_VALUES = {
  fatherFirstName: "",
  fatherMiddleName: "",
  fatherLastName: "",
  motherFirstName: "",
  motherMiddleName: "",
  motherLastName: "",
  fatherOccupation: "",
  motherOccupation: "",
  fatherOrganization: "",
  motherOrganization: "",
  fatherDesignation: "",
  motherDesignation: "",
  fatherOfficeAddress: "",
  motherOfficeAddress: "",
  fatherAnnualIncome: "",
  motherAnnualIncome: "",
  fatherOfficePhone: "",
  motherOfficePhone: "",
  fatherResidencePhone: "",
  motherResidencePhone: "",
  fatherEmail: "",
  motherEmail: "",
  mobileNumber: "",
  residenceAddress: "",
  fax: "",
  district: "",
  taluka: "",
  village: "",
  state: "",
  pincode: "",
};
export default function ParentsDetails() {
  const { enqueueSnackbar } = useSnackbar();

  const methods = useForm({
    defaultValues: DEFAULT_VALUES,
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  const handleFillMockData = () => {
    reset(DEFAULT_VALUES);
  };

  const handleReset = () => {
    reset();
  };

  const onSubmit = useCallback(async (formData) => {
    try {
      await api.post("/api/my-form-endpoint", formData);
      enqueueSnackbar("Form submitted successfully!", {
        variant: "success",
      });
      reset(DEFAULT_VALUES);
    } catch (error) {
      console.error(error);
      enqueueSnackbar("An error occurred while processing the request", {
        variant: "error",
      });
    }
  }, []);

  return (
    <div>

<FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={2}>
      <Grid item xs={12} md={12}>
          <Card sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
              <RHFTextField
                  name="fatherFirstName"
                  label="Father's First Name"
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
             <RHFTextField
                  name="fatherMiddleName"
                  label="Father's Middle Name"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={4}>
              <RHFTextField
                  name="fatherLastName"
                  label="Father's Last Name"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={4}>
              <RHFTextField
                  name="MotherFirstName"
                  label="Mother's First Name"
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
             <RHFTextField
                  name="MotherMiddleName"
                  label="Mother's Middle Name"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={4}>
              <RHFTextField
                  name="MotherLastName"
                  label="Mother's Last Name"
                  fullWidth
                />
              </Grid>
           
              
            </Grid>
           
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
        <Card sx={{ p: 3 }}>
            <Stack spacing={3} sx={{ mt: 1}}>
                <h3>Father's Details</h3>
                <RHFTextField
                  name="fatherOccupation"
                  label="Father's Occupation"
                  fullWidth
                  required
                />
                 <RHFTextField
                  name="fatherOrganization"
                  label="Father's Organization"
                  fullWidth
                />
                <RHFTextField
                  name="fatherDesignation"
                  label="Father's Designation"
                  fullWidth
                />
                <RHFTextField
                  name="fatherOfficePhoneNo"
                  label="Father's Office Phone No."
                  fullWidth
                  required
                />
              <RHFTextField
                  name="fatherOfficeAddress"
                  label="Father's Office Address"
                  fullWidth
                />
               <RHFTextField
                  name="fatherAnnualIncome"
                  label="Father's Annual Income"
                  fullWidth
                />
            </Stack>
            
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 3 }}>
          <Stack spacing={3} sx={{ mt: 1}}>
                <h3>Mother's Details</h3>
                <RHFTextField
                  name="MotherOccupation"
                  label="Mother's Occupation"
                  fullWidth
                  required
                />
                 <RHFTextField
                  name="MotherOrganization"
                  label="Mother's Organization"
                  fullWidth
                />
                <RHFTextField
                  name="MotherDesignation"
                  label="Mother's Designation"
                  fullWidth
                />
                <RHFTextField
                  name="MotherOfficePhoneNo"
                  label="Mother's Phone No."
                  fullWidth
                  required
                />
              <RHFTextField
                  name="MotherOfficeAddress"
                  label="Mother's Office Address"
                  fullWidth
                />
               <RHFTextField
                  name="MotherAnnualIncome"
                  label="Mother's Annual Income"
                  fullWidth
                />
                
            </Stack>
          
          </Card>
        </Grid>

       <Grid item xs={12} md={12}>
        <Card sx={{p:3}}>
        <Stack spacing={3} alignItems="flex-end" >
              <Box display="flex" gap={1}>
                {import.meta.env.MODE === "development" && (
                  <LoadingButton
                    variant="outlined"
                    onClick={handleFillMockData}
                  >
                    Fill Mock Data
                  </LoadingButton>
                )}
                <LoadingButton variant="outlined" onClick={handleReset}>
                  Reset
                </LoadingButton>
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
    </div>
  );
}
