import MapComponent from './components/MapComponent';
import AppBarComponent from './components/AppBarComponent';
import SearchComponent from './components/SearchComponent';
import DashNowButton from './components/DashNowButton';
import { useState } from 'react';

// Export interfaces for use in other files
export interface FeatureData {
  count: number;
  total_area_m2: number;
  nearest_dist_m: number;
  mean_dist_m: number;
}

export interface ApiResponse {
  lat: number;
  lng: number;
  mode: string;
  result: {
    water: FeatureData;
    school: FeatureData;
    park: FeatureData;
    total_popl: number | null;
    total_male: number | null;
    total_female: number | null;
    bounding_poly_geojson: {
      type: 'Polygon';
      coordinates: number[][][];
    };
  };
}

export interface ProximityData {
  lat: number;
  lng: number;
  type: 'FeatureCollection';
  features: {
    type: 'Feature';
    geometry: {
      type: 'Polygon';
      coordinates: number[][][];
    };
    properties: {
      water: FeatureData;
      school: FeatureData;
      park: FeatureData;
    };
  }[];
}

function App() {
  const [proximityData, setProximityData] = useState<ProximityData | null>(null);

  // Transform API response to ProximityData format
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
          },
        },
      ],
    };
  };

  // Wrapper for setProximityData to handle transformation
  const handleSetProximityData = (apiResponse: ApiResponse) => {
    const transformedData = transformApiResponse(apiResponse);
    setProximityData(transformedData);
  };

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <AppBarComponent />
      <div
        style={{
          height: 'calc(100vh - 64px)',
          width: '100vw',
          position: 'relative',
          top: 0,
        }}
      >
        <MapComponent proximityData={proximityData} />
      </div>
      <SearchComponent setProximityData={handleSetProximityData} />
      {/* <DashNowButton setProximityData={handleSetProximityData} /> */}
    </div>
  );
}

export default App;