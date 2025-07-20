// Application Settings Configuration
// This file contains all configurable settings for the application

// Environment Configuration
export const ENVIRONMENT = {
  // API Configuration
  API: {
    // BASE_URL: 'https://localhost:63005',
    BASE_URL: 'https://vidro-api.onrender.com',
    TIMEOUT: 10000, // Request timeout in milliseconds
    RETRY_ATTEMPTS: 3,
  },
  
  // App Configuration
  APP: {
    NAME: 'Vidro',
    VERSION: '1.0.0',
    DEBUG: __DEV__, // React Native's development flag
  },
  
  // UI Configuration
  UI: {
    ANIMATION_DURATION: 300,
    TOAST_DURATION: 3000,
    PAGINATION_SIZE: 20,
  },
  
  // Date/Time Configuration
  DATETIME: {
    DATE_FORMAT: 'YYYY-MM-DD',
    DISPLAY_DATE_FORMAT: 'MMM DD, YYYY',
    TIME_FORMAT: 'HH:mm',
  },
  
  // Storage Configuration
  STORAGE: {
    CACHE_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
  },
} as const;

// Environment-specific overrides
const ENVIRONMENT_OVERRIDES = {
  development: {
    API: {
      BASE_URL: 'https://localhost:58949',
    },
    APP: {
      DEBUG: true,
    },
  },
  production: {
    API: {
      BASE_URL: 'https://vidro-api.onrender.com',
    },
    APP: {
      DEBUG: false,
    },
  },
} as const;

// Get current environment (you can modify this logic based on your needs)
const getCurrentEnvironment = (): keyof typeof ENVIRONMENT_OVERRIDES => {
  // You can use environment variables or other logic to determine the environment
  return __DEV__ ? 'development' : 'production';
};

// Merge environment-specific settings
const currentEnv = getCurrentEnvironment();
const envOverrides = ENVIRONMENT_OVERRIDES[currentEnv];

// Export final settings with environment overrides applied
export const SETTINGS = {
  ...ENVIRONMENT,
  API: { ...ENVIRONMENT.API, ...envOverrides.API },
  APP: { ...ENVIRONMENT.APP, ...envOverrides.APP },
} as const;

// Export individual setting groups for convenience
export const { API, APP, UI, DATETIME, STORAGE } = SETTINGS;

// Helper functions for common settings
export const getApiUrl = (endpoint: string): string => {
  return `${API.BASE_URL}${endpoint}`;
};

export const isDebugMode = (): boolean => {
  return APP.DEBUG;
};

export const getAppInfo = () => ({
  name: APP.NAME,
  version: APP.VERSION,
  environment: currentEnv,
});
