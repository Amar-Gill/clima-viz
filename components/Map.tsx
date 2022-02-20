import useStore from 'lib/store';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';

const LocationMarker = () => {
  const { position, setPosition } = useStore((state) => state);
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>
        <span className="underline decoration-solid">Project Coordinates:</span>
        <br />
        {position.toString()}
      </Popup>
    </Marker>
  );
};

const Map = () => {
  const { position } = useStore((state) => state);
  return (
    <MapContainer
      className="h-full flex-auto"
      center={position ?? [51.505, -0.09]}
      zoom={13}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker />
    </MapContainer>
  );
};

export default Map;
