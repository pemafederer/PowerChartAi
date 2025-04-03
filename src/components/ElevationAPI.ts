import {GeoJSON} from "geojson";

const MAPBOX_TOKEN = import.meta.env.GOOGLE_ELEVATION_API_KEY;

    export type Coordinate = [number, number]; // [lon, lat]

    /**
     * Holt Distanz & Höhenprofil über Mapbox Map Matching API
     * (funktioniert am besten bei Radstrecken auf Wegen/Straßen)
     */
   /*export async function getDistanceFromMapbox(coordinates: Coordinate[]): Promise<{
        distance: number;
        geometry: GeoJSON.LineString;
    }> {
        if (!MAPBOX_TOKEN) {
            throw new Error("Mapbox Token fehlt. Stelle sicher, dass REACT_APP_MAPBOX_TOKEN in .env definiert ist.");
        }

        if (coordinates.length < 2) {
            throw new Error("Mindestens zwei Koordinaten erforderlich.");
        }

        const coordStr = coordinates.map(([lon, lat]) => `${lon},${lat}`).join(";");
        const url = `https://api.mapbox.com/matching/v5/mapbox/cycling/${coordStr}?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;

        const res = await fetch(url);
        const data = await res.json();

        if (!data.matchings || data.matchings.length === 0) {
            throw new Error("Keine passende Route von Mapbox gefunden.");
        }

        const matching = data.matchings[0];
        return {
            distance: matching.distance, // in Metern
            geometry: matching.geometry, // GeoJSON LineString
        };
    }
*/
export async function getDistanceFromGoogleRoutes(
    coords: [number, number][]
): Promise<number> {
    const apiKey = import.meta.env.GOOGLE_ELEVATION_API_KEY;

    if (!apiKey) {
        throw new Error("Google API Key fehlt.");
    }

    if (coords.length < 2) {
        throw new Error("Mindestens zwei Koordinaten erforderlich.");
    }

    const origin = {
        location: {
            latLng: {
                latitude: coords[0][1],
                longitude: coords[0][0],
            },
        },
    };

    const destination = {
        location: {
            latLng: {
                latitude: coords[coords.length - 1][1],
                longitude: coords[coords.length - 1][0],
            },
        },
    };

    const response = await fetch(
        `https://routes.googleapis.com/directions/v2:computeRoutes?key=${apiKey}`,
        {
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
        }
    );

    const data = await response.json();

    if (!response.ok) {
        console.error("Google Routes API Fehler:", data);
        throw new Error("Google Routes API Fehler");
    }

    const distance = data.routes?.[0]?.distanceMeters ?? 0;
    return distance;
}



export async function getElevationGainFromGoogle(coords: [number, number][]): Promise<number> {
    const sampled = coords.length > 200 ? coords.filter((_, i) => i % 5 === 0) : coords;
    const locations = sampled.map(([lon, lat]) => `${lat},${lon}`).join("|");

    const res = await fetch(`http://localhost:3001/elevation?locations=${locations}`);
    if (!res.ok) throw new Error("Google Elevation Proxy API failed");

    const data = await res.json();
    if (!data.results || data.results.length < 2) throw new Error("Invalid elevation data");

    const elevationStart = data.results[0].elevation;
    const elevationEnd = data.results[data.results.length - 1].elevation;
    const gain = Math.max(0, elevationEnd - elevationStart);

    return Math.round(gain);

}


export async function getDistanceFromGoogleProxy(coords: [number, number][]): Promise<number> {
    if (coords.length < 2) {
        throw new Error("Mindestens zwei Koordinaten erforderlich.");
    }

    const origin = {
        location: {
            latLng: {
                latitude: coords[0][1],
                longitude: coords[0][0],
            },
        },
    };

    const destination = {
        location: {
            latLng: {
                latitude: coords[coords.length - 1][1],
                longitude: coords[coords.length - 1][0],
            },
        },
    };

    const res = await fetch("http://localhost:3001/distance", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ origin, destination }),
    });

    if (!res.ok) throw new Error("Google Distance Proxy API failed");

    const data = await res.json();
    const distance = data.distance ?? 0;

    return Math.round(distance);
}







