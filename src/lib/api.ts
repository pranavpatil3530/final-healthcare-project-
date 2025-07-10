const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// API client for MongoDB backend
class API {
  private baseURL = API_BASE_URL;

  private async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    const url = `${this.baseURL}${endpoint}`;
    
    console.log('Making request to:', url); // Debug log
    
    const config: RequestInit = {
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || 'Request failed';
        } catch {
          errorMessage = errorText || `HTTP ${response.status}`;
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('API request failed:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please make sure the backend is running.');
      }
      throw error;
    }
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