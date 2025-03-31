import {
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Typography, Box
} from "@mui/material";

type ZoneTableProps = {
    ftp: number;
};

export function ZoneTable({ ftp }: ZoneTableProps) {
    const ftpZones = [
        { label: 1, description: "Aktive Regeneration", from: 0, to: 0.55 },
        { label: 2, description: "GA1", from: 0.56, to: 0.76 },
        { label: 3, description: "GA2", from: 0.76, to: 0.90 },
        { label: 4, description: "FTP", from: 0.91, to: 1.05 },
        { label: 5, description: "VO2max", from: 1.06, to: 1.2 },
        { label: 6, description: "Anaerobe Kapazität", from: 1.21, to: 1.5 },
        { label: 7, description: "Neuromuskuläre Leistung", from: 1.51, to: null }, // "max"
    ];

    return (
        <Box>
            <Typography variant="h5" gutterBottom>🚴‍♂️ Trainingzones (Power)</Typography>
            <TableContainer component={Paper} sx={{ mb: 4 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Label</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>% of FTP</TableCell>
                            <TableCell>Watt</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {ftpZones.map((zone) => {
                            const fromWatt = Math.round(zone.from * ftp);
                            const toWatt = zone.to !== null ? Math.round(zone.to * ftp) : null;

                            return (
                                <TableRow key={zone.label}>
                                    <TableCell>{zone.label}</TableCell>
                                    <TableCell>{zone.description}</TableCell>
                                    <TableCell>
                                        {zone.to
                                            ? `${Math.round(zone.from * 100)} – ${Math.round(zone.to * 100)}%`
                                            : `> ${Math.round(zone.from * 100)}%`}
                                    </TableCell>
                                    <TableCell>
                                        {toWatt ? `${fromWatt} – ${toWatt} W` : `> ${fromWatt} W`}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        <TableRow>
                            <TableCell colSpan={3}><strong>FTP (Functional Threshold Power)</strong></TableCell>
                            <TableCell><strong>{Math.round(ftp)} W</strong></TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
