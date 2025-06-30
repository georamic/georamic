import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import type { ApiResponse } from '../App';

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
    { name: 'Boise, ID', value: 'boise', lat: 43.6150, lng: -116.2023 }, // Corrected to Boise, ID
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
        (err) => {
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
    try {
      const response = await axios.post<ApiResponse>('/api/iso_calc/', payload);
      console.log('API response:', response.data);
      setProximityData(response.data);
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
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
        position: 'absolute',
        top: 70, // Below AppBarComponent (assuming 64px height + margin)
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        backgroundColor: '#F5F5F5', // Light gray for modern look
        padding: '12px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        maxWidth: '700px',
        width: '90%',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Top Section: Logo and Search Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          gap: '12px',
        }}
      >
        {/* Company Logo */}
        {/* <div
          style={{
            padding: '8px 16px',
            backgroundColor: '#1E88E5', // Vibrant blue
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '14px',
            whiteSpace: 'nowrap',
          }}
        >
          AccessLite
        </div> */}

        {/* Search Bar with Dropdown */}
        <div style={{ position: 'relative', flex: 1 }} ref={searchRef}>
          <label
            htmlFor="location-search"
            style={{
              display: 'block',
              fontSize: '12px',
              color: '#333333',
              marginBottom: '4px',
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
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontSize: '14px',
              width: '100%',
              backgroundColor: 'white',
              color: '#333333', // Black text for readability
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
                      padding: '8px 12px',
                      cursor: 'pointer',
                      fontSize: '14px',
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
                    padding: '8px 12px',
                    color: '#999',
                    fontSize: '14px',
                  }}
                >
                  No matching locations
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Right: Mode and Search Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          width: '100%',
          gap: '12px',
        }}
      >
        {/* Mode Dropdown */}
        <div>
          <label
            htmlFor="mode-select"
            style={{
              display: 'block',
              fontSize: '12px',
              color: '#333333',
              marginBottom: '4px',
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
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              fontSize: '14px',
              backgroundColor: 'white',
              color: '#333333',
              transition: 'border-color 0.3s ease',
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
              fontSize: '12px',
              color: '#333333',
              marginBottom: '4px',
              fontWeight: '500',
              visibility: 'hidden', // Hidden for alignment but accessible
            }}
          >
            Search
          </label>
          <button
            onClick={() => handleSearch()}
            disabled={loading || !lat || !lng}
            style={{
              padding: '8px 16px',
              backgroundColor: loading || !lat || !lng ? '#ccc' : '#1E88E5',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading || !lat || !lng ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              transition: 'background-color 0.3s ease',
            }}
          >
            {loading ? (
              <span>
                <svg
                  style={{ marginRight: '5px', verticalAlign: 'middle' }}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2V6M12 18V22M6 12H2M22 12H18M19.071 4.929L16.243 7.757M7.757 16.243L4.929 19.071M4.929 4.929L7.757 7.757M16.243 16.243L19.071 19.071"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-spin"
                  />
                </svg>
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
            fontSize: '12px',
            textAlign: 'center',
            width: '100%',
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default SearchComponent;