import { useCallback, useEffect, useState } from "react";

export type Contact = { id: string; name: string; phone: string; relation: string };
export type Profile = {
  name: string;
  email: string;
  phone: string;
  bloodGroup: string;
  photo?: string;
  role: "user" | "head";
};
export type Alert = {
  id: string;
  user: string;
  phone: string;
  message: string;
  lat: number;
  lng: number;
  address: string;
  createdAt: number;
  status: "active" | "responding" | "resolved";
  channels: { police: boolean; ambulance: boolean; family: boolean; head: boolean };
  media: { type: "photo" | "video"; label: string }[];
};
export type Settings = {
  notifications: boolean;
  language: string;
  voiceActivation: boolean;
  voiceCode: string;
  privacyShareLocation: boolean;
  droneConnected: boolean;
};

const KEY = "safesky:v1";

export type SafeskyState = {
  authed: boolean;
  profile: Profile;
  contacts: Contact[];
  alerts: Alert[];
  settings: Settings;
};

export const defaultState: SafeskyState = {
  authed: false,
  profile: {
    name: "Aarohi Sharma",
    email: "aarohi@safesky.app",
    phone: "+91 98765 43210",
    bloodGroup: "O+",
    role: "user",
  },
  contacts: [
    { id: "c1", name: "Mom", phone: "+91 90000 11111", relation: "Family" },
    { id: "c2", name: "Rahul (Brother)", phone: "+91 90000 22222", relation: "Family" },
  ],
  alerts: [],
  settings: {
    notifications: true,
    language: "en-IN",
    voiceActivation: false,
    voiceCode: "safe sky help me",
    privacyShareLocation: true,
    droneConnected: false,
  },
};

function read(): SafeskyState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<SafeskyState>;
    return {
      ...defaultState,
      ...parsed,
      profile: { ...defaultState.profile, ...parsed.profile },
      settings: { ...defaultState.settings, ...parsed.settings },
    };
  } catch {
    return defaultState;
  }
}

const listeners = new Set<() => void>();
let cache: SafeskyState | null = null;

export function getState(): SafeskyState {
  if (!cache) cache = read();
  return cache;
}

export function setState(patch: Partial<SafeskyState> | ((s: SafeskyState) => Partial<SafeskyState>)) {
  const current = getState();
  const next = { ...current, ...(typeof patch === "function" ? patch(current) : patch) };
  cache = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("safesky:update"));
  }
  listeners.forEach((l) => l());
}

export function useSafesky() {
  const [state, setLocal] = useState<SafeskyState>(defaultState);

  useEffect(() => {
    const sync = () => setLocal({ ...read() });
    cache = read();
    sync();
    const onCustom = () => setLocal({ ...getState() });
    listeners.add(onCustom);
    window.addEventListener("storage", sync);
    window.addEventListener("safesky:update", onCustom);
    return () => {
      listeners.delete(onCustom);
      window.removeEventListener("storage", sync);
      window.removeEventListener("safesky:update", onCustom);
    };
  }, []);

  return { ...state, update: setState } as SafeskyState & { update: typeof setState };
}

export type AlertInput = { [K in keyof Alert]?: Alert[K] | undefined };

export function createAlert(partial: AlertInput = {}) {
  const s = getState();
  const clean = Object.fromEntries(
    Object.entries(partial).filter(([, v]) => v !== undefined),
  ) as Partial<Alert>;
  const alert: Alert = {
    id: `A-${Date.now().toString(36).toUpperCase()}`,
    user: s.profile.name,
    phone: s.profile.phone,
    message: "SOS! I need immediate help. My live location is attached.",
    lat: partial.lat ?? 28.6139,
    lng: partial.lng ?? 77.209,
    address: partial.address ?? "Locating…",
    createdAt: Date.now(),
    status: "active",
    channels: { police: true, ambulance: true, family: true, head: true },
    media: [],
    ...clean,
  };
  setState((prev) => ({ alerts: [alert, ...prev.alerts].slice(0, 50) }));
  return alert;
}

export type Position = { lat: number; lng: number; accuracy: number };

export function useLiveLocation() {
  const [pos, setPos] = useState<Position | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Geolocation unavailable on this device");
      return;
    }
    const id = navigator.geolocation.watchPosition(
      (p) =>
        setPos({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy ?? 0 }),
      (e) => setError(e.message),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  return { pos, error };
}

export type Weather = { temp: number; wind: number; code: number; label: string };

const WEATHER_LABELS: Record<number, string> = {
  0: "Clear sky",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Fog",
  51: "Light drizzle",
  61: "Rain",
  63: "Moderate rain",
  65: "Heavy rain",
  80: "Rain showers",
  95: "Thunderstorm",
};

export function useWeather(pos: Position | null) {
  const [weather, setWeather] = useState<Weather | null>(null);

  useEffect(() => {
    if (!pos) return;
    let cancelled = false;
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${pos.lat}&longitude=${pos.lng}&current=temperature_2m,wind_speed_10m,weather_code`,
    )
      .then((r) => r.json())
      .then((d) => {
        if (cancelled || !d?.current) return;
        setWeather({
          temp: Math.round(d.current.temperature_2m),
          wind: Math.round(d.current.wind_speed_10m),
          code: d.current.weather_code,
          label: WEATHER_LABELS[d.current.weather_code] ?? "Conditions updating",
        });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [pos?.lat, pos?.lng]);

  return weather;
}

export function useReverseGeocode(pos: Position | null) {
  const [address, setAddress] = useState<string>("");
  useEffect(() => {
    if (!pos) return;
    let cancelled = false;
    fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${pos.lat}&longitude=${pos.lng}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setAddress([d.locality, d.city, d.principalSubdivision, d.countryName].filter(Boolean).join(", "));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [pos?.lat, pos?.lng]);
  return address;
}

export function speak(text: string, lang = "en-IN") {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  window.speechSynthesis.speak(u);
}

export function useSiren() {
  const [playing, setPlaying] = useState(false);
  const stop = useCallback(() => {
    setPlaying(false);
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    window.dispatchEvent(new CustomEvent("safesky:siren-stop"));
  }, []);
  const start = useCallback(() => setPlaying(true), []);
  return { playing, start, stop };
}

export function formatTime(ts: number) {
  return new Date(ts).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const LANGUAGES = [
  { code: "en-IN", label: "English" },
  { code: "hi-IN", label: "हिन्दी" },
  { code: "ta-IN", label: "தமிழ்" },
  { code: "te-IN", label: "తెలుగు" },
  { code: "kn-IN", label: "ಕನ್ನಡ" },
  { code: "ml-IN", label: "മലയാളം" },
  { code: "bn-IN", label: "বাংলা" },
  { code: "mr-IN", label: "मराठी" },
  { code: "es-ES", label: "Español" },
  { code: "fr-FR", label: "Français" },
  { code: "ar-SA", label: "العربية" },
];