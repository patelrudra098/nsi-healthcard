"use client";

import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import { STORAGE_KEYS } from "@/config/constants";

export type VoiceGender = "female" | "male";

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

interface VoiceState {
  gender: VoiceGender;
  setGender: (gender: VoiceGender) => void;
}

/** Preferred read-aloud voice gender, persisted across the assessment flow. */
export const useVoiceStore = create<VoiceState>()(
  persist(
    (set) => ({
      gender: "female",
      setGender: (gender) => set({ gender }),
    }),
    {
      name: STORAGE_KEYS.voiceGender,
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? noopStorage : window.localStorage,
      ),
    },
  ),
);

export function useVoice() {
  const gender = useVoiceStore((state) => state.gender);
  const setGender = useVoiceStore((state) => state.setGender);
  return { gender, setGender };
}
