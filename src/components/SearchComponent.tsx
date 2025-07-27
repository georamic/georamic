// src/components/SearchComponent.tsx
// Replaced location search with interactive map for location selection
// Users can now click on the map to select a specific location

import { useState, useEffect } from 'react';
import axios, { isAxiosError } from 'axios';
import type { ApiResponse } from '../types';
import { CircularProgress } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface City {
  name: string;
  value: string;
  lat: number;
  lng: number;
}

interface SearchComponentProps {
  selectedCity: City;
  setProximityData: (data: ApiResponse) => void;
}

// Component to handle map clicks
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

const SearchComponent = ({ selectedCity, setProximityData }: SearchComponentProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'walk' | 'bike'>('walk');
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const timeBudget = 10; // Default time_budget

  // Initialize with the selected city's coordinates
  useEffect(() => {
    setSelectedLocation({ lat: selectedCity.lat, lng: selectedCity.lng });
  }, [selectedCity]);

  // Handle location selection from map click
  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    setError(null); // Clear any previous errors
  };

  // Handle API request
  const handleSearch = async () => {
    if (!selectedLocation) {
      setError('Please select a location on the map');
      return;
    }
    
    setLoading(true);
    setError(null);
    const payload = { 
      lat: selectedLocation.lat, 
      lng: selectedLocation.lng, 
      mode, 
      time_budget: timeBudget 
    };
    
    console.log('Sending request to /api/iso_calc/ with payload:', payload);
    const apiUrl = import.meta.env.VITE_API_URL
      ? `${import.meta.env.VITE_API_URL}/api/iso_calc/`
      : 'http://localhost:8000/api/iso_calc/';
    
    console.log('API URL:', apiUrl);
    if (!apiUrl.startsWith('http')) {
      console.error('Invalid API URL:', apiUrl);
      setError('Invalid API URL configuration');
      setLoading(false);
      return;
    }
    
    try {
      const response = await axios.post<ApiResponse>(apiUrl, payload);
      console.log('API response:', response.data);
      setProximityData(response.data);
    } catch (err: any) {
      const errorMessage = isAxiosError(err)
        ? err.response?.data?.message || err.message
        : 'Failed to fetch isochrone data';
      setError(errorMessage);
      console.error('API error:', err);
    } finally {
      setLoading(false);
    }
  };

  const mapCenter: [number, number] = selectedLocation 
    ? [selectedLocation.lat, selectedLocation.lng]
    : [selectedCity.lat, selectedCity.lng];

  return (
    <div
      style={{
        backgroundColor: 'white',
        padding: '16px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        maxWidth: '900px',
        width: '90%',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Map Section */}
      <div style={{ width: '100%', height: '300px', borderRadius: '8px', overflow: 'hidden' }}>
        <MapContainer
          center={mapCenter}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapClickHandler onLocationSelect={handleLocationSelect} />
          
          {/* Show marker for selected location */}
          {selectedLocation && (
            <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
              <Popup>
                Selected Location<br />
                Lat: {selectedLocation.lat.toFixed(6)}<br />
                Lng: {selectedLocation.lng.toFixed(6)}
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Instructions */}
      <div style={{ textAlign: 'center', color: '#666', fontSize: '14px' }}>
        Click anywhere on the map to select a location, then choose your travel mode and click Search.
      </div>

      {/* Controls Section */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: '16px',
          justifyContent: 'center',
        }}
      >
        {/* Mode Dropdown */}
        <div>
          <label
            htmlFor="mode-select"
            style={{
              display: 'block',
              fontSize: '14px',
              color: '#333333',
              marginBottom: '6px',
              fontWeight: '500',
            }}
          >
            Travel Mode
          </label>
          <select
            id="mode-select"
            value={mode}
            onChange={(e) => setMode(e.target.value as 'walk' | 'bike')}
            style={{
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontSize: '16px',
              backgroundColor: 'white',
              color: '#333333',
              transition: 'border-color 0.3s ease',
              minWidth: '120px',
            }}
            disabled={loading}
          >
            <option value="walk">Walk</option>
            <option value="bike">Bike</option>
          </select>
        </div>

        {/* Search Button */}
        <div>
          <button
            onClick={handleSearch}
            disabled={loading || !selectedLocation}
            style={{
              padding: '10px 20px',
              backgroundColor: loading || !selectedLocation ? '#ccc' : '#1E88E5',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading || !selectedLocation ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              transition: 'background-color 0.3s ease',
              minWidth: '120px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <CircularProgress size={18} color="inherit" style={{ marginRight: '8px' }} />
                Loading...
              </span>
            ) : (
              'Search'
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <p
          style={{
            color: '#D32F2F',
            margin: '8px 0 0 0',
            fontSize: '14px',
            textAlign: 'center',
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default SearchComponent;