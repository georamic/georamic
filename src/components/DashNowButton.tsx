import { useState } from 'react';
import axios from 'axios';
import type { ApiResponse } from '../App';

interface DashNowButtonProps {
  setProximityData: (data: ApiResponse) => void;
}

const DashNowButton = ({ setProximityData }: DashNowButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lat = 38.58743298254895;
  const lng = -90.30811676664203;
  const mode = 'walk';
  const timeBudget = 10;

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    const payload = { lat, lng, mode, time_budget: timeBudget };
    console.log('Sending request to /api/iso_calc/ with payload:', payload);
    try {
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/iso_calc/`;
      const response = await axios.post<ApiResponse>(apiUrl, payload);
      console.log('API response:', response.data);
      setProximityData(response.data);
    } catch (err: any) {
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
          padding: '8px 16px',
          backgroundColor: loading ? '#ccc' : '#1E88E5',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '14px',
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
          'Dash Now'
        )}
      </button>
      {error && (
        <p style={{ color: 'red', marginTop: '5px', fontSize: '12px' }}>{error}</p>
      )}
    </div>
  );
};

export default DashNowButton;