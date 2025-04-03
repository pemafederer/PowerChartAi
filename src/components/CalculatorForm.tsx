
import React from "react";
import { Button, TextField } from "@mui/material";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';




interface Props {
    bodyMass: number;
    bikeMass: number;
    temperature: number;
    bodyHeight: number;
    cr: number;
    alpha: number;
    date: Date;
    onBodyMassChange: (value: number) => void;
    onBikeMassChange: (value: number) => void;
    onTemperatureChange: (value: number) => void;
    onBodyHeightChange: (value: number) => void;
    onCrChange: (value: number) => void;
    onAlphaChange: (value: number) => void;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDateChange: (value: Date) => void;
    onExport: () => void;
}

export default function CalculatorForm({
                                           bodyMass,
                                           bikeMass,
                                           temperature,
                                           bodyHeight,
                                           date,
                                           onBodyMassChange,
                                           onBikeMassChange,
                                           onBodyHeightChange,
                                           onTemperatureChange,
                                           onFileUpload,
                                           onExport,
                                            onDateChange,
                                       }: Props) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <TextField
                label="Körpergewicht (kg)"
                type="number"
                value={bodyMass}
                onChange={(e) => onBodyMassChange(parseFloat(e.target.value))}
            />
            <TextField
                label="Rad + Ausrüstung (kg)"
                type="number"
                value={bikeMass}
                onChange={(e) => onBikeMassChange(parseFloat(e.target.value))}
            />
            <TextField
                label="Körpergrösse (cm)"
                type="number"
                value={bodyHeight}
                onChange={(e) => onBodyHeightChange(parseFloat(e.target.value))}
            />
            <TextField
                label="Temperatur (Celsius)"
                type="number"
                value={temperature}
                onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
            />
            <DatePicker
                label="Datum "
                value={date}
                onChange={(newDate) => newDate && onDateChange(newDate)}
                format="dd.MM.yyyy"
            />
            <Button variant="outlined" component="label">
                TCX-Datei hochladen
                <input type="file" hidden accept=".tcx" onChange={onFileUpload} />
            </Button>
            <Button variant="contained" color="primary" onClick={onExport}>
                Export als PDF
            </Button>
        </div>
    );
}
