import { useSnackbar } from "notistack";
import { useCallback, useContext, useState, useEffect } from "react";
import api from "../../utils/axios";
import { useSearchParams } from "react-router-dom";
// form
import { useForm, useWatch } from "react-hook-form";
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

const BASE_URL = import.meta.env.VITE_API_URL;
const yesNoOptions = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];


export default function StudentDetailsForm() {
  const [searchParams] = useSearchParams();
  const menteeId = searchParams.get('menteeId');
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useContext(AuthContext);
  console.log("User : ",user);
  console.log("id: ",menteeId);
  
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [setMentorName] = useState("Loading...");

  const methods = useForm();
  const watchedValues = useWatch({
    control: methods.control,
    name: [
      "studentProfile.fullName.firstName",
      "studentProfile.fullName.middleName",
      "studentProfile.fullName.lastName",
      "studentProfile.department",
      "studentProfile.sem",
      "studentProfile.personalEmail",
      // "studentProfile.mentorName",
      "studentProfile.email",
      "studentProfile.usn",
      "studentProfile.dateOfBirth",
      "studentProfile.bloodGroup",
      "studentProfile.mobileNumber",
      "studentProfile.alternatePhoneNumber",
      "studentProfile.nationality",
      "studentProfile.domicile",
      "studentProfile.category",
      "studentProfile.caste",
      "studentProfile.aadharCardNumber",
      "studentProfile.admissionDate",
      "studentProfile.hostelite",
      "studentProfile.physicallyChallenged",
    ],
  });
  const shouldShrink = (fieldName) => {
    const fieldIndex = [
      "studentProfile.fullName.firstName",
      "studentProfile.fullName.middleName",
      "studentProfile.fullName.lastName",
      "studentProfile.department",
      "studentProfile.sem",
      "studentProfile.personalEmail",
      // "studentProfile.mentorName",
      "studentProfile.email",
      "studentProfile.usn",
      "studentProfile.dateOfBirth",
      "studentProfile.bloodGroup",
      "studentProfile.mobileNumber",
      "studentProfile.alternatePhoneNumber",
      "studentProfile.nationality",
      "studentProfile.domicile",
      "studentProfile.category",
      "studentProfile.caste",
      "studentProfile.aadharCardNumber",
      "studentProfile.admissionDate",
      "studentProfile.hostelite",
      "studentProfile.physicallyChallenged",
    ].indexOf(fieldName);
    return (
      watchedValues[fieldIndex] !== undefined &&
      watchedValues[fieldIndex] !== "" &&
      watchedValues[fieldIndex] !== null
    );
  };

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
    setValue,
  } = methods;

  const fetchStudentData = useCallback(async () => {
    try {
      let response;
      if(menteeId){
        response = await api.get(`/students/profile/${menteeId}`);
      }
      else
        response = await api.get(`/students/profile/${user._id}`);
      const { data } = response.data;

      if (data) {
        // Set each form field using the fetched data
        Object.keys(data.studentProfile).forEach((key) => {
          if (
            data.studentProfile[key] &&
            typeof data.studentProfile[key] === "object"
          ) {
            Object.keys(data.studentProfile[key]).forEach((innerKey) => {
              setValue(
                `studentProfile.${key}.${innerKey}`,
                data.studentProfile[key][innerKey]
              );
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

  const fetchMentorName = useCallback(async () => {
    if (!user || !user._id) {
      console.error("User ID not found");
      setMentorName("User ID Missing");
      return;
    }

    try {
      const response = await api.get(
        `${BASE_URL}/mentorship/mentor/${user._id}`
      );
      const mentor = response.data.mentor;

      if (mentor && mentor.name) {
        setMentorName(mentor.name);
      } else {
        setMentorName("Not Assigned");
      }
    } catch (error) {
      console.error("Error fetching mentor name:", error);
      setMentorName("Error Loading");
    }
  }, [user?._id]);

  useEffect(() => {
    fetchMentorName();
  }, [fetchMentorName]);

  const handleReset = () => {
    reset();
    setIsDataFetched(false);
  };

  const onSubmit = useCallback(
    async (formData) => {
      try {
        await api.post("/students/profile", {
          userId: user._id,
          ...formData.studentProfile,
        });
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
    },
    [enqueueSnackbar, reset]
  );

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
                InputLabelProps={{
                  shrink: shouldShrink("studentProfile.fullName.firstName"),
                }}
              />
              <RHFTextField
                name="studentProfile.fullName.middleName"
                label="Middle Name"
                fullWidth
                autoComplete="additional-name"
                InputLabelProps={{
                  shrink: shouldShrink("studentProfile.fullName.middleName"),
                }}
              />
              <RHFTextField
                name="studentProfile.fullName.lastName"
                label="Last Name"
                fullWidth
                autoComplete="family-name"
                InputLabelProps={{
                  shrink: shouldShrink("studentProfile.fullName.lastName"),
                }}
              />
              <RHFTextField
                name="studentProfile.department"
                label="Department"
                fullWidth
                required={!isDataFetched}
                autoComplete="off"
                InputLabelProps={{
                  shrink: shouldShrink("studentProfile.department"),
                }}
              />
              <RHFTextField
                name="studentProfile.sem"
                label="Semester"
                fullWidth
                required={!isDataFetched}
                autoComplete="off"
                InputLabelProps={{ shrink: shouldShrink("studentProfile.sem") }}
              />
              <RHFTextField
                name="studentProfile.personalEmail"
                label="Personal Email"
                type="email"
                fullWidth
                required={!isDataFetched}
                autoComplete="email"
                InputLabelProps={{
                  shrink: shouldShrink("studentProfile.personalEmail"),
                }}
              />

              {/* <RHFTextField
                name="mentor.name"
                label="Mentor Name"
                fullWidth
                
                value={mentorName} 
                InputLabelProps={{ shrink: true }}
              /> */}
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
                  InputLabelProps={{
                    shrink: shouldShrink("studentProfile.email"),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <RHFTextField
                  name="studentProfile.usn"
                  label="USN"
                  fullWidth
                  required={!isDataFetched}
                  autoComplete="off"
                  InputLabelProps={{
                    shrink: shouldShrink("studentProfile.usn"),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <RHFTextField
                  name="studentProfile.dateOfBirth"
                  label="Date of Birth"
                  type="date"
                  fullWidth
                  required={!isDataFetched}
                  InputLabelProps={{
                    shrink: shouldShrink("studentProfile.dateOfBirth"),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <RHFTextField
                  name="studentProfile.bloodGroup"
                  label="Blood Group"
                  fullWidth
                  autoComplete="off"
                  InputLabelProps={{
                    shrink: shouldShrink("studentProfile.bloodGroup"),
                  }}
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
                  InputLabelProps={{
                    shrink: shouldShrink("studentProfile.mobileNumber"),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <RHFTextField
                  name="studentProfile.alternatePhoneNumber"
                  label="Alternate Phone Number"
                  type="tel"
                  fullWidth
                  autoComplete="tel"
                  InputLabelProps={{
                    shrink: shouldShrink("studentProfile.alternatePhoneNumber"),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <RHFTextField
                  name="studentProfile.nationality"
                  label="Nationality"
                  fullWidth
                  required={!isDataFetched}
                  autoComplete="off"
                  InputLabelProps={{
                    shrink: shouldShrink("studentProfile.nationality"),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <RHFTextField
                  name="studentProfile.domicile"
                  label="Domicile"
                  fullWidth
                  autoComplete="off"
                  InputLabelProps={{
                    shrink: shouldShrink("studentProfile.domicile"),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <RHFTextField
                  name="studentProfile.category"
                  label="Category"
                  fullWidth
                  autoComplete="off"
                  InputLabelProps={{
                    shrink: shouldShrink("studentProfile.category"),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <RHFTextField
                  name="studentProfile.caste"
                  label="Caste"
                  fullWidth
                  autoComplete="off"
                  InputLabelProps={{
                    shrink: shouldShrink("studentProfile.caste"),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <RHFTextField
                  name="studentProfile.aadharCardNumber"
                  label="Aadhar Card Number"
                  fullWidth
                  required={!isDataFetched}
                  autoComplete="off"
                  InputLabelProps={{
                    shrink: shouldShrink("studentProfile.aadharCardNumber"),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <RHFTextField
                  name="studentProfile.admissionDate"
                  label="Admission Date"
                  type="date"
                  fullWidth
                  required={!isDataFetched}
                  InputLabelProps={{
                    shrink: shouldShrink("studentProfile.admissionDate"),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <RHFSelect
                  name="studentProfile.hostelite"
                  label="Hostelite"
                  fullWidth
                  autoComplete="off"
                  required={!isDataFetched}
                  InputLabelProps={{
                    shrink: shouldShrink("studentProfile.hostelite"),
                  }}
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
                  autoComplete="off"
                  fullWidth
                  required={!isDataFetched}
                  InputLabelProps={{
                    shrink: shouldShrink("studentProfile.physicallyChallenged"),
                  }}
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
                  <LoadingButton variant="outlined" onClick={handleReset}>
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
