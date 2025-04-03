// components/PowerComparisonChart.tsx
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    LabelList,
} from "recharts"

type Props = {
    ftp: number
    min5: number
}

export const PowerComparisonChart = ({ ftp, min5 }: Props) => {
    const data = [
        { name: "Untrained", ftp: 2.0, min5: 2.3 },
        { name: "Fair", ftp: 3.1, min5: 3.8 },
        { name: "Moderate", ftp: 3.6, min5: 4.4 },
        { name: "Good", ftp: 4.2, min5: 5.0 },
        { name: "Very Good", ftp: 4.8, min5: 5.7 },
        { name: "Excellent", ftp: 5.3, min5: 6.4 },
        { name: "Exceptional", ftp: 5.9, min5: 7.0 },
        { name: "World Class", ftp: 6.4, min5: 7.6 },
        { name: "You", ftp, min5 },
    ]

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart layout="vertical" data={data}>
                <XAxis type="number" domain={[0, 8]} />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="ftp" fill="#8884d8" name="FTP">
                    <LabelList dataKey="ftp" position="right" />
                </Bar>
                <Bar dataKey="min5" fill="#82ca9d" name="5 Min">
                    <LabelList dataKey="min5" position="right" />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    )
}
