import React, { useEffect, useState, useCallback, useContext, useMemo } from "react";
import { useSnackbar } from "notistack";
import api from "../../utils/axios";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { AuthContext } from "../../context/AuthContext";
import { Box, Grid, Card, Stack, Button, IconButton, Typography, TextField, Chip } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { FormProvider, RHFTextField } from "../../components/hook-form";
import { useSearchParams } from "react-router-dom";
import useDraftPersistence from "../../hooks/useDraftPersistence";


import logger from "../../utils/logger.js";
export default function Mooc() {
  const { enqueueSnackbar } = useSnackbar();
    const { user } = useContext(AuthContext);
    const [searchParams] = useSearchParams();
    const menteeId = searchParams.get('menteeId');
    const [isDataFetched, setIsDataFetched] = useState(false);
    logger.info("User : ",user);
    logger.info("id: ",menteeId);

    const draftScopeId = useMemo(
      () => menteeId || user?._id || "default",
      [menteeId, user?._id]
    );

    const methods = useForm({
      defaultValues: {
        mooc: [{ portal: "", title: "", semester: "", startDate: null, completedDate: null, score: null, certificateLink: "" }],
      },
    });

  const { handleSubmit, reset, formState: { isSubmitting } } = methods;
    const watchedValues = useWatch({ control: methods.control });

    const { syncState, lastSavedAt } = useDraftPersistence({
      formType: "career-mooc",
      scopeId: draftScopeId,
      values: watchedValues,
      reset,
      enableServerSync: Boolean(user?._id),
      enablePersistence: isDataFetched,
    });

    const formatDateTime = (value) => {
      if (!value) return "Not saved yet";
      const asDate = new Date(value);
      if (Number.isNaN(asDate.getTime())) return "Not saved yet";
      return asDate.toLocaleString();
    };

    const { fields, append, remove } = useFieldArray({
      control: methods.control,
      name: "mooc",
    });

    const fetchMooc = useCallback(async () => {
      try {
        const existingLocalDraft = localStorage.getItem(
          `sanghathi:draft:career-mooc:${draftScopeId}`
        );
        if (existingLocalDraft && existingLocalDraft !== "{}" && !menteeId) {
          // If we have a local draft and are not viewing another mentee's profile, skip fetching to allow draft resume
          // We can let the user discard drafts if they want to. But fetching right now blocks DB data if cache exists.
          // setIsDataFetched(true);
          // return;
        }

        let response;
        if(menteeId)
          response = await api.get(`/mooc-data/mooc/${menteeId}`);
        else
          response = await api.get(`/mooc-data/mooc/${user._id}`);
        const { data } = response.data;
    
        if (data && Array.isArray(data.mooc)) {
          const formattedMooc = data.mooc.map((mooc) => {
            let parsedStartDate = "";
            let parsedCompletedDate = "";

            try {
              if (mooc.startDate) {
                const sDate = new Date(mooc.startDate);
                if (!Number.isNaN(sDate.getTime())) {
                  parsedStartDate = sDate.toISOString().split("T")[0];
                } else {
                  parsedStartDate = mooc.startDate;
                }
              }
            } catch (e) {
              parsedStartDate = mooc.startDate || "";
            }

            try {
              if (mooc.completedDate) {
                const cDate = new Date(mooc.completedDate);
                if (!Number.isNaN(cDate.getTime())) {
                  parsedCompletedDate = cDate.toISOString().split("T")[0];
                } else {
                  parsedCompletedDate = mooc.completedDate;
                }
              }
            } catch (e) {
              parsedCompletedDate = mooc.completedDate || "";
            }

            return {
              ...mooc,
              semester: mooc.semester || "",
              startDate: parsedStartDate,
              completedDate: parsedCompletedDate,
            };
          });
          reset({ mooc: formattedMooc });
        } else {
          logger.warn("No mooc data found for this user");
          reset({ mooc: [{ portal: "", title: "", semester: "", startDate: null, completedDate: null, score: null, certificateLink: "" }] });
        }
      } catch (error) {
        logger.info("Error fetching mooc data:", error);
      } finally {
        setIsDataFetched(true);
      }
    }, [draftScopeId, user._id, reset, enqueueSnackbar, menteeId]);

    useEffect(() => {
      fetchMooc();
    }, [fetchMooc]);
  
    const handleReset = () => {
      reset();
    };
  
    const onSubmit = useCallback(
      async (formData) => {
        try {
          await api.post("/mooc-data/mooc", { mooc: formData.mooc, userId: user._id });
          enqueueSnackbar("Mooc data updated successfully!", {
            variant: "success",
          });
          await fetchMooc();
        } catch (error) {
          logger.error(error);
          enqueueSnackbar("An error occurred while processing the request", {
            variant: "error",
          });
        }
      },
      [enqueueSnackbar, fetchMooc, user._id]
    );

  return (
    <FormProvider
      methods={methods}
      onSubmit={handleSubmit(onSubmit)}
      disableAutoDraft
    >
          <Card sx={{ p: 3 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 2 }}>
              <Chip size="small" variant="outlined" label={`Draft: ${syncState}`} />
              <Typography variant="caption" color="text.secondary" sx={{ alignSelf: "center" }}>
                Last saved: {formatDateTime(lastSavedAt)}
              </Typography>
            </Stack>

            <Grid container spacing={2}>
              {/** Group entries by semester for display */}
              {(() => {
                const groups = {};
                fields.forEach((item, idx) => {
                  const sem = item.semester || "Unspecified";
                  if (!groups[sem]) groups[sem] = [];
                  groups[sem].push({ item, idx });
                });

                return Object.keys(groups).map((sem) => (
                  <Box key={sem} sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>{sem === "" || sem === "Unspecified" ? "Unspecified Semester" : `Semester: ${sem}`}</Typography>
                    {groups[sem].map(({ item, idx }) => (
                      <Grid container spacing={2} key={item.id} alignItems="center" sx={{ mb: 1, mt: 1 }}>
                        <Grid item xs={1}>
                          <TextField disabled value={idx + 1} label="Sl. No." variant="outlined" />
                        </Grid>
                        <Grid item xs={2}>
                          <RHFTextField name={`mooc[${idx}].semester`} label="Semester" fullWidth />
                        </Grid>
                        <Grid item xs={3}>
                          <RHFTextField name={`mooc[${idx}].portal`} label="Course Portal" fullWidth />
                        </Grid>
                        <Grid item xs={3}>
                          <RHFTextField name={`mooc[${idx}].title`} label="Mooc Title" fullWidth />
                        </Grid>
                        <Grid item xs={2}>
                          <RHFTextField name={`mooc[${idx}].startDate`} label="Start Date" type="date" InputLabelProps={{ shrink: true }} fullWidth />
                        </Grid>
                        <Grid item xs={2}>
                          <RHFTextField name={`mooc[${idx}].completedDate`} label="Completed Date" type="date" InputLabelProps={{ shrink: true }} fullWidth />
                        </Grid>
                        <Grid item xs={2}>
                          <RHFTextField name={`mooc[${idx}].score`} label="Score" fullWidth />
                        </Grid>
                        <Grid item xs={4}>
                          <RHFTextField name={`mooc[${idx}].certificateLink`} label="Certificate Link" fullWidth />
                        </Grid>
                        <Grid item xs={1}>
                          <IconButton color="error" onClick={() => remove(idx)} sx={{ mt: 1 }}>
                            <DeleteIcon />
                          </IconButton>
                        </Grid>
                      </Grid>
                    ))}
                    <Box sx={{ textAlign: 'right', mb: 2 }}>
                      <Button size="small" variant="outlined" onClick={() => append({ portal: "", title: "", semester: sem === 'Unspecified' ? '' : sem, startDate: null, completedDate: null, score: null, certificateLink: "" })}>Add Row to this semester</Button>
                    </Box>
                  </Box>
                ));
              })()}
                <Grid item xs={12}>
                  <Button 
                    variant="contained" 
                    onClick={() => append({ portal: "", title: "", startDate: null, completedDate: null, score: null, certificateLink: "" })} 
                    sx={{ mt: 2, display: "block", mx: "auto" }}>
                    Add Row
                  </Button>
                </Grid>
        <Grid item xs={12}>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Box display="flex" gap={1}>
                {import.meta.env.MODE === "development" && (
                  <LoadingButton 
                  variant="outlined" 
                  onClick={handleReset}>
                    Reset
                  </LoadingButton>
                )}
                <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                  Save
                </LoadingButton>
              </Box>
            </Stack>
        </Grid>
      </Grid>
    </Card>
  </FormProvider>
  );
}
