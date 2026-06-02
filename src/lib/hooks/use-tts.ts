"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useVoiceStore, type VoiceGender } from "./use-voice";

const noopSubscribe = () => () => {};
const getSupport = () =>
  typeof window !== "undefined" && "speechSynthesis" in window;

/* ── Voice gender heuristics ──────────────────────────────────────────────
 * The Web Speech API exposes no standard gender field, so we infer it from
 * voice names. Common TTS names across Google / Microsoft / Apple (including
 * Indian-language voices) plus the literal "female"/"male" markers. Female is
 * checked first because "female" contains the substring "male". */
const FEMALE_HINTS = [
  "female", "woman",
  "heera", "kalpana", "swara", "aditi", "sangeeta", "lekha", "veena", "pooja",
  "neerja", "priya", "geeta", "ananya", "raveena", "shruti", "isha", "kajal",
  "zira", "susan", "samantha", "aria", "jenny", "sonia", "kavya",
];
const MALE_HINTS = [
  "male", "man",
  "hemant", "madhur", "prabhat", "ravi", "hari", "valluvar", "kumar",
  "prabhakar", "arjun", "rishi", "david", "mark", "guy", "rishabh",
];

function genderOf(name: string): VoiceGender | null {
  const n = name.toLowerCase();
  if (FEMALE_HINTS.some((hint) => n.includes(hint))) return "female";
  if (MALE_HINTS.some((hint) => n.includes(hint))) return "male";
  return null;
}

/** Higher = clearer / more natural. Prefers neural/online/cloud voices. */
function quality(voice: SpeechSynthesisVoice): number {
  const n = voice.name.toLowerCase();
  let score = 0;
  if (n.includes("natural") || n.includes("neural")) score += 4;
  if (n.includes("online")) score += 2;
  if (n.includes("google")) score += 2;
  if (n.includes("enhanced") || n.includes("premium")) score += 2;
  if (!voice.localService) score += 1;
  if (voice.default) score += 1;
  return score;
}

/** Pick the clearest installed voice for the locale, honouring the gender pref. */
function pickVoice(
  speechCode: string,
  gender: VoiceGender,
): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;
  const target = speechCode.toLowerCase();
  const base = target.split("-")[0];

  const exact = voices.filter((v) => v.lang.toLowerCase() === target);
  const baseMatch = voices.filter((v) => v.lang.toLowerCase().startsWith(base));
  const pool = exact.length ? exact : baseMatch;
  if (pool.length === 0) return null;

  const gendered = pool.filter((v) => genderOf(v.name) === gender);
  const candidates = gendered.length ? gendered : pool;
  return [...candidates].sort((a, b) => quality(b) - quality(a))[0] ?? null;
}

/**
 * Thin wrapper over the Web Speech API (free, built into modern browsers and
 * Android). Reads the passed text in the requested locale, choosing the
 * clearest available voice and honouring the user's male/female preference.
 * When no true voice of the chosen gender exists, pitch is nudged to simulate
 * it so the toggle always changes the sound. Exposes `isSpeaking` for a
 * Listen/Stop toggle.
 */
export function useTTS() {
  // SSR-safe feature detection without setState-in-effect.
  const isSupported = useSyncExternalStore(
    noopSubscribe,
    getSupport,
    () => false,
  );
  const gender = useVoiceStore((state) => state.gender);
  const [isSpeaking, setIsSpeaking] = useState(false);
  // Keep a reference so the utterance isn't garbage-collected mid-speech
  // (a known Chrome quirk that cuts off longer phrases).
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!isSupported) return;
    // Warm the voice list (Chrome loads it asynchronously) so the first tap
    // already has good voices to choose from.
    window.speechSynthesis.getVoices();
    const warm = () => window.speechSynthesis.getVoices();
    window.speechSynthesis.addEventListener("voiceschanged", warm);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", warm);
      window.speechSynthesis.cancel();
    };
  }, [isSupported]);

  const stop = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string, speechCode: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

      // Cancel any ongoing speech (here or in another card) before starting.
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = speechCode;
      utterance.rate = 0.9; // a touch slower than default for clarity

      const voice = pickVoice(speechCode, gender);
      if (voice) utterance.voice = voice;

      // Base pitch by gender, then a stronger nudge if the only available voice
      // is the opposite gender — so the toggle is always audibly different.
      const actual = voice ? genderOf(voice.name) : null;
      if (actual && actual !== gender) {
        utterance.pitch = gender === "male" ? 0.7 : 1.3;
      } else {
        utterance.pitch = gender === "male" ? 0.9 : 1.1;
      }

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      utteranceRef.current = utterance;
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    },
    [gender],
  );

  return { speak, stop, isSpeaking, isSupported };
}
