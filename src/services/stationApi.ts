const API_BASE_URL = 'https://k5d98563c8.execute-api.us-west-2.amazonaws.com/inha-capstone-03/inha-capstone-03';

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

export async function getStationByCd(stationCd: string): Promise<StationData> {
  const response = await fetch(`${API_BASE_URL}/${stationCd}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch station data for code: ${stationCd}`);
  }
  return response.json();
}

export async function getTransferConvenience(stationCd: string): Promise<TransferConvenienceData> {
  const response = await fetch(`${API_BASE_URL}/transfer-convenience/${stationCd}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch transfer convenience for station code: ${stationCd}`);
  }
  return response.json();
}

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
