const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// API client for MongoDB backend
class API {
  private baseURL = API_BASE_URL;

  private async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data.data || data;
  }

  auth = {
    register: async (email: string, password: string) => {
      return this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },

    login: async (email: string, password: string) => {
      return this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },

    logout: async () => {
      return this.request('/auth/logout', { method: 'POST' });
    },
  };

  checkins = {
    create: async (data: { moodRating: number; stressLevel: number; feelingsNotes: string }) => {
      return this.request('/checkins', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    getAll: async () => {
      return this.request('/checkins');
    },

    getStats: async () => {
      return this.request('/checkins/stats');
    },
  };
}

export const api = new API();
export const authAPI = api.auth;
export const checkinsAPI = api.checkins;