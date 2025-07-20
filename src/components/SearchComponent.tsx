// src/components/SearchComponent.tsx
// Increased gaps, paddings, and minWidths to make it less compressed
// Added MUI CircularProgress for animated spinner in loading state
// Import CircularProgress from '@mui/material'
// Adjusted spinner size and color to match button (white on blue)

import { useState, useEffect, useRef } from 'react';
import axios, { isAxiosError } from 'axios';
import type { ApiResponse } from '../types';
import { CircularProgress } from '@mui/material'; // Added import for spinner

interface SearchComponentProps {
  setProximityData: (data: ApiResponse) => void;
}

const SearchComponent = ({ setProximityData }: SearchComponentProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'walk' | 'bike'>('walk');
  const [searchText, setSearchText] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const timeBudget = 10; // Default time_budget

  // Updated Predefined US city options with 10 additional locations
  const cityOptions = [
    { name: 'Use My Current Location', value: 'current_location', lat: null, lng: null },
    { name: 'New York, NY', value: 'new_york', lat: 40.7128, lng: -74.0060 },
    { name: 'Chicago, IL', value: 'chicago', lat: 41.8781, lng: -87.6298 },
    { name: 'Los Angeles, CA', value: 'los_angeles', lat: 34.0522, lng: -118.2437 },
    { name: 'Boise, ID', value: 'boise', lat: 43.6150, lng: -116.2023 },
    { name: 'Houston, TX', value: 'houston', lat: 29.7604, lng: -95.3698 },
    { name: 'Phoenix, AZ', value: 'phoenix', lat: 33.4484, lng: -112.0740 },
    { name: 'Seattle, WA', value: 'seattle', lat: 47.6062, lng: -122.3321 },
    { name: 'Denver, CO', value: 'denver', lat: 39.7392, lng: -104.9903 },
    { name: 'Atlanta, GA', value: 'atlanta', lat: 33.7490, lng: -84.3880 },
    { name: 'Miami, FL', value: 'miami', lat: 25.7617, lng: -80.1918 },
    { name: 'San Francisco, CA', value: 'san_francisco', lat: 37.7749, lng: -122.4194 },
    { name: 'Austin, TX', value: 'austin', lat: 30.2672, lng: -97.7431 },
    { name: 'Portland, OR', value: 'portland', lat: 45.5051, lng: -122.6750 },
  ];

  // Filter cities based on search text
  const filteredCities = cityOptions.filter((option) =>
    option.name.toLowerCase().includes(searchText.toLowerCase())
  );

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch user location for "Use My Current Location"
  const fetchUserLocation = async () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude);
          setLng(position.coords.longitude);
          setSearchText('Current Location');
          setShowDropdown(false);
          handleSearch(position.coords.latitude, position.coords.longitude);
        },
        (err: any) => {
          setError('Failed to get location');
          console.error(err);
          setLat(null);
          setLng(null);
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation not supported');
    }
  };

  // Handle API request
  const handleSearch = async (latitude: number | null = lat, longitude: number | null = lng) => {
    if (!latitude || !longitude) {
      setError('Please select a valid location');
      return;
    }
    setLoading(true);
    setError(null);
    const payload = { lat: latitude, lng: longitude, mode, time_budget: timeBudget };
    console.log('Sending request to /api/iso_calc/ with payload:', payload);
    const apiUrl = import.meta.env.VITE_API_URL
      ? `${import.meta.env.VITE_API_URL}/api/iso_calc/`
      : 'http://localhost:8000/api/iso_calc/'; // Fallback
    console.log('API URL:', apiUrl); // Debug the URL
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

  // Handle dropdown selection
  const handleSelectLocation = (option: typeof cityOptions[0]) => {
    if (option.value === 'current_location') {
      fetchUserLocation();
    } else {
      setLat(option.lat);
      setLng(option.lng);
      setSearchText(option.name);
      setShowDropdown(false);
      handleSearch(option.lat, option.lng);
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'white', // White background
        padding: '16px', // Increased padding for more space
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'row', // Inline row
        alignItems: 'flex-start',
        gap: '24px', // Increased gap between elements
        maxWidth: '900px', // Wider max width
        width: '90%',
        transition: 'all 0.3s ease',
        position: 'relative',
      }}
    >
      {/* Company Logo
      <div
        style={{
          padding: '10px 20px', // Larger padding
          backgroundColor: '#1E88E5',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '16px', // Larger font
          whiteSpace: 'nowrap',
          marginTop: '24px', // Align with inputs
        }}
      >
        AccessLite
      </div> */}

      {/* Search Bar with Dropdown */}
      <div style={{ position: 'relative', flex: 1 }}>
        <label
          htmlFor="location-search"
          style={{
            display: 'block',
            fontSize: '14px', // Slightly larger
            color: '#333333',
            marginBottom: '6px', // More margin
            fontWeight: '500',
          }}
        >
          Location
        </label>
        <input
          id="location-search"
          type="text"
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder="Search city or use current location"
          style={{
            padding: '10px', // Increased padding
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontSize: '16px', // Larger font
            width: '100%',
            backgroundColor: 'white',
            color: '#333333',
            transition: 'border-color 0.3s ease',
          }}
          disabled={loading}
        />
        {showDropdown && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: 'white',
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
              zIndex: 1001,
              maxHeight: '200px',
              overflowY: 'auto',
            }}
          >
            {filteredCities.length > 0 ? (
              filteredCities.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleSelectLocation(option)}
                  style={{
                    padding: '10px 14px', // Increased padding
                    cursor: 'pointer',
                    fontSize: '16px', // Larger font
                    color: '#333333',
                    transition: 'background-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#E3F2FD')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'white')}
                >
                  {option.name}
                </div>
              ))
            ) : (
              <div
                style={{
                  padding: '10px 14px',
                  color: '#999',
                  fontSize: '16px',
                }}
              >
                No matching locations
              </div>
            )}
          </div>
        )}
      </div>

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
            minWidth: '120px', // Increased min width
          }}
          disabled={loading}
        >
          <option value="walk">Walk</option>
          <option value="bike">Bike</option>
        </select>
      </div>

      {/* Search Button */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: '14px',
            color: '#333333',
            marginBottom: '6px',
            fontWeight: '500',
            visibility: 'hidden',
          }}
        >
          Search
        </label>
        <button
          onClick={() => handleSearch()}
          disabled={loading || !lat || !lng}
          style={{
            padding: '10px 20px', // Increased padding
            backgroundColor: loading || !lat || !lng ? '#ccc' : '#1E88E5',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading || !lat || !lng ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            transition: 'background-color 0.3s ease',
            minWidth: '120px', // Increased min width
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center' }}>
              <CircularProgress size={18} color="inherit" style={{ marginRight: '8px' }} /> {/* Animated spinner */}
              Loading...
            </span>
          ) : (
            'Search'
          )}
        </button>
      </div>

      {/* Error Message - Positioned below */}
      {error && (
        <p
          style={{
            color: '#D32F2F',
            margin: '12px 0 0 0', // Increased margin
            fontSize: '14px',
            textAlign: 'center',
            width: '100%',
            position: 'absolute',
            bottom: '-28px', // Adjusted for increased space
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default SearchComponent;