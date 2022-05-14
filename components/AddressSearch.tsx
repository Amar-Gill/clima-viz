import { GeocoderAutocomplete } from '@geoapify/geocoder-autocomplete';
import { Control, DomUtil, LatLng, Map } from 'leaflet';
import useStore from 'lib/store';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export const AddressSearch = () => {
  const mapContainer = useMap();
  const { setPosition } = useStore((state) => state);

  const SearchControl = Control.extend({
    options: {
      position: 'topright',
    },
    onAdd: function (map: Map) {
      const el = DomUtil.create('div');

      el.className = 'relative minimal round-borders';

      el.addEventListener('click', (e) => {
        e.stopPropagation();
      });

      const autocomplete = new GeocoderAutocomplete(
        el,
        `${process.env.NEXT_PUBLIC_GEOAPIFY}`,
        {
          placeholder: 'Enter an address',
        },
      );

      autocomplete.on('select', (location) => {
        if (!location) {
          return;
        }
        const { lat, lon } = location.properties;
        const newPosition = new LatLng(lat, lon);
        setPosition(newPosition);
        map.setView(newPosition, map.getZoom());
      });

      autocomplete.on('suggestions', (suggestions) => {
        return;
      });

      return el;
    },
    onRemove: function (map: Map) {
      return;
    },
  });

  useEffect(() => {
    mapContainer.addControl(new SearchControl());
  }, []);

  return null;
};
