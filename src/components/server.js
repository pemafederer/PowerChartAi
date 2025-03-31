import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();


const app = express();
app.use(cors());
app.use(express.json()); // JSON-Parser aktivieren (auch für Auth-geschützte Routen)

// Supabase Client
const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_SERVICE_ROLE
);

console.log("🔑 Google API Key (Server):", process.env.GOOGLE_ELEVATION_API_KEY);

// Auth-Middleware
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace("Bearer ", "");

    if (!token) return res.status(401).json({ error: "No token provided" });

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
        return res.status(401).json({ error: "Invalid token" });
    }

    req.user = data.user;
    next();
};

// 🔒 Private Test-Route
app.get("/private", authenticate, (req, res) => {
    res.json({ message: `Hello ${req.user.email}, this is a protected route.` });
});

// 🗻 Elevation API Proxy
app.get("/elevation", async (req, res) => {
    const { locations } = req.query;
    const key = process.env.GOOGLE_ELEVATION_API_KEY;

    const url = `https://maps.googleapis.com/maps/api/elevation/json?locations=${locations}&key=${key}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error("Elevation fetch failed", err);
        res.status(500).json({ error: "Fetch failed" });
    }
});

// 🚴 Google Routes Distance Proxy
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

        res.json({ distance });
    } catch (err) {
        console.error("Distance proxy error:", err);
        res.status(500).json({ error: "Distance fetch failed" });
    }
});

// 🟢 Server starten
app.listen(3001, () => {
    console.log("✅ Proxy server running on http://localhost:3001");
});
