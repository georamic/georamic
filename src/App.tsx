// src/App.tsx
// Fixed layout to show SearchComponent below CitySelectComponent
// Both components are visible when a city is selected

import CitySelectComponent from './components/CitySelectComponent';
import MapComponent from './components/MapComponent';
import AppBarComponent from './components/AppBarComponent';
import SearchComponent from './components/SearchComponent';
import ChartComponent from './components/ChartComponent';
import { useState } from 'react';
import type { ApiResponse, ProximityData } from './types';
import { Drawer, Typography, Box, CircularProgress } from '@mui/material';

// Define the city type
interface City {
  name: string;
  value: string;
  lat: number;
  lng: number;
}

function App() {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [proximityData, setProximityData] = useState<ProximityData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Transform API response to ProximityData format (now including population)
  const transformApiResponse = (apiResponse: ApiResponse): ProximityData => {
    const { lat, lng, result } = apiResponse;
    return {
      lat,
      lng,
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: result.bounding_poly_geojson,
          properties: {
            water: result.water,
            school: result.school,
            park: result.park,
            total_popl: result.total_popl,
            total_male: result.total_male,
            total_female: result.total_female,
          },
        },
      ],
    };
  };

  // Wrapper for setProximityData: start loading, transform, set data, stop loading, open sidebar
  const handleSetProximityData = async (apiResponse: ApiResponse) => {
    setIsLoading(true);
    setSidebarOpen(true); // Open sidebar immediately to show loading
    const transformedData = transformApiResponse(apiResponse);
    setProximityData(transformedData);
    setIsLoading(false);
  };

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        display: 'block',
        backgroundColor: 'white',
        overflowY: 'auto',
      }}
    >
      <AppBarComponent />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          pt: '64px', // Padding-top to offset fixed AppBar height
        }}
      >
        <Box sx={{ textAlign: 'center', width: '100%' }}>
          {/* Always show CitySelectComponent */}
          <CitySelectComponent onCitySelected={(city) => setSelectedCity(city)} />
          
          {/* Show SearchComponent below when a city is selected */}
          {selectedCity && (
            <Box
              sx={{
                mt: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
              }}
            >
              {/* Search Component */}
              <Box sx={{ width: '90%', maxWidth: '900px' }}>
                <SearchComponent
                  selectedCity={selectedCity}
                  setProximityData={handleSetProximityData}
                />
              </Box>

              {/* Map Component */}
              {proximityData && (
              <Box sx={{ width: '90%', maxWidth: '850px', height: 400, mt: 4 }}>
              <MapComponent proximityData={proximityData} />
              </Box>
            
              )}
              {/* Chart Component */}
              {proximityData && (
                <Box
                  sx={{
                    mt: 6,
                    width: '90%',
                    maxWidth: '900px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    sx={{
                      fontWeight: 'bold',
                      letterSpacing: '0.3px',
                      fontFamily: 'Roboto, sans-serif',
                    }}
                  >
                    Data Insights
                  </Typography>
                  <ChartComponent proximityData={proximityData} />
                </Box>
              )}
            </Box>
          )}
        </Box>

       
      </Box>
    </div>
  );
}

export default App;
