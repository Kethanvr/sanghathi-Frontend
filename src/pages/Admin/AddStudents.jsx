import { useState } from "react";
import { useSnackbar } from "notistack";
import { Button, Card, Stack, Typography } from "@mui/material";
import api from "../../utils/axios";
import { getUserSchema } from "../Users/UserForm";

export default function AddStudents() {
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);

  // CSV Template Download
  const handleDownloadTemplate = () => {
    const csvContent =
      "name,email,phone,role,department,sem,usn,password,passwordConfirm";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "students_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // File Processing
  const processFile = async (file) => {
    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const text = e.target.result;
        const entries =
          file.type === "application/json"
            ? JSON.parse(text)
            : text
                .split("\n")
                .slice(1)
                .map((row) => {
                  const [
                    name,
                    email,
                    phone,
                    role,
                    department,
                    sem,
                    usn,
                    password,
                    passwordConfirm,
                  ] = row.split(",");
                  return {
                    name,
                    email,
                    phone,
                    role,
                    department,
                    sem,
                    usn,
                    password,
                    passwordConfirm,
                  };
                });

        const schema = getUserSchema(false);

        // Validate entries and prepare promises for user and profile creation
        const userCreationPromises = entries.map(async (entry) => {
          try {
            await schema.validate(entry);

            // Get Role ID
            const roleResponse = await api.get(`/roles/${entry.role}`);
            const roleId = roleResponse.data._id;

            // Create User Data
            const userData = {
              name: entry.name,
              email: entry.email,
              phone: entry.phone,
              password: entry.password.trim(),
              passwordConfirm: entry.passwordConfirm.trim(),
              avatar: null,
              role: roleId,
              roleName: entry.role,
            };

            // Create User and return combined promise
            return api.post("/users", userData).then(async (userResponse) => {
                const userId = userResponse.data._id;
                console.log("user Response:", userResponse);
              
                // Create Profile Data
                const profileData = {
                  userId: userId, // Ensure userId is included
                  fullName: {
                    firstName: entry.name.split(" ")[0],
                    lastName: entry.name.split(" ").slice(1).join(" "),
                  },
                  department: entry.department,
                  sem: entry.sem,
                  usn: entry.usn,
                  email: entry.email,
                  mobileNumber: entry.phone,
                };

              // Create Profile
            const profileResponse = await api.post("/students/profile", profileData);
            const profileId = profileResponse.data.data.studentProfile._id;
            console.log("Profile Id:", profileId);

            // Update User with profileId
            await api.patch(`/users/${userId}`, { profile: profileId });


              return { success: true };
            });
          } catch (error) {
            console.error("Error processing entry:", error);
            enqueueSnackbar(
              `Error in entry ${JSON.stringify(entry)}: ${error.message}`,
              { variant: "error" }
            );
            return { success: false, error: error.message };
          }
        });

        // Execute all promises and wait for completion
        const results = await Promise.all(userCreationPromises);
        const successfulEntries = results.filter((result) => result.success).length;

        enqueueSnackbar(`${successfulEntries} students added successfully!`, {
          variant: "success",
        });
      } catch (error) {
        console.error("Error processing file:", error);
        enqueueSnackbar(error.message, { variant: "error" });
      } finally {
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      console.error("Error reading file");
      enqueueSnackbar("Error reading file", { variant: "error" });
      setIsLoading(false);
    };

    reader.readAsText(file);
  };

  

  return (
    <Card sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Typography variant="h4">Upload Student Data</Typography>

        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            onClick={handleDownloadTemplate}
            disabled={isLoading}
          >
            Download Template
          </Button>

          <Button
            variant="outlined"
            component="label"
            disabled={isLoading}
          >
            Upload Data
            <input
              type="file"
              hidden
              accept=".csv,.json"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  processFile(file);
                }
              }}
            />
          </Button>
        </Stack>

        {isLoading && <Typography>Processing file...</Typography>}
      </Stack>
    </Card>
  );
}