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
  { label: "HOD", value: "hod" },
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
      role: editingUser?.role || "admin",
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
      if (!roleId) {
        enqueueSnackbar("Role must be selected!", { variant: "error" });
        return; // Prevent submission if roleId is empty
      }
  
      console.log("Selected Role ID:", roleId); 
  
      try {
        const userData = {
          ...formData,
          avatar,
          role: roleId,
          roleName: formData.role,
        };
        console.log(userData);
  
        if (editingUser) {
          const { password, passwordConfirm, ...updateData } = userData;
          await api.patch(`/users/${editingUser._id}`, updateData);
          enqueueSnackbar("User updated successfully!", { variant: "success" });
        } else {
          await api.post("/users", userData);
          enqueueSnackbar("User created successfully!", { variant: "success" });
          reset();
          setAvatar(null);
        }
      } catch (error) {
        console.error(error);
        enqueueSnackbar("An error occurred while processing the request", {
          variant: "error",
        });
      }
    },
    [methods, editingUser, roleId]  // Added roleId as dependency
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
          <Card sx={{ height: "500px", py: 10, px: 3, textAlign: "center" }}>
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
          <Card sx={{ p: 3, height: "500px" }}>
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
