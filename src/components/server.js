// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

/** Elevation **/
const app = express();
app.use(cors());

console.log("🔑 Google API Key (Server):", process.env.GOOGLE_ELEVATION_API_KEY);


app.get("/elevation", async (req, res) => {
    const { locations } = req.query;
    const key = process.env.GOOGLE_ELEVATION_API_KEY;

    const url = `https://maps.googleapis.com/maps/api/elevation/json?locations=${locations}&key=${key}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Fetch failed" });
    }
});

app.listen(3001, () => {
    console.log("Proxy server running on http://localhost:3001");
});

/** Distanz **/
app.use(express.json()); // nicht vergessen für POST!

app.post("/distance", async (req, res) => {
    const key = process.env.GOOGLE_ELEVATION_API_KEY;
    const { origin, destination } = req.body;

    const url = `https://routes.googleapis.com/directions/v2:computeRoutes?key=${key}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Goog-FieldMask": "routes.distanceMeters",
            },
            body: JSON.stringify({
                origin,
                destination,
                travelMode: "BICYCLE",
            }),
        });

        const data = await response.json();

        const distance = data.routes?.[0]?.distanceMeters;

        if (!distance) {
            return res.status(400).json({ error: "No route or distance found" });
        }

        res.json({ distance }); // <- nur das Nötige

    } catch (err) {
        console.error("Distance proxy error:", err);
        res.status(500).json({ error: "Distance fetch failed" });
    }
});

