import React, { useState, useCallback } from "react";
import { useSnackbar } from "notistack";
import api from "../../utils/axios";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
// form
import { useForm, useWatch } from "react-hook-form";

// @mui
import { Box, Grid, Card, Stack } from "@mui/material";
import { LoadingButton } from "@mui/lab";

// components
import {
  FormProvider,
  RHFTextField,
} from "../../components/hook-form";

const DEFAULT_VALUES = {
  currentAddress: {
    line1: "",
    line2: "",
    country: "",
    state: "",
    city: "",
    district: "",
    taluka: "",
    pincode: "",
    phoneNumber: "",
  },
  permanentAddress: {
    line1: "",
    line2: "",
    country: "",
    state: "",
    city: "",
    district: "",
    taluka: "",
    pincode: "",
    phoneNumber: "",
  },
};

export default function ContactDetails() {
  const { enqueueSnackbar } = useSnackbar();
  const [sameAsCurrent, setSameAsCurrent] = useState(false); // Default is OFF

  const methods = useForm({
    defaultValues: DEFAULT_VALUES,
  });

  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting },
  } = methods;

  const currentAddress = useWatch({ name: "currentAddress", control: methods.control });

  const handleSwitchChange = (event) => {
    const isChecked = event.target.checked;
    setSameAsCurrent(isChecked);

    if (isChecked) {
      // Copy current address to permanent address
      setValue("permanentAddress", currentAddress, { shouldValidate: true });
    } else {
      // Reset permanent address when unchecked
      setValue("permanentAddress", DEFAULT_VALUES.permanentAddress, { shouldValidate: true });
    }
  };

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
          {/* Current Address */}
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={3} sx={{ mt: 1 }}>
                <h3>Current Address:</h3>
                <RHFTextField name="currentAddress.line1" label="Line 1" multiline required fullWidth />
                <RHFTextField name="currentAddress.line2" label="Line 2" multiline fullWidth />
                <RHFTextField name="currentAddress.country" label="Country" fullWidth required />
                <RHFTextField name="currentAddress.state" label="State" multiline fullWidth />
                <RHFTextField name="currentAddress.city" label="City" fullWidth />
                <RHFTextField name="currentAddress.district" label="District" fullWidth />
                <RHFTextField name="currentAddress.taluka" label="Taluka" fullWidth />
                <RHFTextField name="currentAddress.pincode" label="Pin-Code" fullWidth required />
                <RHFTextField name="currentAddress.phoneNumber" label="Phone Number" fullWidth required />
              </Stack>
            </Card>
          </Grid>

          {/* Permanent Address */}
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={3} sx={{ mt: 1 }}>
                <h3>
                  Permanent Address:
                  <FormControlLabel
                    sx={{ float: "right" }}
                    control={
                      <Switch checked={sameAsCurrent} onChange={handleSwitchChange} />
                    }
                    label="Same as Current"
                  />
                </h3>
                <RHFTextField name="permanentAddress.line1" label="Line 1" multiline required fullWidth />
                <RHFTextField name="permanentAddress.line2" label="Line 2" multiline fullWidth />
                <RHFTextField name="permanentAddress.country" label="Country" fullWidth required />
                <RHFTextField name="permanentAddress.state" label="State" multiline fullWidth />
                <RHFTextField name="permanentAddress.city" label="City" fullWidth />
                <RHFTextField name="permanentAddress.district" label="District" fullWidth />
                <RHFTextField name="permanentAddress.taluka" label="Taluka" fullWidth />
                <RHFTextField name="permanentAddress.pincode" label="Pin-Code" fullWidth required />
                <RHFTextField name="permanentAddress.phoneNumber" label="Phone Number" fullWidth required />
              </Stack>
            </Card>
          </Grid>

          {/* Submit Buttons */}
          <Grid item xs={12} md={12}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={3} alignItems="flex-end">
                <Box display="flex" gap={1}>
                  {import.meta.env.MODE === "development" && (
                    <LoadingButton variant="outlined" onClick={handleFillMockData}>
                      Fill Mock Data
                    </LoadingButton>
                  )}
                  <LoadingButton variant="outlined" onClick={handleReset}>
                    Reset
                  </LoadingButton>
                  <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
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
