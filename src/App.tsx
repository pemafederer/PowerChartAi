import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import { Container, Paper, Typography } from "@mui/material";
import CalculatorForm from "./components/CalculatorForm";
import ResultsDisplay from "./components/ResultDisplay";
import {calculatePower} from "./components/CalculatePower";
import {getDistanceFromMapbox} from "./components/ElevationAPI";
import {getElevationGainFromMapbox} from "./components/ElevationAPI";

export default function App() {
    const [bodyMass, setBodyMass] = useState(0);
    const [bikeMass, setBikeMass] = useState(0);
    const [temperature, setTemperature] = useState(0);
    const [bodyHeight, setBodyHeight] = useState(0);

    const [cr, setCr] = useState(0.007);
    const [measured5, setMeasured5] = useState<number | null>(null);
    const [measured20, setMeasured20] = useState<number | null>(null);
    const [estimated5, setEstimated5] = useState<number | null>(null);
    const [estimated20, setEstimated20] = useState<number | null>(null);

    useEffect(() => {
        console.log("VITE VARIABLEN:", import.meta.env);
        console.log("MAPBOX TOKEN TEST:", import.meta.env.VITE_MAPBOX_TOKEN);
    }, []);

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

        const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
            const R = 6371000;
            const toRad = (deg: number) => (deg * Math.PI) / 180;
            const dLat = toRad(lat2 - lat1);
            const dLon = toRad(lon2 - lon1);
            const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c;
        };

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

        const calculateIntervalDistance = (
            points: TrackPoint[],
            startIdx: number,
            endIdx: number
        ): number => {
            if (points[startIdx].distance !== undefined && points[endIdx].distance !== undefined) {
                return points[endIdx].distance! - points[startIdx].distance!;
            } else {
                // Fallback
                let dist = 0;
                for (let i = startIdx + 1; i <= endIdx; i++) {
                    const a = points[i - 1], b = points[i];
                    if (a.lat && a.lon && b.lat && b.lon)
                        dist += getDistance(a.lat, a.lon, b.lat, b.lon);
                }
                return dist;
            }
        };
        function calculateElevationGain(points: TrackPoint[], startIdx: number, endIdx: number): number {
            let elevationGain = 0;

            for (let i = startIdx + 1; i <= endIdx; i++) {
                const prevAlt = points[i - 1].altitude;
                const currAlt = points[i].altitude;

                if (prevAlt !== undefined && currAlt !== undefined) {
                    const diff = currAlt - prevAlt;
                    if (diff > 0) elevationGain += diff; // only add positive differences
                }
            }

            return elevationGain;
        }

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

        const coords5 = downsampleCoords(coords5Raw);
        console.log(" Coords 5: " + coords5);
        const coords20 = downsampleCoords(coords20Raw);
        console.log(" Coords 20: " + coords20);


        const { distance: distance5 } = await getDistanceFromMapbox(coords5);
        const { distance: distance20 } = await getDistanceFromMapbox(coords20);

        const elevationGain5 = await getElevationGainFromMapbox(coords5);
        console.log(" elevationGain5: " + elevationGain5);
        const elevationGain20 = await getElevationGainFromMapbox(coords20);
        console.log(" elevationGain20: " + elevationGain20);
        const alphaDegrees5 = safeGradientRadians(elevationGain5, distance5) * (180 / Math.PI);
        const alphaDegrees20 = safeGradientRadians(elevationGain20, distance20) * (180 / Math.PI);

        const est5 = calculatePower({ bodyMass, bikeMass, cr, alpha: alphaDegrees5, distance: distance5, duration: 300 , elevation: elevationGain5, elevationMidpoint: getElevationStartpoint(elevationGain5, powerSeries, interval5.startIdx), temperature: temperature, bodyHeight: bodyHeight });
        const est20 = calculatePower({ bodyMass, bikeMass, cr, alpha: alphaDegrees20, distance: distance20, duration: 1200, elevation: elevationGain20, elevationMidpoint: getElevationStartpoint(elevationGain20, powerSeries, interval20.startIdx), temperature: temperature , bodyHeight: bodyHeight });

        setMeasured5(interval5.avgPower);
        setEstimated5(est5.Leistung);
        setMeasured20(interval20.avgPower);
        setEstimated20(est20.Leistung);






    };

    return (
        <Container maxWidth="sm" style={{ padding: "2rem 0" }}>
            <Paper elevation={3} style={{ padding: "2rem" }}>
                <Typography variant="h4" gutterBottom>
                    PowerChartAI
                </Typography>
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
                <ResultsDisplay measured5={measured5} measured20={measured20} estimated5={estimated5} estimated20={estimated20} bodyMass={bodyMass} />
            </Paper>
        </Container>
    );
}