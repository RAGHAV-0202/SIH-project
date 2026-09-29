const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:3001/api' : '/api');

export const api = {
  planRoute: async (request) => {
    const endpoints = [
      `${API_BASE_URL}/route/plan`,
      'http://localhost:3001/api/route/plan',
      'http://127.0.0.1:3001/api/route/plan',
      '/api/route/plan'
    ];

    // Remove duplicates while preserving priority order
    const uniqueEndpoints = [...new Set(endpoints)];

    let lastError = null;
    for (const endpoint of uniqueEndpoints) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request)
        });
        if (response.ok) {
          const data = await response.json();
          if (data && (data.routes || data.intent)) return data;
        }
      } catch (err) {
        lastError = err;
      }
    }

    console.error('All route plan endpoints failed:', lastError);
    throw lastError || new Error('Route planning failed: unable to connect to backend on port 3001');
  },
  
  planRouteStream: (request, onEvent) => {
    // Mocking SSE since we don't have a backend ready for this
    // In reality this would use EventSource or fetch with a stream reader
    setTimeout(() => onEvent({ type: 'progress', message: 'Understanding your request...' }), 500);
    setTimeout(() => onEvent({ type: 'progress', message: 'Checking traffic...' }), 1500);
    setTimeout(() => onEvent({ type: 'progress', message: 'Finding routes...' }), 2500);
    setTimeout(() => onEvent({ type: 'progress', message: 'Optimizing...' }), 3500);
  },

  getDisruptions: async () => {
    return [
      { id: 1, type: 'delay', location: 'Yellow Line Metro', severity: 'high', message: 'Delays on Yellow Line due to technical glitch.', status: 'active' }
    ];
  },

  replanRoute: async (routeId, disruption) => {
    return { success: true };
  },

  getDashboardAnalytics: async () => {
    return {
      totalRoutes: 12450,
      avgCommuteTime: 42,
      carbonSaved: 8500,
      activeDisruptions: 3
    };
  },

  getCongestionData: async () => {
    return [
      { id: 'c1', name: 'Ring Road', severity: 0.9, coords: [[28.6, 77.2], [28.62, 77.22]] }
    ];
  }
};
