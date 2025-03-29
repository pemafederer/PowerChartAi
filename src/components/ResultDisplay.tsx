// src/components/ResultsDisplay.tsx
import React from "react";
import { Typography, Divider } from "@mui/material";

interface Props {
    measured5: number | null;
    measured20: number | null;
    estimated5: number | null;
    estimated20: number | null;
    bodyMass: number;
    distance5?: number;
    distance20?: number;
}

export default function ResultsDisplay({
                                           measured5,
                                           measured20,
                                           estimated5,
                                           estimated20,
                                           bodyMass,
                                           distance5,
                                           distance20,
                                       }: Props) {
    const renderPowerRow = (
        label: string,
        measured: number | null,
        estimated: number | null,
        distance?: number
    ) => (
        <>
            <Typography variant="subtitle1" fontWeight="bold">{label}</Typography>
            <Typography>
                Gemessen: {measured?.toFixed(0) || "-"} W ({measured ? (measured / bodyMass).toFixed(1) : "-"} W/kg)
            </Typography>
            <Typography>
                Nachberechnet: {estimated?.toFixed(0) || "-"} W ({estimated ? (estimated / bodyMass).toFixed(1) : "-"} W/kg)
            </Typography>
            {distance !== undefined && (
                <Typography variant="body2" color="textSecondary">
                    Distanz: {distance.toFixed(1)} m
                </Typography>
            )}
            <Divider style={{ margin: "1rem 0" }} />
        </>
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {renderPowerRow("5min Leistung", measured5, estimated5, distance5)}
            {renderPowerRow("20min Leistung", measured20, estimated20, distance20)}
        </div>
    );
}
