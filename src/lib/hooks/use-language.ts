"use client";

import { useCallback } from "react";
import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import { STORAGE_KEYS } from "@/config/constants";

/** Languages offered for read-aloud. `speechCode` is the BCP-47 tag for TTS. */
export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English", nativeLabel: "English", speechCode: "en-IN" },
  { code: "hi", label: "Hindi", nativeLabel: "हिंदी", speechCode: "hi-IN" },
  { code: "gu", label: "Gujarati", nativeLabel: "ગુજરાતી", speechCode: "gu-IN" },
  { code: "mr", label: "Marathi", nativeLabel: "मराठी", speechCode: "mr-IN" },
  { code: "ta", label: "Tamil", nativeLabel: "தமிழ்", speechCode: "ta-IN" },
  { code: "te", label: "Telugu", nativeLabel: "తెలుగు", speechCode: "te-IN" },
  { code: "kn", label: "Kannada", nativeLabel: "ಕನ್ನಡ", speechCode: "kn-IN" },
  { code: "bn", label: "Bengali", nativeLabel: "বাংলা", speechCode: "bn-IN" },
  { code: "ml", label: "Malayalam", nativeLabel: "മലയാളം", speechCode: "ml-IN" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

const DEFAULT_LANGUAGE: LanguageCode = "en";
const DEFAULT_SPEECH_CODE = "en-IN";

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

interface LanguageState {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
}

/**
 * Preferred read-aloud language. Persisted to localStorage so the choice made
 * on the family-profile page is available across the whole assessment flow.
 */
const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: DEFAULT_LANGUAGE,
      setLanguage: (language) => set({ language }),
    }),
    {
      name: STORAGE_KEYS.preferredLanguage,
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? noopStorage : window.localStorage,
      ),
    },
  ),
);

export function speechCodeFor(language: LanguageCode): string {
  return (
    SUPPORTED_LANGUAGES.find((item) => item.code === language)?.speechCode ??
    DEFAULT_SPEECH_CODE
  );
}

export function useLanguage() {
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);

  const getSpeechCode = useCallback(() => speechCodeFor(language), [language]);

  return {
    language,
    setLanguage,
    getSpeechCode,
    speechCode: speechCodeFor(language),
    SUPPORTED_LANGUAGES,
  };
}
