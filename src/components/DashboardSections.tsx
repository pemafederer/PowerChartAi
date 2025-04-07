import {Box, Grid, IconButton, Paper, Tooltip, Typography } from "@mui/material";
import React from "react"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { ZoneTable } from "./PowerZones";
import { PowerComparisonChart } from "./PowerComparisonChart";
import { PowerLevelText } from "./PowerLevelText";

export const TrainingZonesBlock = ({ ftp }: { ftp: number }) => (
    <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" gutterBottom>🚴‍♂️ Trainingszonen</Typography>
                <Tooltip title="Trainingszonen auf Basis deines FTP – z.B. Erholung, GA1, Schwelle etc." placement={"left-start"} arrow>
                    <IconButton size="small">
                        <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>
            <ZoneTable ftp={ftp} />
        </Paper>
    </Grid>
);

export const PowerProfileBlock = ({ ftpWkg, min5, label }: { ftpWkg: number, min5: number, label?: string }) => (
    <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>{label || "📊 Power Profil Analyse"}</Typography>
            <PowerComparisonChart ftp={ftpWkg} min5={min5} />
            <Box mt={3}>
                <PowerLevelText ftp={ftpWkg} min5={min5} />
            </Box>
        </Paper>
    </Grid>
);
