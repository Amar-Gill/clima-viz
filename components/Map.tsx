import { LatLngExpression } from 'leaflet'
import { useState } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from 'react-leaflet'

const LocationMarker = () => {
  const [position, setPosition] = useState<LatLngExpression | null>(null)
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng)
      map.flyTo(e.latlng, map.getZoom())
    },
  })

  return position === null ? null : (
    <Marker position={position}>
      <Popup>
        Project Coordinates: <br />
        {position.toString()}
      </Popup>
    </Marker>
  )
}

const Map = () => {
  return (
    <MapContainer className="h-screen" center={[51.505, -0.09]} zoom={13}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker />
    </MapContainer>
  )
}

export default Map
