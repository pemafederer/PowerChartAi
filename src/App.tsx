
import React, { useState , useEffect} from "react";
import {AppBar, Box, Button, Container, Grid, Paper, Toolbar, Typography} from "@mui/material";
import CalculatorForm from "./components/CalculatorForm";
import ResultsDisplay from "./components/ResultDisplay";
import {calculatePower} from "./components/CalculatePower";
import {getElevationGainFromGoogle } from "./components/ElevationAPI";
import { getDistanceFromGoogleProxy} from "./components/ElevationAPI";
import {PowerComparisonChart} from "./components/PowerComparisonChart";
import {PowerLevelText} from "./components/PowerLevelText";
import {ZoneTable} from "./components/PowerZones";
import AuthForm from "./components/Authform";
import {supabase} from "./components/SupabaseClient";
import {Session} from '@supabase/supabase-js';


export default function App() {
    const [bodyMass, setBodyMass] = useState(67.5);
    const [bikeMass, setBikeMass] = useState(12);
    const [temperature, setTemperature] = useState(1);
    const [bodyHeight, setBodyHeight] = useState(182);

    const [cr, setCr] = useState(0.007);
    const [measured5, setMeasured5] = useState<number | null>(null);
    const [measured20, setMeasured20] = useState<number | null>(null);
    const [estimated5, setEstimated5] = useState<number | null>(null);
    const [estimated20, setEstimated20] = useState<number | null>(null);
    const [ftp, setFtp] = useState<number | null>(null);
    const [ftpWkg, setFtpWkg] = useState<number | null>(null);
    const [vo2max, setVo2max] = useState<number | null>(null);

    const [session, setSession] = useState<Session | null>(null);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setSession(null);
    }
    const handleSavePerformance = async () => {
        if (!session || !ftp || !ftpWkg || !vo2max || !estimated5) {
            alert("Bitte lade erst eine Datei hoch.");
            return;
        }

        const { error } = await supabase.from("performance_logs").insert([
            {
                user_id: session.user.id,

                ftp: ftp,
                ftp_wkg: ftpWkg,
                vo2max: vo2max,
                power_5min: estimated5,
                body_mass: bodyMass,
            },
        ]);

        if (error) {
            console.error("Fehler beim Speichern:", error.message);
            alert("Fehler beim Speichern der Leistung.");
        } else {
            alert("Leistung erfolgreich gespeichert ✅");
        }
    };



    useEffect(() => {
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
        };

        getSession();

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    if (!session) {
        return <AuthForm />;
    }

    const downsampleCoords = (coords: [number, number][], maxPoints = 99): [number, number][] => {
        if (coords.length <= maxPoints) return coords;

        const step = Math.ceil(coords.length / maxPoints);
        return coords.filter((_, idx) => idx % step === 0);
    };



    const handleTcxUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const text = await file.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, "application/xml");
        const trackpoints = Array.from(xml.getElementsByTagName("Trackpoint"));

        type TrackPoint = {
            time: Date;
            power: number;
            lat?: number;
            lon?: number;
            altitude?: number;
            distance?: number;
        };

        const powerSeries: TrackPoint[] = [];

        for (const pt of trackpoints) {
            const timeNode = pt.getElementsByTagName("Time")[0];
            const powerNode = Array.from(pt.getElementsByTagName("*")).find((el) => el.tagName.toLowerCase().includes("watts"));
            const altitudeNode = pt.getElementsByTagName("AltitudeMeters")[0];
            const latNode = pt.getElementsByTagName("Position")[0]?.getElementsByTagName("LatitudeDegrees")[0];
            const lonNode = pt.getElementsByTagName("Position")[0]?.getElementsByTagName("LongitudeDegrees")[0];
            const distanceNode = pt.getElementsByTagName("DistanceMeters")[0]; // ← add this


            if (timeNode && powerNode) {
                powerSeries.push({
                    time: new Date(timeNode.textContent || ""),
                    power: parseFloat(powerNode.textContent || "0"),
                    lat: latNode ? parseFloat(latNode.textContent || "0") : undefined,
                    lon: lonNode ? parseFloat(lonNode.textContent || "0") : undefined,
                    altitude: altitudeNode ? parseFloat(altitudeNode.textContent || "0") : undefined,
                    distance: distanceNode ? parseFloat(distanceNode.textContent || "0") : undefined, // ← add this
                });
            }
        }
        const intervalData = (powerSeries: TrackPoint[], durationMin: number) => {
            const msWindow = durationMin * 60 * 1000;
            let bestAvg = 0,
                bestStartIdx = 0,
                bestEndIdx = 0;

            for (let i = 0; i < powerSeries.length; i++) {
                let sum = 0,
                    count = 0;
                const start = powerSeries[i].time.getTime();
                for (let j = i; j < powerSeries.length; j++) {
                    if (powerSeries[j].time.getTime() - start <= msWindow) {
                        sum += powerSeries[j].power;
                        count++;
                    } else break;
                }
                const avg = sum / count;
                if (avg > bestAvg) {
                    bestAvg = avg;
                    bestStartIdx = i;
                    bestEndIdx = i + count - 1;
                }
            }
            return { avgPower: bestAvg, startIdx: bestStartIdx, endIdx: bestEndIdx };
        };

        const safeGradientRadians = (elevationGain: number, distance: number): number => {
            const safeDistance = distance !== 0 ? distance : 0.01;  // ensure never zero
            const ratio = elevationGain / safeDistance;

            // Clamp value for safe asin calculation
            const safeRatio = Math.max(-1, Math.min(1, ratio));

            return Math.asin(safeRatio);
        };

        const getElevationStartpoint = (elevationGain: number, startpoint: TrackPoint[], startIdx: number) => {
            return Math.floor(elevationGain / 2) + (startpoint[startIdx].altitude ?? 0);
        }

        const interval5 = intervalData(powerSeries, 5);
        const interval20 = intervalData(powerSeries, 20);


        const coords5Raw = powerSeries
            .slice(interval5.startIdx, interval5.endIdx + 1)
            .filter((p) => p.lat !== undefined && p.lon !== undefined)
            .map((p) => [p.lon!, p.lat!] as [number, number]);

        const coords20Raw = powerSeries
            .slice(interval20.startIdx, interval20.endIdx + 1)
            .filter((p) => p.lat !== undefined && p.lon !== undefined)
            .map((p) => [p.lon!, p.lat!] as [number, number]);

        const coords5 = downsampleCoords(coords5Raw, 200);
        console.log(" Coords 5: " + coords5);
        const coords20 = downsampleCoords(coords20Raw);
        console.log(" Coords 20: " + coords20);

        console.log("Raw 5min:", coords5Raw.length);
        console.log("Downsampled 5min:", coords5.length);


        const distance5 = await getDistanceFromGoogleProxy(coords5);
        const distance20 = await getDistanceFromGoogleProxy(coords20);

        const elevationGain5 = await getElevationGainFromGoogle(coords5);
        console.log(" elevationGain5: " + elevationGain5);
        const elevationGain20 = await getElevationGainFromGoogle(coords20);
        console.log(" elevationGain20: " + elevationGain20);
        const alphaDegrees5 = safeGradientRadians(elevationGain5, distance5) * (180 / Math.PI);
        const alphaDegrees20 = safeGradientRadians(elevationGain20, distance20) * (180 / Math.PI);

        const est5 = calculatePower({ bodyMass, bikeMass, cr, alpha: alphaDegrees5, distance: distance5, duration: 300 , elevation: elevationGain5, elevationMidpoint: getElevationStartpoint(elevationGain5, powerSeries, interval5.startIdx), temperature: temperature, bodyHeight: bodyHeight });
        const est20 = calculatePower({ bodyMass, bikeMass, cr, alpha: alphaDegrees20, distance: distance20, duration: 1200, elevation: elevationGain20, elevationMidpoint: getElevationStartpoint(elevationGain20, powerSeries, interval20.startIdx), temperature: temperature , bodyHeight: bodyHeight });

        setMeasured5(interval5.avgPower);
        setEstimated5(est5.Leistung);
        setMeasured20(interval20.avgPower);
        setEstimated20(est20.Leistung);
        setFtp(0.95 * est20.Leistung);
        setVo2max(((est5.Leistung / bodyMass) * 10.8) / 0.85);

        if (est20.Leistung && bodyMass) {
            const ftpCalc = 0.95 * est20.Leistung;
            setFtpWkg(Number((ftpCalc / bodyMass).toFixed(2)));
        }

        if (est5.Leistung && bodyMass) {
            setVo2max(Number((est5.Leistung / bodyMass).toFixed(2)));
        }



    };

    return (
        <Container maxWidth="xl" sx={{ py: 1 }}>
        <AppBar position="static" color="transparent" elevation={0}>
            <Toolbar sx={{ justifyContent: "space-between" }}>
                <Typography variant="h5" fontWeight="bold">PowerChartAI</Typography>

                <Box sx={{ display: "flex", gap: 2 }}>
                    <Button onClick={handleLogout} variant="outlined" size="small">
                        Logout
                    </Button>
                    <Button onClick={handleSavePerformance} variant="outlined" size="small">
                        Add to Database
                    </Button>
                </Box>
            </Toolbar>

        </AppBar>

            <Grid container alignItems="stretch" spacing={3 }  sx={{ mt: 2 }}>
                {/* Eingabe */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>Eingabe</Typography>
                        <CalculatorForm
                            bodyMass={bodyMass}
                            bikeMass={bikeMass}
                            cr={cr}
                            alpha={0}
                            temperature={temperature}
                            bodyHeight={bodyHeight}
                            onTemperatureChange={setTemperature}
                            onBodyMassChange={setBodyMass}
                            onBikeMassChange={setBikeMass}
                            onBodyHeightChange={setBodyHeight}
                            onCrChange={setCr}
                            onAlphaChange={() => {}}
                            onFileUpload={handleTcxUpload}
                            onExport={() => {}}
                        />
                    </Paper>
                </Grid>

                {/* Auswertung */}
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>Nachberechnete Leistung</Typography>
                        <ResultsDisplay
                            measured5={measured5}
                            measured20={measured20}
                            estimated5={estimated5}
                            estimated20={estimated20}
                            bodyMass={bodyMass}
                        />
                        {vo2max !== null && (
                            <Typography variant="body2" sx={{ mt: 2 }}>
                                Geschätzter VO₂max: {vo2max.toFixed(1)} ml/min/kg
                            </Typography>
                        )}
                    </Paper>
                </Grid>

                {/* Unten: Leistungszonen + Power Profiling */}
                <Grid item xs={12} md={6}>
                    {ftp && (
                        <Paper elevation={3} sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>🚴‍♂️ Trainingszonen</Typography>
                            <ZoneTable ftp={ftp} />
                        </Paper>
                    )}
                </Grid>

                <Grid item xs={12} md={6}>
                    {ftpWkg && estimated5 && (
                        <Paper elevation={3} sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>📊 Power Profil Analyse</Typography>
                            <PowerComparisonChart
                                ftp={ftpWkg}
                                min5={Number((estimated5 / bodyMass).toFixed(2))}
                            />
                            <Box mt={3}>
                                <PowerLevelText
                                    ftp={ftpWkg}
                                    min5={Number((estimated5 / bodyMass).toFixed(2))}
                                />
                            </Box>
                        </Paper>
                    )}
                </Grid>
            </Grid>
        </Container>

    );
}