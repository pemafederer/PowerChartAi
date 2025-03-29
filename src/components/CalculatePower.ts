export function calculatePower({
                                   bodyMass,
                                   bikeMass,
                                   cr,
                                   alpha,
                                   distance,   // in METERS
                                   duration,
                                   elevation,
                                   elevationMidpoint,
                                   temperature,
                                   bodyHeight,
                                   // in SECONDS
                               }: {
    bodyMass: number;
    bikeMass: number;
    cr: number;
    alpha: number; // degrees
    distance: number; // meters
    duration: number; // seconds
    elevation: number;
    elevationMidpoint: number;
    temperature: number;
    bodyHeight: number;

}) {
    const g = 9.81;  // m/s²
    console.log("Gravitationskonstante (g):", g);

    const mTot = bodyMass + bikeMass;
    console.log("Gesamtmasse (mTot):", mTot);

    const spezGaskonstante = 8.3144621 / 0.0289644;
    console.log("Spezifische Gaskonstante (R):", spezGaskonstante);

    const pressure = 101325 * Math.exp(-elevationMidpoint / 7990);
    console.log("Luftdruck (pressure):", pressure);

    const kelvin = 273.15 + temperature;
    console.log("Temperatur in Kelvin:", kelvin);

    const density = pressure / (spezGaskonstante * kelvin);
    console.log("Luftdichte (air density):", density);

    const bsa = 0.00949 * Math.pow(bodyHeight, 0.655) * Math.pow(bodyMass, 0.441);
    console.log("Körperoberfläche (BSA):", bsa);

    const frontalArea = 0.3176 * bsa - 0.1478;
    console.log("Frontalfläche (A):", frontalArea);

    const cd = 0.9;
    console.log("Luftwiderstandsbeiwert (cd):", cd);

    const CdA = frontalArea * cd;
    console.log("CdA:", CdA);

    const v = distance / duration;
    console.log("Geschwindigkeit (v) in m/s:", v);

    const vK = v * 3.6;
    console.log("Geschwindigkeit (v) in km/h:", vK);

    console.log("Body Mass", bodyMass);
    console.log("Bike Mass", bikeMass);
    console.log("Distance Mass", distance);
    console.log("Duration Mass", duration);
    console.log(" Mass", mTot);
    const alphaRadCos = Math.cos((alpha * Math.PI) / 180);// Is correct
    const alphaRadSin = Math.sin((alpha * Math.PI) / 180);
    console.log(alpha)
    console.log(alphaRadCos);
    console.log(alphaRadSin)
    console.log(v)



    const Fair = 0.5 * density * frontalArea * cd * Math.pow(v, 2) // Luftwiederstand
    const Pair = Fair * v; //Luftwiederstand in Watt


    // Rollwiderstand
    const FRoll = mTot * g * cr * alphaRadCos
    console.log("Froll: " + FRoll);

    const Proll = FRoll * v;
    console.log("Proll: " + Proll);

    // Hangabtriebskraft
    const Fslope = mTot * g * alphaRadSin
    console.log("Fslope: " + Fslope);
    const Pslope = Fslope * v;
    console.log("Pslope: " + Pslope);


    const Ftotal = FRoll + Fslope + Fair; // Gesamtwiederstand in Newton
    console.log("Ptotal: " + Ftotal);

    const Leistung = Ftotal * v / 0.985 + 3;



    return {
        FRoll,
        Proll,
        Fslope,
        Pslope,
        Leistung,
        v,
    };
}
