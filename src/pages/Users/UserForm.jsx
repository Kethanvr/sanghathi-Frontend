import { useState, useEffect, useCallback } from "react";
import * as Yup from "yup";
import { useSnackbar } from "notistack";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import api from "../../utils/axios"; // axios instance

// @mui
import {
  Box,
  Grid,
  Card,
  Stack,
  Typography,
  Divider,
  Button,
  useTheme,
  alpha,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";

import logger from "../../utils/logger.js";
// components
import {
  FormProvider,
  RHFSelect,
  RHFTextField,
  RHFUploadAvatar,
} from "../../components/hook-form";

// validation schema
const getUserSchema = (editingUser) => {
  const baseSchema = {
    name: Yup.string().required("Name is required"),
    email: Yup.string().email("Email is invalid").required("Email is required"),
    phone: Yup.string().required("Phone is required"),
    department: Yup.string().required("Department is required"),
    sem: Yup.string(),
    usn: Yup.string().transform((value) => value.toUpperCase()),
    role: Yup.string().required("Role is required"),
  };

  const passwordSchema = {
    password: Yup.string().required("Password is required"),
    passwordConfirm: Yup.string()
      .required("Please confirm your password")
      .oneOf([Yup.ref("password"), null], "Passwords must match"),
  };

  return Yup.object().shape(
    editingUser
      ? baseSchema
      : {
          ...baseSchema,
          ...passwordSchema,
        }
  );
};

const options = [
  { label: "Admin", value: "admin" },
  { label: "Faculty", value: "faculty" },
  { label: "Student", value: "student" },
  // { label: "HOD", value: "hod" },
];

const DEFAULT_DEPARTMENT_OPTIONS = [
  "CSE",
  "ISE",
  "AIML",
  "CSE(AIML)",
  "AIDS",
  "CS(DS)",
  "ECE",
  "MBA",
  "MCA",
];

const semesterOptions = Array.from({ length: 8 }, (_, i) => i + 1);
const DEFAULT_COLLEGE_CODE = "CMRIT";

export default function UserForm({ editingUser }) {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const [avatar, setAvatar] = useState(null);
  const [roleId, setRoleId] = useState("");
  const [departments, setDepartments] = useState(DEFAULT_DEPARTMENT_OPTIONS);

  // Form initialization
  const methods = useForm({
    resolver: yupResolver(getUserSchema(editingUser)),
    defaultValues: {
      name: editingUser?.name || "",
      email: editingUser?.email || "",
      phone: editingUser?.phone || "",
      password: "",
      passwordConfirm: "",
      department: editingUser?.department || "",
      sem: editingUser?.sem || "",
      role: editingUser?.roleName || "student",
      usn: editingUser?.usn || "",
    },
  });

  const {
    setValue,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  // Sync default values when editingUser changes
  useEffect(() => {
    if (editingUser) {
      reset({
        name: editingUser.name || "",
        email: editingUser.email || "",
        phone: editingUser.phone || "",
        department: editingUser.department || "",
        sem: editingUser.sem || "",
        role: editingUser.roleName || "student",
        usn: editingUser.usn || "",
      });
    }
  }, [editingUser, reset]);

  // Remove the role ID fetching effect
  useEffect(() => {
    const fetchRoleId = async () => {
      const currentRole = methods.getValues("role");
      if (!currentRole) return;
      
      try {
        const response = await api.get(`/roles/${currentRole}`);
        setRoleId(response.data._id); // Store the ObjectId
      } catch (error) {
        logger.error("Failed to fetch role ID:", error);
      }
    };

    fetchRoleId();
  }, [methods.watch("role")]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await api.get("/departments", {
          params: { collegeCode: DEFAULT_COLLEGE_CODE, status: "active" },
        });
        const options = response.data?.data?.departments || [];
        if (options.length) {
          setDepartments(options.map((dept) => dept.name));
        }
      } catch (error) {
        logger.warn("Failed to load departments, using defaults", error);
      }
    };

    fetchDepartments();
  }, []);

  //handle form submission
  const onSubmit = useCallback(
    async (formData) => {
      logger.info("Form data:", formData);
      try {
        // Split the name into first and last name
        const nameParts = formData.name.trim().split(/\s+/);
        const firstName = nameParts[0];
        const lastName =
          nameParts.length > 1 ? nameParts.slice(1).join(" ") : "N/A";

        const userData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: roleId,
          roleName: formData.role,
          collegeCode: DEFAULT_COLLEGE_CODE,
          department: formData.department,
        };

        if (!editingUser) {
          userData.password = formData.password;
          userData.passwordConfirm = formData.passwordConfirm;
        }

        if (avatar && (typeof avatar === "string" || avatar.name)) {
          userData.avatar = typeof avatar === "string" ? avatar : avatar.name;
        }

        let userResponse;
        if (editingUser) {
          logger.info("Updating user with data:", userData);
          userResponse = await api.patch(`/users/${editingUser._id}`, userData);
        } else {
          logger.info("Creating user with data:", userData);
          userResponse = await api.post("/users", userData);
        }

        const userId = editingUser ? editingUser._id : userResponse.data._id;
        const profileModel = formData.role === "student" ? "student" : "faculty";

        if (formData.role === "student") {
          const profileData = {
            userId,
            fullName: { firstName, lastName },
            department: formData.department,
            sem: formData.sem,
            usn: formData.usn,
            email: formData.email,
            mobileNumber: formData.phone,
            collegeCode: DEFAULT_COLLEGE_CODE,
          };

          if (editingUser && editingUser.profile) {
            await api.patch(`/students/profile/${userId}`, profileData);
          } else {
            const profileResponse = await api.post("/students/profile", profileData);
            const profileId = profileResponse.data?.data?.studentProfile?._id;
            if (profileId) {
              await api.patch(`/users/${userId}`, { profile: profileId });
            }
          }
        } else {
          const profileData = {
            userId,
            fullName: { firstName, lastName },
            department: formData.department,
            email: formData.email,
            mobileNumber: formData.phone,
            collegeCode: DEFAULT_COLLEGE_CODE,
          };

          if (editingUser && editingUser.profile) {
            await api.patch(`/faculty/profile/${userId}`, profileData);
          } else {
            const profileResponse = await api.post("/faculty/profile", profileData);
            const profileId = profileResponse.data?.data?.facultyProfile?._id;
            if (profileId) {
              await api.patch(`/users/${userId}`, { profile: profileId });
            }
          }
        }
        
        enqueueSnackbar(`User ${editingUser ? "updated" : "created"} successfully!`, { variant: "success" });
        if (!editingUser) reset();
      } catch (error) {
        logger.error("Detailed error:", error.response?.data);
        enqueueSnackbar(
          error.response?.data?.message ||
            error.message ||
            "An error occurred while processing the request",
          { variant: "error" }
        );
      }
    },
    [methods, avatar, reset, enqueueSnackbar, editingUser, roleId]
  );

  // Handle avatar drop
  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        setValue(
          "avatar",
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        );
        setAvatar(file);
      }
    },
    [setValue, setAvatar]
  );

  const handleReset = () => {
    reset({
      name: "",
      email: "",
      phone: "",
      password: "",
      passwordConfirm: "",
      role: "student",
      department: "",
      sem: "",
      usn: "",
    });
    setAvatar(null);
  };

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Card sx={{ boxShadow: 1 }}>
        <Grid
          container
          spacing={3}
          sx={{ p: 3, backgroundColor: theme.palette.background.default }}
        >
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                py: 10,
                px: 3,
                textAlign: "center",
                height: "100%",
                backgroundColor: theme.palette.background.paper,
                boxShadow: theme.shadows[2],
              }}
            >
              <RHFUploadAvatar
                name="avatar"
                accept="image/*"
                maxSize={3145728}
                onDrop={handleDrop}
                helperText={
                  <Typography
                    variant="caption"
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
                  </Typography>
                }
              />
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card
              sx={{
                p: 3,
                height: "100%",
                backgroundColor: theme.palette.background.paper,
                boxShadow: theme.shadows[2],
              }}
            >
              <Stack spacing={3}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  Basic Information
                </Typography>

                <RHFTextField
                  name="name"
                  label="Full Name"
                  required
                  fullWidth
                  autoComplete="given-name"
                />

                <RHFTextField
                  name="email"
                  label="Email Address"
                  type="email"
                  required
                  fullWidth
                  autoComplete="email"
                />

                <RHFTextField
                  name="phone"
                  label="Phone Number"
                  type="tel"
                  required
                  fullWidth
                  autoComplete="tel"
                />

                <Divider />

                <Typography variant="subtitle1">
                  Academic Information
                </Typography>

                <RHFSelect
                  name="department"
                  label="Department"
                  required
                  fullWidth
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </RHFSelect>

                <Box
                  sx={{
                    display: "grid",
                    columnGap: 2,
                    rowGap: 3,
                    gridTemplateColumns: {
                      xs: "repeat(1, 1fr)",
                      sm: "repeat(2, 1fr)",
                    },
                  }}
                >
                  <RHFSelect name="sem" label="Semester" fullWidth>
                    <option value="">Select Semester</option>
                    {semesterOptions.map((sem) => (
                      <option key={sem} value={sem.toString()}>
                        {sem}
                      </option>
                    ))}
                  </RHFSelect>
                  <RHFTextField name="usn" label="USN" fullWidth />
                </Box>

                <Divider />

                <Typography variant="subtitle1">Account Settings</Typography>

                <RHFSelect name="role" label="Role" fullWidth required>
                  {options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </RHFSelect>

                <Box
                  sx={{
                    display: "grid",
                    columnGap: 2,
                    rowGap: 3,
                    gridTemplateColumns: {
                      xs: "repeat(1, 1fr)",
                      sm: "repeat(2, 1fr)",
                    },
                  }}
                >
                  <RHFTextField
                    name="password"
                    label="Password"
                    type="password"
                    required={!editingUser}
                    fullWidth
                    autoComplete="new-password"
                    disabled={!!editingUser}
                  />
                  <RHFTextField
                    name="passwordConfirm"
                    label="Confirm Password"
                    type="password"
                    required={!editingUser}
                    fullWidth
                    autoComplete="new-password"
                    disabled={!!editingUser}
                  />
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    mt: 2,
                    gap: 2,
                  }}
                >
                  {!editingUser && (
                    <Button
                      variant="outlined"
                      color="inherit"
                      onClick={handleReset}
                    >
                      Reset
                    </Button>
                  )}
                  <LoadingButton
                    type="submit"
                    variant="contained"
                    color="info"
                    loading={isSubmitting}
                  >
                    {editingUser ? "Update" : "Save"}
                  </LoadingButton>
                </Box>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Card>
    </FormProvider>
  );
}

export { getUserSchema };