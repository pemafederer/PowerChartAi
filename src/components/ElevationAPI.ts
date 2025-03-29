import {GeoJSON} from "geojson";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

    export type Coordinate = [number, number]; // [lon, lat]

    /**
     * Holt Distanz & Höhenprofil über Mapbox Map Matching API
     * (funktioniert am besten bei Radstrecken auf Wegen/Straßen)
     */
    export async function getDistanceFromMapbox(coordinates: Coordinate[]): Promise<{
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

function tileXYZ(lat: number, lon: number, zoom: number) {
    const latRad = lat * Math.PI / 180;
    const n = Math.pow(2, zoom);
    const x = Math.floor((lon + 180) / 360 * n);
    const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n);
    return { x, y, z: zoom };
}

function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
    });
}
function getElevationFromImage(
    lat: number,
    lon: number,
    tileX: number,
    tileY: number,
    zoom: number,
    img: HTMLImageElement,
    tileSize: number
): number | null {
    const n = Math.pow(2, zoom);
    const x = ((lon + 180) / 360 * n - tileX) * tileSize;
    const latRad = lat * Math.PI / 180;
    const y = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n - tileY) * tileSize;

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0);

    const pixel = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
    const [r, g, b] = pixel;

    // Mapbox terrain-rgb decode formula
    const elevation = -10000 + ((r * 256 * 256 + g * 256 + b) * 0.1);
    return elevation;
}


export async function getElevationGainFromMapbox(coords: [number, number][]): Promise<number> {
    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    const zoom = 14;
    const tileSize = 256;

    let elevationGain = 0;
    let previousElevation: number | null = null;

    for (const [lon, lat] of coords) {
        const { x, y, z } = tileXYZ(lat, lon, zoom);
        const tileUrl = `https://api.mapbox.com/v4/mapbox.terrain-rgb/${z}/${x}/${y}@2x.pngraw?access_token=${token}`;

        const image = await loadImage(tileUrl);
        const elevation = getElevationFromImage(lat, lon, x, y, z, image, tileSize);

        if (elevation !== null) {
            if (previousElevation !== null && elevation > previousElevation) {
                elevationGain += elevation - previousElevation;
            }
            previousElevation = elevation;
        }
    }

    return Math.round(elevationGain);
}




