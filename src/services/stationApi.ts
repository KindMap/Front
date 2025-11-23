
const BASE_URL = import.meta.env.VITE_AWS_API_GATEWAY_URL || '/inha-capstone-03';

export interface StationData {
  data: {
    station_id: number;
    line: string;
    name: string;
    lat: string | number;
    lng: string | number;
    station_cd: string;
  }
}

export interface TransferConvenienceData {
  data: {
    station_cd: string;
    station_name: string;
    convenience_score: number;
  }
}

export async function getStationById(stationId: string): Promise<StationData> {
  // Note: The user provided the URL with "staions", which might be a typo for "stations".
  // Using the provided URL first.
  const response = await fetch(`${BASE_URL}/stations/${stationId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch station data for ID: ${stationId}`);
  }
  return response.json();
}

export async function getTransferConvenience(stationCd: string): Promise<TransferConvenienceData> {
  const response = await fetch(`${BASE_URL}/transfer-convenience/${stationCd}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch transfer convenience for station code: ${stationCd}`);
  }
  return response.json();
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface StationSearchResult {
  station_id: number;
  line: string;
  name: string;
  lat: string;
  lng: string;
  station_cd: string;
}

export interface StationSearchResponse {
  results: StationSearchResult[];
}

export async function searchStations(query: string, limit: number = 5): Promise<StationSearchResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/stations/search?q=${query}&limit=${limit}`);
  if (!response.ok) {
    throw new Error(`Failed to search for stations with query: ${query}`);
  }
  return response.json();
}
