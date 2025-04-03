// components/PowerLevelText.tsx
import React from 'react';
import { Typography } from "@mui/material";

type PowerProfileEntry = {
    level: string;
    ftp: number;
    min5: number;
};

const powerProfileReference: PowerProfileEntry[] = [
    { level: "world class", ftp: 6.4, min5: 7.6 },
    { level: "exceptional", ftp: 5.9, min5: 7.0 },
    { level: "excellent", ftp: 5.3, min5: 6.4 },
    { level: "very good", ftp: 4.8, min5: 5.7 },
    { level: "good", ftp: 4.2, min5: 5.0 },
    { level: "moderate", ftp: 3.6, min5: 4.4 },
    { level: "fair", ftp: 3.1, min5: 3.8 },
    { level: "untrained", ftp: 2.0, min5: 2.3 },
];

const getLevel = (wkg: number, type: "ftp" | "min5"): string => {
    return (
        powerProfileReference.find(p => wkg >= p[type])?.level ?? "untrained"
    );
};

type Props = {
    ftp: number;   // W/kg!
    min5: number;  // W/kg!
};

export const PowerLevelText = ({ ftp, min5 }: Props) => {
    return (
        <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>FTP (20 Minuten):</strong> {ftp} W/kg →{" "}
            <span style={{ color: "#4caf50" }}>{getLevel(ftp, "ftp")}</span>
            <br />
            <strong>5-Minuten-Leistung:</strong> {min5} W/kg →{" "}
            <span style={{ color: "#4caf50" }}>{getLevel(min5, "min5")}</span>
        </Typography>
    );
};
