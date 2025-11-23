// src/api/ApiClient.ts
import axios from 'axios';

const ApiClient = axios.create({
  baseURL: '/', // same-origin for mock files
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---------- OPTIONAL MOCK INTERCEPTOR FOR DEV ----------
// Map GET /patients => public/mock/patients.json
ApiClient.interceptors.request.use(async (config) => {
  if (config.method === 'get' && config.url === '/patients') {
    const mockUrl = '/mock/patients.json';

    config.adapter = async () => {
      try {
        const res = await fetch(mockUrl);
        const json = await res.json();

        return {
          data: json,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        };
      } catch (e: any) {
        return {
          data: null,
          status: 0,
          statusText: e?.message ?? 'Network error',
          headers: {},
          config,
        };
      }
    };
  }

  return config;
});

// ---------- RESPONSE NORMALIZATION ----------
ApiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    return Promise.reject(err?.response ?? { status: 0, data: err?.message ?? 'Network error' });
  },
);

export default ApiClient;
