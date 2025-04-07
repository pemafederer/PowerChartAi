// 📘 React Hooks – Übersicht & Use Cases

// ✅ useState – Lokaler State verwalten (z. B. Zähler, Formdaten)
import { useState } from 'react';
const [count, setCount] = useState(0);

// ✅ useEffect – Nebenwirkungen (Daten laden, Events, Timer)
import { useEffect } from 'react';
useEffect(() => {
    console.log('Komponente geladen');
    return () => console.log('Komponente entladen');
}, []); // [] = nur beim Mount

// ✅ useCallback – Funktion merken (für Props, Memo-Komponenten, stabile Referenz)
import { useCallback } from 'react';
const handleClick = useCallback(() => {
    console.log('clicked');
}, []);

// ✅ useMemo – Teure Berechnungen zwischenspeichern (z. B. Filter, Sortierung)
import { useMemo } from 'react';
const expensiveResult = useMemo(() => {
    return complexCalculation(data);
}, [data]);

// ✅ useRef – Referenz auf DOM-Element oder veränderbarer Wert ohne Re-Render
import { useRef } from 'react';
const inputRef = useRef(null);
<input ref={inputRef} />;

// ✅ useContext – Kontext-Werte auslesen (z. B. Theme, Auth)
import { useContext } from 'react';
const theme = useContext(ThemeContext);

// ✅ useReducer – Komplexer State oder mit mehreren Aktionen (wie Redux-Light)
import { useReducer } from 'react';
const [state, dispatch] = useReducer(reducerFn, initialState);

// ✅ useLayoutEffect – DOM direkt nach Render synchron manipulieren (z. B. Messungen)
import { useLayoutEffect } from 'react';
useLayoutEffect(() => {
    console.log('Layout fertig');
}, []);

// ✅ useImperativeHandle – Methoden nach außen verfügbar machen (z. B. `ref.current.focus()`)
import { useImperativeHandle, forwardRef } from 'react';
const MyComponent = forwardRef((props, ref) => {
    useImperativeHandle(ref, () => ({
        focus: () => console.log('Focus called')
    }));
    return <input />;
});

// ✅ useId – Eindeutige ID generieren (für Label + Input Zuordnung)
import { useId } from 'react';
const id = useId();
<label htmlFor={id}>Label</label>
<input id={id} />;

// ✅ useTransition – Übergänge ohne UI-Blockade (z. B. Sucheingabe)
import { useTransition } from 'react';
const [isPending, startTransition] = useTransition();

// ✅ useDeferredValue – Eingabewert verzögert anzeigen (z. B. Live-Suche vs. Anzeige)
import { useDeferredValue } from 'react';
const deferredValue = useDeferredValue(searchTerm);

// ✅ useSyncExternalStore – Für externe Stores (State Management außerhalb von React)
import { useSyncExternalStore } from 'react';
const state = useSyncExternalStore(subscribe, getSnapshot);

// ✅ useDebugValue – Für Debugging in DevTools sichtbar machen
import { useDebugValue } from 'react';
useDebugValue('Debug info');
