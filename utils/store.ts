import create from 'zustand'
import { LatLng } from 'leaflet'

type State = {
  position: LatLng | null
  setPosition: (newPosition: LatLng) => void
}

const useStore = create<State>((set) => ({
  position: null,
  setPosition: (newPosition) => set({ position: newPosition }),
}))

export default useStore
