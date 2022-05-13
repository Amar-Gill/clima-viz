import { LatLng } from 'leaflet';
import create from 'zustand';

type State = {
  position: LatLng | null;
  geoapifyLoaded: boolean;
  setPosition: (newPosition: LatLng) => void;
  setGeoapifyLoaded: (loaded: boolean) => void;
};

const useStore = create<State>((set) => ({
  position: null,
  geoapifyLoaded: false,
  setPosition: (newPosition) => set({ position: newPosition }),
  setGeoapifyLoaded: (loadResult) => set({ geoapifyLoaded: loadResult }),
}));

export default useStore;
