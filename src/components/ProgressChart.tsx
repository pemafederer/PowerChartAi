// components/ProgressChart.tsx
import React, { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import { supabase } from "./SupabaseClient";

type DataPoint = {
    date: string;
    ftp_wkg: number;
    min5_wkg: number;
};

export default function ProgressChart() {
    const [data, setData] = useState<DataPoint[]>([]);
    const [yDomain, setYDomain] = useState<[number, number]>([0, 8]);


    useEffect(() => {
        const fetchData = async () => {
            const { data, error } = await supabase
                .from("performance_logs")
                .select("created_at, ftp_wkg, power_5min, body_mass")
                .order("created_at", { ascending: true });

            if (error) {
                console.error("Fehler beim Laden:", error);
                return;
            }

            const formatted: DataPoint[] = data.map((entry: any) => ({
                date: new Date(entry.created_at).toLocaleDateString("de-CH", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                }), // z. B. 03.04.
                ftp_wkg: entry.ftp_wkg,
                min5_wkg: Number((entry.power_5min / entry.body_mass).toFixed(2)),
            }));

            setData(formatted);

            const allValues = formatted.flatMap(d => [d.ftp_wkg,d.min5_wkg] );
            const min = Math.floor(Math.min(...allValues) - 0.2);
            const max = Math.floor(Math.max(...allValues) + 1);

            setYDomain([min, max]);
        };

        fetchData();
    }, []);

    return (
        <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data} margin={{ top: 20, right: 40, bottom: 20, left: 10 }}>
                <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis label={{ value: "W/kg", angle: -90, position: "insideLeft" }} domain={yDomain} />
                <Tooltip />
                <Legend />
                <Line
                    type="monotone"
                    dataKey="ftp_wkg"
                    name="FTP W/kg"
                    stroke="#1976d2"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                />
                <Line
                    type="monotone"
                    dataKey="min5_wkg"
                    name="5min W/kg"
                    stroke="#ff5722"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
