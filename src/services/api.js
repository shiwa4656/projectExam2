import axios from 'axios';
import { API_URL, headers } from '../config';

const api = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to add the API key and auth token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  config.headers = headers(token);
 
  return config;
});

// Add a response interceptor for debugging
api.interceptors.response.use(
  (response) => {
 
    return response;
  },
  (error) => {
   
    return Promise.reject(error);
  }
);

export default api; 