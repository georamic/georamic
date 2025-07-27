import { useState } from 'react';
import { Box, Typography, Button } from '@mui/material';

interface CitySelectProps {
  onCitySelected: (city: { name: string; value: string; lat: number; lng: number }) => void;
}


const cities = [
  { name: 'Boise, ID', value: 'boise', lat: 43.615, lng: -116.2023 },
  { name: 'Austin, TX', value: 'austin', lat: 30.2672, lng: -97.7431 },
  { name: 'St. Louis, MO', value: 'st_louis', lat: 38.627, lng: -90.1994 },
];


export default function CitySelectComponent({ onCitySelected }: CitySelectProps) {
  const [selectedCity, setSelectedCity] = useState<string>('');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <Typography variant="h5" fontWeight="bold" color="black" >Select Your Study Area</Typography>
      <select
        value={selectedCity}
        onChange={(e) => setSelectedCity(e.target.value)}
        style={{
          padding: '10px',
          fontSize: '16px',
          minWidth: '220px',
          borderRadius: '6px',
          border: '1px solid #ccc',
          color: selectedCity ? '#000' : '#777',
          backgroundColor: 'white',
          appearance: 'none',
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          boxShadow: 'none'
        }}
      >
      
        <option value="" disabled>Select a city</option>
        {cities.map(city => (
          <option key={city.value} value={city.value}>{city.name}</option>
        ))}
      </select>
      <Button
        variant="contained"
        disabled={!selectedCity}
        onClick={() => {
          const city = cities.find(c => c.value === selectedCity);
          if (city) {
            onCitySelected(city); // send full city object
          }
        }}
      >
        Next
      </Button>
    </Box>
  );
}
