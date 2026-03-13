import { create } from 'zustand';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  errorMsg: string | null;

  setLocation: (lat: number, lng: number) => void;
  setError: (msg: string) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  latitude: null,
  longitude: null,
  errorMsg: null,

  setLocation: (latitude, longitude) => set({ latitude, longitude, errorMsg: null }),
  setError: (errorMsg) => set({ errorMsg }),
}));
