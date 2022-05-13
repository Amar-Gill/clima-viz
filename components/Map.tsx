import useStore from 'lib/store';
import { useEffect, useState } from 'react';
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import { Browser, control, LatLng } from 'leaflet';
import Script from 'next/script';

const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY;

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

const AddressSearchControl = () => {
  const { setPosition } = useStore((state) => state);
  const map = useMap();

  useEffect(() => {
    // @ts-ignore
    const addressSearchControl = control.addressSearch(apiKey, {
      position: 'topright',
      resultCallback: (address: { lat: number; lon: number }) => {
        const newPosition = new LatLng(address.lat, address.lon);
        setPosition(newPosition);
        map.setView(newPosition, map.getZoom());
      },
      suggestionsCallback: (suggestions: any) => {
        console.log(suggestions);
      },
    });

    map.addControl(addressSearchControl);
  }, []);

  return null;
};

const Map = () => {
  const [geoapify, setGeoapify] = useState(false);
  const { position } = useStore((state) => state);

  const mapStyle = 'osm-bright-smooth';

  const mapURL = Browser.retina
    ? `https://maps.geoapify.com/v1/tile/${mapStyle}/{z}/{x}/{y}.png?apiKey=${apiKey}`
    : `https://maps.geoapify.com/v1/tile/${mapStyle}/{z}/{x}/{y}@2x.png?apiKey=${apiKey}`;

  return (
    <>
      <Script
        onLoad={() => setGeoapify(true)}
        src="https://unpkg.com/@geoapify/leaflet-address-search-plugin@^1/dist/L.Control.GeoapifyAddressSearch.min.js"
      />
      <MapContainer
        className="h-full flex-auto"
        center={position ?? [51.505, -0.09]}
        zoom={13}>
        <TileLayer
          attribution='Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | <a href="https://openmaptiles.org/" rel="nofollow" target="_blank">© OpenMapTiles</a> <a href="https://www.openstreetmap.org/copyright" rel="nofollow" target="_blank">© OpenStreetMap</a> contributors'
          url={mapURL}
        />
        <LocationMarker />
        {geoapify && <AddressSearchControl />}
      </MapContainer>
    </>
  );
};

export default Map;
