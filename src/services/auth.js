import api from './api';

export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });

    // The API might return the data directly in response.data
    const responseData = response.data;
    
    if (!responseData || !responseData.accessToken) {
      throw new Error('Invalid response format from server');
    }

    const { accessToken, ...user } = responseData;
    
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch (error) {
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getProfile = async () => {
  try {
    const response = await api.get('/profiles/me');
    return response.data.data;
  } catch (error) {
    throw error;
  }
};

export const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/holidaze/profiles/' + profileData.name, profileData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}; 