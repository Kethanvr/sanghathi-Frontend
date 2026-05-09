import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useSnackbar } from "notistack";
import api from "../../utils/axios";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { AuthContext } from "../../context/AuthContext";
import { Box, Grid, Card, CardContent, Stack, Button, IconButton, Typography, TextField, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { FormProvider, RHFTextField } from "../../components/hook-form";
import { useSearchParams } from "react-router-dom";
import useDraftPersistence from "../../hooks/useDraftPersistence";

const todayIso = new Date().toISOString().split("T")[0];

const buildCompetitionRow = (defaults = {}) => ({
  eventName: "",
  organizedBy: "",
  eventDate: "",
  studentNames: defaults.studentNames || "",
  studentUSNs: defaults.studentUSNs || "",
  contactNumber: defaults.contactNumber || "",
  mentorName: defaults.mentorName || "",
  semester: defaults.semester || "",
  status: "Participated",
  cashAwardOrTrophy: "NA",
  projectTitle: "",
  category: "",
  level: "State",
  eventAffiliation: "External",
  eventType: "",
  financialSupportRequested: false,
  amountSanctioned: "NA",
  relatedTo: "NA",
  proofLink: "",
});

const formatFullName = (fullName) => [fullName?.firstName, fullName?.middleName, fullName?.lastName].filter(Boolean).join(" ").trim();

const extractStudentDefaults = (profile, user) => {
  const studentProfile = profile?.studentProfile || profile || {};
  const fullName = formatFullName(studentProfile.fullName || profile?.fullName || {});

  return {
    studentNames: fullName || studentProfile.name || studentProfile.studentName || profile?.name || user?.name || "",
    studentUSNs: studentProfile.usn || studentProfile.USN || profile?.usn || profile?.USN || "",
    contactNumber: studentProfile.mobileNumber || studentProfile.phone || profile?.mobileNumber || profile?.phone || "",
    semester: studentProfile.sem || studentProfile.semester || profile?.sem || profile?.semester || user?.sem || "",
  };
};

const extractMentorName = (mentorResponse) => {
  const mentor = mentorResponse?.mentor || mentorResponse?.data?.mentor || mentorResponse?.data?.user || mentorResponse?.user || mentorResponse?.data || mentorResponse || {};
  return mentor.name || mentor.fullName || mentor.mentorName || "";
};

export default function Competition() {
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const menteeId = searchParams.get("menteeId");
  const draftScopeId = menteeId || user?._id || "default";
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [rowDefaults, setRowDefaults] = useState(buildCompetitionRow());

  const methods = useForm({ defaultValues: { competition: [buildCompetitionRow()] } });
  const { handleSubmit, reset, formState: { isSubmitting } } = methods;
  const watchedValues = useWatch({ control: methods.control });

  const { syncState, lastSavedAt } = useDraftPersistence({
    formType: "career-competition",
    scopeId: draftScopeId,
    values: watchedValues,
    reset,
    enableServerSync: Boolean(user?._id),
    enablePersistence: isDataFetched,
  });

  const { fields, append, remove } = useFieldArray({ control: methods.control, name: "competition" });

    const fetchData = useCallback(async () => {
    try {
      const targetUserId = menteeId || user._id;
      const [competitionResponse, profileResponse, mentorResponse] = await Promise.allSettled([
        api.get(`/competition-data/competition/${targetUserId}`),
        api.get(`/student-profiles/${targetUserId}`),
        api.get(`/mentorship/mentor/${targetUserId}`),
      ]);

      const profileData = profileResponse.status === "fulfilled" ? profileResponse.value.data?.data || profileResponse.value.data || {} : {};
      const mentorData = mentorResponse.status === "fulfilled" ? mentorResponse.value.data || {} : {};
      const derivedDefaults = {
        ...extractStudentDefaults(profileData, user),
        mentorName: extractMentorName(mentorData),
      };

      setRowDefaults(derivedDefaults);

      if (competitionResponse.status === "fulfilled") {
        const { data } = competitionResponse.value.data;
        if (data && Array.isArray(data.competition) && data.competition.length > 0) {
          const formatted = data.competition.map((c) => ({
            ...buildCompetitionRow(derivedDefaults),
            ...c,
            eventDate: c.eventDate ? new Date(c.eventDate).toISOString().split("T")[0] : "",
            studentNames: Array.isArray(c.studentNames) ? c.studentNames.join(", ") : c.studentNames || derivedDefaults.studentNames,
            studentUSNs: Array.isArray(c.studentUSNs) ? c.studentUSNs.join(", ") : c.studentUSNs || derivedDefaults.studentUSNs,
            contactNumber: c.contactNumber || derivedDefaults.contactNumber,
            mentorName: c.mentorName || derivedDefaults.mentorName,
            semester: c.semester || c.sem || derivedDefaults.semester,
          }));
          reset({ competition: formatted });
        } else {
          reset({ competition: [buildCompetitionRow(derivedDefaults)] });
        }
      } else {
        reset({ competition: [buildCompetitionRow(derivedDefaults)] });
      }
    } catch (err) {
      // ignore
    } finally {
      setIsDataFetched(true);
    }
  }, [menteeId, reset, user._id]);

  useEffect(() => { fetchData(); }, [fetchData]);

    const onSubmit = useCallback(async (formData) => {
      try {
        const targetUserId = menteeId || user._id;

        const payload = {
          competition: (formData.competition || []).map((item) => ({
            ...item,
            eventDate: item.eventDate || null,
            studentNames: String(item.studentNames || rowDefaults.studentNames || "").split(",").map((value) => value.trim()).filter(Boolean),
            studentUSNs: String(item.studentUSNs || rowDefaults.studentUSNs || "").split(",").map((value) => value.trim()).filter(Boolean),
            contactNumber: item.contactNumber || rowDefaults.contactNumber || "",
            mentorName: item.mentorName || rowDefaults.mentorName || "",
            sem: item.semester || rowDefaults.semester || user?.sem || "",
          })),
          userId: targetUserId,
        };

        await api.post("/competition-data/competition", payload);
        enqueueSnackbar("Competition data saved", { variant: "success" });
        await fetchData();
      } catch (err) {
        enqueueSnackbar(err?.message || "Unable to save", { variant: "error" });
      }
    }, [enqueueSnackbar, fetchData, menteeId, rowDefaults, user._id, user.name, user?.sem]);

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)} disableAutoDraft>
      <Card sx={{ p: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary">Draft: {syncState} — Last saved: {new Date(lastSavedAt || Date.now()).toLocaleString()}</Typography>
        </Stack>

        <Grid container spacing={2}>
          {fields.length > 0 ? fields.map((field, idx) => (
            <Grid item xs={12} key={field.id}>
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" sx={{ mb: 2 }}>
                    <Typography variant="subtitle1">Competition #{idx + 1}</Typography>
                    <IconButton color="error" onClick={() => remove(idx)}><DeleteIcon /></IconButton>
                  </Stack>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}><RHFTextField name={`competition[${idx}].eventName`} label="Name of the Event" fullWidth /></Grid>
                    <Grid item xs={12} sm={4}><RHFTextField name={`competition[${idx}].organizedBy`} label="Organized by" fullWidth /></Grid>
                    <Grid item xs={12} sm={4}><RHFTextField name={`competition[${idx}].eventDate`} label="Date" type="date" InputLabelProps={{ shrink: true }} inputProps={{ max: todayIso }} fullWidth /></Grid>

                    <Grid item xs={12} sm={4}><RHFTextField name={`competition[${idx}].studentNames`} label="Student Name(s) (comma separated)" fullWidth /></Grid>
                    <Grid item xs={12} sm={4}><RHFTextField name={`competition[${idx}].studentUSNs`} label="Student USN(s) (comma separated)" fullWidth /></Grid>
                    <Grid item xs={12} sm={4}><RHFTextField name={`competition[${idx}].contactNumber`} label="Contact Number" fullWidth /></Grid>

                    <Grid item xs={12} sm={4}><RHFTextField name={`competition[${idx}].mentorName`} label="Mentor / Guide" fullWidth /></Grid>
                    <Grid item xs={12} sm={4}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Status</InputLabel>
                        <Select name={`competition[${idx}].status`} label="Status" defaultValue="Participated">
                          <MenuItem value="Winner">Winner</MenuItem>
                          <MenuItem value="Runner">Runner</MenuItem>
                          <MenuItem value="Moved to First Round">Moved to First Round</MenuItem>
                          <MenuItem value="Moved to Second Round">Moved to Second Round</MenuItem>
                          <MenuItem value="Finalist">Finalist</MenuItem>
                          <MenuItem value="Participated">Participated</MenuItem>
                          <MenuItem value="Registered">Registered</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}><RHFTextField name={`competition[${idx}].cashAwardOrTrophy`} label="Cash Award/Trophy (Type NA if not applicable)" fullWidth /></Grid>
                    <Grid item xs={12}><RHFTextField name={`competition[${idx}].projectTitle`} label="Project Title / Idea Title" fullWidth /></Grid>
                    <Grid item xs={12} sm={6}><RHFTextField name={`competition[${idx}].category`} label="Category of the event" fullWidth /></Grid>
                    <Grid item xs={12} sm={6}><FormControl fullWidth size="small"><InputLabel>Level</InputLabel><Select name={`competition[${idx}].level`} label="Level" defaultValue="State"><MenuItem value="State">State</MenuItem><MenuItem value="National">National</MenuItem><MenuItem value="International">International</MenuItem></Select></FormControl></Grid>

                    <Grid item xs={12} sm={6}><FormControl fullWidth size="small"><InputLabel>Event Affiliation</InputLabel><Select name={`competition[${idx}].eventAffiliation`} label="Event Affiliation" defaultValue="External"><MenuItem value="Internal">Internal Event (Within CMRIT)</MenuItem><MenuItem value="External">External Event</MenuItem></Select></FormControl></Grid>
                    <Grid item xs={12} sm={6}><RHFTextField name={`competition[${idx}].eventType`} label="Event Type (Hackathon / Project Contest / Other)" fullWidth /></Grid>

                    <Grid item xs={12} sm={6}><FormControl fullWidth size="small"><InputLabel>Financial Support Requested</InputLabel><Select name={`competition[${idx}].financialSupportRequested`} label="Financial Support Requested" defaultValue={false}><MenuItem value={true}>Requested</MenuItem><MenuItem value={false}>NA</MenuItem></Select></FormControl></Grid>
                    <Grid item xs={12} sm={6}><RHFTextField name={`competition[${idx}].amountSanctioned`} label="Amount Sanctioned / NA" fullWidth /></Grid>

                    <Grid item xs={12} sm={6}><FormControl fullWidth size="small"><InputLabel>Related To</InputLabel><Select name={`competition[${idx}].relatedTo`} label="Related To" defaultValue="NA"><MenuItem value="I & E">I & E</MenuItem><MenuItem value="CoE">CoE</MenuItem><MenuItem value="DRC">DRC</MenuItem><MenuItem value="NA">NA</MenuItem></Select></FormControl></Grid>
                    <Grid item xs={12} sm={6}><RHFTextField name={`competition[${idx}].proofLink`} label="Proof / Certificate Link" fullWidth /></Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )) : (
            <Grid item xs={12}><Box sx={{ py: 4, textAlign: "center" }}><Typography color="text.secondary">No competition records yet.</Typography></Box></Grid>
          )}

          <Grid item xs={12}><Button variant="contained" onClick={() => append(buildCompetitionRow(rowDefaults))}>Add Row</Button></Grid>

          <Grid item xs={12}><Stack direction="row" spacing={2} justifyContent="flex-end"><LoadingButton type="submit" variant="contained" loading={isSubmitting}>Save</LoadingButton></Stack></Grid>
        </Grid>
      </Card>
    </FormProvider>
  );
}
