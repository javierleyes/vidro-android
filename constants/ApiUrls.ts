import { API } from '../configuration/Settings';

// API Configuration
const API_CONFIG = {
  BASE_URL: API.BASE_URL,
  ENDPOINTS: {
    VISITS: '/visits',
  }
} as const;

// API URLs
export const API_URLS = {
  GET_ALL_VISITS: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VISITS}`,
  CREATE_VISIT: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VISITS}`,
  DELETE_VISIT: (id: number) => `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.VISITS}/${id}`,
} as const;

// Export base URL and endpoints separately if needed
export const { BASE_URL, ENDPOINTS } = API_CONFIG;

// Helper function to build URLs with query parameters
export const buildApiUrl = (endpoint: string, params?: Record<string, string | number>): string => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  if (!params) return url;
  
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    searchParams.append(key, value.toString());
  });
  
  return `${url}?${searchParams.toString()}`;
};
