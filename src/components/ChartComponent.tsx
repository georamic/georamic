// src/components/ChartComponent.tsx
// Reduced size of Doughnut (counts) and other circular charts (Pie, Doughnut for population) by wrapping in Box with maxWidth: '300px' and margin: 'auto' for centering
// Kept other charts (Bar, Scatter, Radar) full size as they are linear
// Added unique 'key' prop to each chart component to prevent canvas reuse issues on re-renders
// Added LineElement registration to fix "line" not registered error (required for Radar and potentially Scatter with lines)

import React from 'react';
import { Bar, Doughnut, Pie, Scatter, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement, // For scatter
  RadialLinearScale, // For radar
  LineElement, // Added for radar and potential scatter lines
} from 'chart.js';
import type { ProximityData } from '../types'; // Type-only import
import { Typography, Box } from '@mui/material';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, RadialLinearScale, LineElement);

interface ChartComponentProps {
  proximityData: ProximityData | null;
}

const ChartComponent: React.FC<ChartComponentProps> = ({ proximityData }) => {
  if (!proximityData || proximityData.features.length === 0) {
    return <Typography>No data available for charts.</Typography>;
  }

  const properties = proximityData.features[0].properties;
  const { water, school, park, total_popl, total_male, total_female } = properties;

  const features = ['Water', 'School', 'Park'];
  const counts = [water.count, school.count, park.count];
  const areas = [water.total_area_m2, school.total_area_m2, park.total_area_m2];
  const nearestDists = [water.nearest_dist_m, school.nearest_dist_m, park.nearest_dist_m];
  const meanDists = [water.mean_dist_m, school.mean_dist_m, park.mean_dist_m];

  // Data for Counts and Areas Bar Chart (original)
  const countsAreasData = {
    labels: features,
    datasets: [
      {
        label: 'Count',
        data: counts,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Total Area (m²)',
        data: areas,
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      },
    ],
  };

  // Data for Distances Bar Chart (original)
  const distancesData = {
    labels: features,
    datasets: [
      {
        label: 'Nearest Distance (m)',
        data: nearestDists,
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
      },
      {
        label: 'Mean Distance (m)',
        data: meanDists,
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  // Doughnut for Counts (new)
  const countsDoughnutData = {
    labels: features,
    datasets: [
      {
        data: counts,
        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)'],
      },
    ],
  };

  // Pie for Total Areas Proportion (creative addition)
  const areasPieData = {
    labels: features,
    datasets: [
      {
        data: areas,
        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(153, 102, 255, 0.6)', 'rgba(255, 159, 64, 0.6)'],
      },
    ],
  };

  // Scatter for Nearest vs Mean Distances (creative addition)
  const scatterData = {
    datasets: [
      {
        label: 'Distances',
        data: features.map((feature, i) => ({ x: nearestDists[i], y: meanDists[i], label: feature })),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  const scatterOptions = {
    responsive: true,
    scales: {
      x: { title: { display: true, text: 'Nearest Distance (m)' } },
      y: { title: { display: true, text: 'Mean Distance (m)' } },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.raw.label}: Nearest ${context.raw.x}m, Mean ${context.raw.y}m`,
        },
      },
    },
  };

  // Radar for Comparing Metrics (creative addition; normalize data for better visualization)
  const maxCount = Math.max(...counts);
  const maxArea = Math.max(...areas);
  const maxNearest = Math.max(...nearestDists);
  const maxMean = Math.max(...meanDists);
  const radarData = {
    labels: ['Count', 'Total Area', 'Nearest Dist', 'Mean Dist'],
    datasets: features.map((feature, i) => ({
      label: feature,
      data: [
        counts[i] / maxCount,
        areas[i] / maxArea,
        nearestDists[i] / maxNearest,
        meanDists[i] / maxMean,
      ],
      backgroundColor: `rgba(${75 + i*50}, ${192 - i*50}, ${192 + i*50}, 0.2)`,
      borderColor: `rgba(${75 + i*50}, ${192 - i*50}, ${192 + i*50}, 1)`,
      borderWidth: 1,
    })),
  };

  // Population data handling
  const male = total_male ?? 0;
  const female = total_female ?? 0;
  const total = total_popl ?? (male + female); // Fallback to sum if total null
  const hasPopulationData = male > 0 || female > 0 || total > 0;

  const populationData = {
    labels: ['Male', 'Female'],
    datasets: [
      {
        data: [male, female],
        backgroundColor: ['rgba(255, 206, 86, 0.6)', 'rgba(75, 192, 192, 0.6)'],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: '' },
    },
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, p: 2 }}>
      <Box>
        <Typography variant="h6" gutterBottom>Feature Counts (Doughnut)</Typography>
        <Box sx={{ maxWidth: '300px', margin: 'auto' }}> {/* Reduced size */}
          <Doughnut key="countsDoughnut" options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Counts' } } }} data={countsDoughnutData} />
        </Box>
      </Box>
      <Box>
        <Typography variant="h6" gutterBottom>Total Areas Proportion (Pie)</Typography>
        <Box sx={{ maxWidth: '300px', margin: 'auto' }}> {/* Reduced size */}
          <Pie key="areasPie" options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Total Areas' } } }} data={areasPieData} />
        </Box>
      </Box>
      <Box>
        <Typography variant="h6" gutterBottom>Feature Counts and Areas (Bar)</Typography>
        <Bar key="countsAreasBar" options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Counts and Total Areas' } } }} data={countsAreasData} />
      </Box>
      <Box>
        <Typography variant="h6" gutterBottom>Feature Distances (Bar)</Typography>
        <Bar key="distancesBar" options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Nearest and Mean Distances' } } }} data={distancesData} />
      </Box>
      <Box>
        <Typography variant="h6" gutterBottom>Nearest vs Mean Distances (Scatter)</Typography>
        <Scatter key="distancesScatter" options={scatterOptions} data={scatterData} />
      </Box>
      <Box>
        <Typography variant="h6" gutterBottom>Metrics Comparison (Radar)</Typography>
        <Radar key="metricsRadar" data={radarData} options={{ responsive: true, scales: { r: { beginAtZero: true } } }} />
      </Box>
      <Box>
        <Typography variant="h6" gutterBottom>Population Breakdown</Typography>
        {hasPopulationData ? (
          <>
            <Typography variant="body1" gutterBottom>Total Population: {total}</Typography>
            <Box sx={{ maxWidth: '300px', margin: 'auto' }}> {/* Reduced size */}
              <Doughnut key="populationDoughnut" options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: 'Gender Breakdown' } } }} data={populationData} />
            </Box>
          </>
        ) : (
          <Typography>No population data available.</Typography>
        )}
      </Box>
    </Box>
  );
};

export default ChartComponent;