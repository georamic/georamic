import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useRef, useState } from 'react';
import type { ProximityData } from '../App';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapComponentProps {
  proximityData: ProximityData | null;
}

const MapComponent = ({ proximityData }: MapComponentProps) => {
  const mapRef = useRef<L.Map>(null);
  const [proximityLayer, setProximityLayer] = useState<L.GeoJSON | null>(null);
  const initialPosition: [number, number] = [38.58758760663098, -90.30807458779131];

  useEffect(() => {
    console.log('proximityData:', proximityData);
    if (proximityData && proximityData.type === 'FeatureCollection' && proximityData.features.length > 0) {
      const feature = proximityData.features[0];
      if (feature.geometry && feature.geometry.type === 'Polygon' && feature.geometry.coordinates.length > 0) {
        const coords = feature.geometry.coordinates[0];
        if (coords.length < 4 || coords.some(([lng, lat]) => isNaN(lng) || isNaN(lat))) {
          console.warn('Invalid polygon coordinates:', coords);
          setProximityLayer(null);
          return;
        }
        const newLayer = L.geoJSON(proximityData, {
          style: { color: '#ff7800', weight: 2, fillColor: '#ff7800', fillOpacity: 0.2 },
          onEachFeature: (feature, layer) => {
            const props = feature.properties || {};
            layer.bindPopup(`
              <b>Isochrone Polygon</b><br>
              <b>Water</b>: ${props.water?.count ?? 'N/A'} features, Nearest: ${props.water?.nearest_dist_m?.toFixed(2) ?? 'N/A'}m, Mean: ${props.water?.mean_dist_m?.toFixed(2) ?? 'N/A'}m<br>
              <b>School</b>: ${props.school?.count ?? 'N/A'} features, Nearest: ${props.school?.nearest_dist_m?.toFixed(2) ?? 'N/A'}m, Mean: ${props.school?.mean_dist_m?.toFixed(2) ?? 'N/A'}m<br>
              <b>Park</b>: ${props.park?.count ?? 'N/A'} features, Nearest: ${props.park?.nearest_dist_m?.toFixed(2) ?? 'N/A'}m, Mean: ${props.park?.mean_dist_m?.toFixed(2) ?? 'N/A'}m
            `);
          },
        });
        setProximityLayer(newLayer);
      } else {
        console.warn('No valid geometry in proximityData:', feature.geometry);
        setProximityLayer(null);
      }
    } else {
      setProximityLayer(null);
    }
  }, [proximityData]);

  useEffect(() => {
    if (proximityLayer && mapRef.current) {
      if (mapRef.current.hasLayer(proximityLayer)) mapRef.current.removeLayer(proximityLayer);
      proximityLayer.addTo(mapRef.current);
      const bounds = proximityLayer.getBounds();
      if (bounds.isValid()) {
        mapRef.current.fitBounds(bounds);
      } else {
        console.warn('Invalid bounds, using initial position');
        mapRef.current.setView(initialPosition, 13);
      }
    }
    return () => {
      if (proximityLayer && mapRef.current) mapRef.current.removeLayer(proximityLayer);
    };
  }, [proximityLayer]);

  // Ensure mapCenter is always a valid LatLngTuple
  const mapCenter: [number, number] = proximityData && proximityData.lat && proximityData.lng
    ? [proximityData.lat, proximityData.lng]
    : initialPosition;

  return (
    <MapContainer
      ref={mapRef}
      center={mapCenter}
      zoom={13}
      style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0 }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={mapCenter}>
        <Popup>Starting Point</Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapComponent;