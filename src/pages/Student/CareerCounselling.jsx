import React from 'react'
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
  CareerObjective: "",
  ActionPlan: "",
  TrainingRequirements: "",
  TrainingPlanning: "",
  Certification: "",
};

export default function CareerCounselling() {
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

const TechnicalStudies = ["Mtech in India", "Mtech in US", "Others"];
const ManagementStudies = ["MBA in India", "MS in US", "Others"];
const Entrepreneur = ["Family Business", "New Business", "Others"];
const Job = ["Government", "Private", "Others"];
const CompetitiveExams = ["GATE", "GRE", "TOEFL","IELTS","GMAT","MAT","IES","IAS","Others"];

  return (
    <div>
      
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Card sx={{ p: 3 }}>
    <Grid container spacing={2}>

        <Grid item xs={12}>
            <RHFSelect name="TechnicalStudies" label="TechnicalStudies" placeholder="Studies">
                    <option value="" />
                    {TechnicalStudies.map((option) => (
                        <option key={option} value={option}>
                        {option}
                        </option>
                    ))}
            </RHFSelect>
        </Grid>

        <Grid item xs={12}>
            <RHFSelect name="ManagementStudies" label="Management Studies" placeholder="ManagementStudies">
                    <option value="" />
                    {ManagementStudies.map((option) => (
                        <option key={option} value={option}>
                        {option}
                        </option>
                    ))}
            </RHFSelect>
        </Grid>

        <Grid item xs={12}>
            <RHFSelect name="Entrepreneur" label="Entrepreneur" placeholder="Entrepreneur">
                    <option value="" />
                    {Entrepreneur.map((option) => (
                        <option key={option} value={option}>
                        {option}
                        </option>
                    ))}
            </RHFSelect>
        </Grid>

        <Grid item xs={12}>
            <RHFSelect name="Job" label="Job" placeholder="Job">
                    <option value="" />
                    {Job.map((option) => (
                        <option key={option} value={option}>
                        {option}
                        </option>
                    ))}
            </RHFSelect>
        </Grid>

        <Grid item xs={12}>
            <RHFSelect name="CompetitiveExams" label="Competitive Exams plan to attend" placeholder="Exams">
                    <option value="" />
                    {CompetitiveExams.map((option) => (
                        <option key={option} value={option}>
                        {option}
                        </option>
                    ))}
            </RHFSelect>
        </Grid>

        
        <Grid item xs={12}>
        <RHFTextField
                name="CareerObjective"
                label="Career Objective for studies/job, after passing out from college (in 2 or 3 sentences)"
                multiline
                fullWidth
                rows={4}
            />
        </Grid>

        <Grid item xs={12}>
        <RHFTextField
                name="ActionPlan"
                label="Action Plan for Career Objective (in 2 or 3 sentences)"
                multiline
                fullWidth
                rows={4}
            />
        </Grid>

        <Grid item xs={12}>
        <RHFTextField
                name="TrainingRequirements"
                label="Training Requirements: (Internal/External/Others)"
                multiline
                fullWidth
                rows={4}
            />
        </Grid>

        <Grid item xs={12}>
        <RHFTextField
                name="TrainingPlanning"
                label="Trainings Planning to attend"
                multiline
                fullWidth
                rows={4}
            />
        </Grid>

        <Grid item xs={12}>
        <RHFTextField
                name="Certification"
                label="Certification Planning to get: "
                multiline
                fullWidth
                rows={4}
            />
        </Grid>


    </Grid>
    <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
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

</FormProvider>





    </div>
  )
}
