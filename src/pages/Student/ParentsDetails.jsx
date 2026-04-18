import React, { useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useSnackbar } from "notistack";
import api from "../../utils/axios";
import { useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Box, Grid, Card, Stack, Typography, Divider } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import logger from "../../utils/logger.js";
import {
  FormProvider,
  RHFTextField,
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
  fatherPhoneNumber: "",
  fatherOfficePhone: "",
  motherPhoneNumber: "",
  motherOfficePhone: "",
};

export default function ParentsDetails() {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const menteeId = searchParams.get('menteeId');
  const [isDataFetched, setIsDataFetched] = useState(false);

  const methods = useForm({
    defaultValues: DEFAULT_VALUES,
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  const fetchParentDetails = useCallback(async () => {
    try {
      const userId = menteeId || user?._id;
      if (!userId) {
        logger.error('No userId available for fetching data');
        return;
      }
      
      const response = await api.get(`/parent-details/${userId}`);
      logger.info("Full API response:", response);
      
      let parentDetails = null;
      
      if (response.data?.data?.parentDetails) {
        parentDetails = response.data.data.parentDetails;
        logger.info("Found parent details:", parentDetails);
      } else {
        logger.info("No parent details found or different response structure");
        return;
      }
      
      if (parentDetails) {
        const formData = {};
        Object.keys(DEFAULT_VALUES).forEach(key => {
          formData[key] = parentDetails[key] || "";
        });
        
        logger.info("Setting form data:", formData);
        reset(formData);
      }
    } catch (error) {
      logger.error("Error fetching parent details:", error);
      if (error.response?.status !== 404) {
        enqueueSnackbar("Error fetching parent details", { variant: "error" });
      }
    } finally {
      setIsDataFetched(true);
    }
  }, [user?._id, menteeId, reset, enqueueSnackbar]);

  useEffect(() => {
    fetchParentDetails();
  }, [fetchParentDetails]);

  const onSubmit = async (formData) => {
    try {
      const userId = menteeId || user?._id;
      if (!userId) {
        enqueueSnackbar("User ID is required", { variant: "error" });
        return;
      }
      
      logger.info("Form data:", formData);
      const requestData = {
        ...formData,
        userId,
      };
      
      logger.info("Sending data with userId:", requestData);
      const response = await api.post("/parent-details", requestData);
      
      enqueueSnackbar("Parent details saved successfully!", {
        variant: "success",
      });
    } catch (error) {
      logger.error("Error saving parent details:", error);
      const errorMessage = error.response?.data?.message || error.message || "An error occurred while saving parent details";
      enqueueSnackbar(errorMessage, { variant: "error" });
    }
  };

  return (
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={{ xs: 2, md: 3 }}>
          <Grid item xs={12} md={12}>
            <Card sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h5" gutterBottom>Parents Details</Typography>
              <Divider sx={{ mb: 3 }} />
              
              {!isDataFetched ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography>Loading parent details...</Typography>
                </Box>
              ) : (
                <>
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
                        name="motherFirstName"
                        label="Mother's First Name"
                        fullWidth
                        required
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <RHFTextField
                        name="motherMiddleName"
                        label="Mother's Middle Name"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <RHFTextField
                        name="motherLastName"
                        label="Mother's Last Name"
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </>
              )}
            </Card>
          </Grid>

          {isDataFetched && (
            <>
              <Grid item xs={12} md={6}>
                <Card sx={{ p: { xs: 2, sm: 3 } }}>
                  <Stack spacing={{ xs: 2, sm: 3 }} sx={{ mt: 1}}>
                    <Typography variant="h6">Father's Details</Typography>
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
                      name="fatherPhoneNumber"
                      label="Father's Phone Number"
                      fullWidth
                      required
                    />
                    <RHFTextField
                      name="fatherOfficePhone"
                      label="Father's Office Phone"
                      fullWidth
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
                <Card sx={{ p: { xs: 2, sm: 3 } }}>
                  <Stack spacing={{ xs: 2, sm: 3 }} sx={{ mt: 1}}>
                    <Typography variant="h6">Mother's Details</Typography>
                    <RHFTextField
                      name="motherOccupation"
                      label="Mother's Occupation"
                      fullWidth
                      required
                    />
                    <RHFTextField
                      name="motherOrganization"
                      label="Mother's Organization"
                      fullWidth
                    />
                    <RHFTextField
                      name="motherDesignation"
                      label="Mother's Designation"
                      fullWidth
                    />
                    <RHFTextField
                      name="motherPhoneNumber"
                      label="Mother's Phone Number"
                      fullWidth
                      required
                    />
                    <RHFTextField
                      name="motherOfficePhone"
                      label="Mother's Office Phone"
                      fullWidth
                    />
                    <RHFTextField
                      name="motherOfficeAddress"
                      label="Mother's Office Address"
                      fullWidth
                    />
                    <RHFTextField
                      name="motherAnnualIncome"
                      label="Mother's Annual Income"
                      fullWidth
                    />
                  </Stack>
                </Card>
              </Grid>
              <Grid item xs={12} md={12}>
                <Card sx={{ p: { xs: 2, sm: 3 } }}>
                  <Stack spacing={2} alignItems={{ xs: "stretch", sm: "flex-end" }}>
                    <Box sx={{ display: "flex", gap: 1, width: { xs: "100%", sm: "auto" } }}>
                      <LoadingButton
                        type="submit"
                        variant="contained"
                        loading={isSubmitting}
                        sx={{ width: { xs: "100%", sm: "auto" } }}
                      >
                        Save
                      </LoadingButton>
                    </Box>
                  </Stack>
                </Card>
              </Grid>
            </>
          )}
        </Grid>
      </FormProvider>
  );
}