// src/App.tsx
// Added padding-top to the content Box to account for fixed AppBar height (default 64px)
// Removed overflow: 'hidden' from main div if causing issues; added back if needed for no scroll
// Ensured the header and search are centered

import MapComponent from './components/MapComponent';
import AppBarComponent from './components/AppBarComponent';
import SearchComponent from './components/SearchComponent';
import ChartComponent from './components/ChartComponent';
import { useState } from 'react';
import type { ApiResponse, ProximityData } from './types';
import { Drawer, Typography, Box, CircularProgress } from '@mui/material';

function App() {
  const [proximityData, setProximityData] = useState<ProximityData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // New loading state

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
  // Assume SearchComponent calls this on search/submit or dropdown select (update SearchComponent if needed to call on select too)
  const handleSetProximityData = async (apiResponse: ApiResponse) => { // Made async if API call is inside, but assuming it's sync for now
    setIsLoading(true);
    setSidebarOpen(true); // Open sidebar immediately to show loading
    // Simulate or actual API wait; assuming response is already fetched in SearchComponent
    const transformedData = transformApiResponse(apiResponse);
    setProximityData(transformedData);
    setIsLoading(false);
  };

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white', // Explicitly set background to white
      }}
    >
      <AppBarComponent />
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          pt: '64px', // Padding-top to offset fixed AppBar height
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h1" sx={{ fontSize: '4rem', fontWeight: 'bold', color: 'black' }}>
            AccessLite
          </Typography>
          <SearchComponent setProximityData={handleSetProximityData} />
        </Box>
      </Box>

      {/* Sidebar Drawer */}
      <Drawer
        anchor="right"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: '40vw', p: 2 } }}
      >

    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'auto' }}>
      <Typography 
        marginTop={6}
        variant="subtitle1" 
        gutterBottom 
        sx={{ 
          fontWeight: 'bold', 
          letterSpacing: '0.3px', 
          fontFamily: 'Roboto, sans-serif' 
        }}
      >
        Map Overview
      </Typography>
      <Box sx={{ height: '40%', position: 'relative' }}> {/* Fixed height for map to prevent overlap; adjust % */}
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : (
          <MapComponent proximityData={proximityData} />
        )}
      </Box>
      <Typography 
        variant="subtitle1" 
        gutterBottom 
        sx={{ 
          mt: 2, 
          fontWeight: 'bold', 
          letterSpacing: '0.3px', 
          fontFamily: 'Roboto, sans-serif' 
        }}
      >
        Data Insights
      </Typography>
      <Box sx={{ flex: 1, overflow: 'auto' }}> {/* Flex for charts to take remaining space */}
        <ChartComponent proximityData={proximityData} />
      </Box>
    </Box>
      </Drawer>
    </div>
  );
}

export default App;