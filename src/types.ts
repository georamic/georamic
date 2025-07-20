// src/types.ts
// Updated modular interfaces to include population data in ProximityData for charts

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
      total_popl: number | null;
      total_male: number | null;
      total_female: number | null;
    };
  }[];
}