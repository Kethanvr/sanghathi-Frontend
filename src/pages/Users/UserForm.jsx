import { useState, useEffect, useCallback } from "react";
import * as Yup from "yup";
import { useSnackbar } from "notistack";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import api from "../../utils/axios"; // axios instance

// @mui
import { Box, Grid, Card, Stack, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import Divider from "@mui/material/Divider";

// components
import {
  FormProvider,
  RHFSwitch,
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
    sem: Yup.string().required("Sem is required"),
    role: Yup.string().required("Role is required"),
    usn: Yup.string().required("USN is required"),
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

export default function UserForm({ editingUser }) {
  const { enqueueSnackbar } = useSnackbar();
  const [avatar, setAvatar] = useState(null);
  const [roleId, setRoleId] = useState("");

  // Form initialization
  const methods = useForm({
    resolver: yupResolver(getUserSchema(editingUser)),
    defaultValues: {
      name: editingUser?.name || "",
      email: editingUser?.email || "",
      phone: editingUser?.phone || "",
      password: "",
      passwordConfirm: "",
      department: "",
      sem: "",
      role: editingUser?.role || "student",
      usn: "",
    },
  });

  const { setValue, handleSubmit, reset, formState: { isSubmitting } } = methods;

  // Fetch roleId based on role selection
  useEffect(() => {
    const fetchRoleId = async () => {
      try {
        const selectedRole = methods.watch("role"); // Watch for role changes
      if (!selectedRole) return;
        const { data } = await api.get(`/roles/${methods.getValues("role")}`);
        setRoleId(data._id);  // Save the role ObjectId
      } catch (error) {
        console.error("Failed to fetch role ID", error);
      }
    };
    if (methods.getValues("role")) {
      fetchRoleId();
    }
  }, [methods.watch("role")]);

  // Handle form submission
  const onSubmit = useCallback(
    async (formData) => {
      console.log("Form data:", formData);
      if (!roleId) {
        enqueueSnackbar("Role must be selected!", { variant: "error" });
        return; // Prevent submission if roleId is empty
      }
  
      console.log("Selected Role ID:", roleId); 
  
      try {
        // Split the name into first and last name
        const nameParts = formData.name.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';
  
        // Create profile first
        const profileData = {
          fullName: {
            firstName,
            lastName
          },
          department: formData.department,
          sem: formData.sem,
          usn: formData.usn,
          email: formData.email,
          mobileNumber: formData.phone
        };
  
        console.log('Creating profile with data:', profileData);
        
        const profileResponse = await api.post("/students/profile", profileData);
        console.log('Profile response:', profileResponse.data);
        
        if (!profileResponse.data?.data?.studentProfile?._id) {
          throw new Error('Profile creation failed');
        }
  
        const profileId = profileResponse.data.data.studentProfile._id;
        console.log('Profile ID', profileId);
  
        // Create user with profile reference
        const userData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          passwordConfirm: formData.passwordConfirm,
          avatar,
          role: roleId,
          roleName: formData.role,
          profile: profileId
        };
  
        console.log('Creating user with data:', userData);
  
        try {
          // Create user
          const userResponse = await api.post("/users", {
            ...userData,
            profile: profileId
          });
          
          console.log('User Response to create User:', userResponse.data);
          if (userResponse.data._id) {
            // Update profile with user ID
            await api.patch(`/students/profile/${profileId}`, {
              userId: userResponse.data._id,
            });
          }
  
          enqueueSnackbar("User created successfully!", { variant: "success" });
          reset();
          setAvatar(null);
        } catch (userError) {
          // If user creation fails, delete the profile
          await api.delete(`/students/profile/${profileId}`);
          throw userError;
        }
        
      } catch (error) {
        console.error('Detailed error:', error.response?.data);
        enqueueSnackbar(
          error.response?.data?.message || 
          error.message || 
          "An error occurred while processing the request", 
          { variant: "error" }
        );
      }
    },
    [methods, roleId, avatar, reset, enqueueSnackbar]
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

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ py: 10, px: 3, textAlign: "center" }}>
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
          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              <RHFTextField
                name="name"
                label="Name"
                required
                fullWidth
                autoComplete="given-name"
              />
              <RHFTextField
                name="email"
                label="Email"
                type="email"
                required
                fullWidth
                autoComplete="email"
              />
              <RHFTextField
                name="department"
                label="Department"
                required
                fullWidth
              />
              <RHFTextField
                name="sem"
                label="sem"
                required
                fullWidth
              />
              <RHFTextField
                name="usn"
                label="USN"
                required
                fullWidth
              />
              <RHFTextField
                name="phone"
                label="Phone"
                type="tel"
                required
                fullWidth
                autoComplete="tel"
              />
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
                  rowGap: 5,
                  columnGap: 2,
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
                  required={!!editingUser}
                  fullWidth
                  autoComplete="new-password"
                  disabled={!!editingUser}
                />
                <RHFTextField
                  name="passwordConfirm"
                  label="Confirm Password"
                  type="password"
                  required={!!editingUser}
                  fullWidth
                  autoComplete="new-password"
                  disabled={!!editingUser}
                />
              </Box>
            </Stack>
            <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
              <Box display="flex" gap={1}>
                {!editingUser && (
                  <LoadingButton
                    variant="outlined"
                    onClick={() => {
                      reset({
                        name: "",
                        email: "",
                        phone: "",
                        password: "",
                        passwordConfirm: "",
                        role: "admin",
                        department: "",
                        sem: "",
                        usn: "",
                      });
                      setAvatar(null);
                    }}
                  >
                    Reset
                  </LoadingButton>
                )}
                <LoadingButton
                  type="submit"
                  variant="contained"
                  loading={isSubmitting}
                >
                  {editingUser ? "Update User" : "Create User"}
                </LoadingButton>
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
export {getUserSchema};