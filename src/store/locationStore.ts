import { create } from "zustand";

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  errorMsg: string | null;

  setLocation: (lat: number, lng: number, accuracy: number) => void;
  setError: (msg: string) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  latitude: null,
  longitude: null,
  accuracy: null,
  errorMsg: null,

  setLocation: (latitude, longitude, accuracy) =>
    set({ latitude, longitude, accuracy, errorMsg: null }),
  setError: (errorMsg) => set({ errorMsg }),
}));
