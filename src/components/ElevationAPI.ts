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







