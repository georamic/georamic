import React, { useState } from 'react';
import axios from 'axios';
import type { ApiResponse } from '../App';

interface DashNowButtonProps {
  setProximityData: (data: ApiResponse) => void;
}

const DashNowButton = ({ setProximityData }: DashNowButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hardcoded inputs for testing (replace with dynamic values, e.g., from form or geolocation)
  const lat = 38.58743298254895;
  const lng = -90.30811676664203;
  const mode = 'walk';
  // const timeBudget = 10;

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post<ApiResponse>('/api/iso_calc/', {
        lat,
        lng,
        mode,
      });
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

  return (
    <div style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 1000 }}>
      <button
        onClick={handleClick}
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: loading ? '#ccc' : '#ff7800',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '16px',
        }}
      >
        {loading ? 'Loading...' : 'Dash Now'}
      </button>
      {error && (
        <p style={{ color: 'red', marginTop: '5px' }}>{error}</p>
      )}
    </div>
  );
};

export default DashNowButton;