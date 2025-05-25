import api from './api';

export const getBookings = async (params = {}) => {
  try {
    // Ensure we get both customer and venue information
    const queryParams = {
      _customer: 'true',
      _venue: 'true',
      ...params
    };

    console.log('Fetching bookings with params:', queryParams);
    const response = await api.get('/bookings', { 
      params: queryParams,
      paramsSerializer: params => {
        return Object.entries(params)
          .map(([key, value]) => `${key}=${value}`)
          .join('&');
      }
    });
    
    console.log('Bookings response:', response.data);
    
    // Handle both array and object response formats
    if (Array.isArray(response.data)) {
      console.log('Returning array of bookings:', response.data);
      return response.data;
    }
    
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      console.log('Returning bookings from data property:', response.data.data);
      return response.data.data;
    }
    
    console.error('Unexpected API response structure:', response.data);
    return [];
  } catch (error) {
    console.error('Error fetching bookings:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      throw new Error(error.response.data.message || 'Failed to fetch bookings');
    }
    throw error;
  }
};

export const getBooking = async (id) => {
  try {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching booking:', error);
    throw error;
  }
};

export const createBooking = async (bookingData) => {
  try {
    console.log('Creating booking with data:', bookingData);
    // Ensure the data is in the correct format
    const formattedData = {
      dateFrom: bookingData.dateFrom,
      dateTo: bookingData.dateTo,
      guests: parseInt(bookingData.guests),
      venueId: bookingData.venueId
    };
    
    console.log('Formatted booking data:', formattedData);
    const response = await api.post('/bookings', formattedData);
    console.log('Booking creation response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating booking:', error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      throw new Error(error.response.data.message || 'Failed to create booking');
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Error request:', error.request);
      throw new Error('No response received from server');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
      throw error;
    }
  }
};

export const updateBooking = async (id, bookingData) => {
  try {
    const response = await api.put(`/bookings/${id}`, bookingData);
    return response.data;
  } catch (error) {
    console.error('Error updating booking:', error);
    throw error;
  }
};

export const deleteBooking = async (id) => {
  try {
    await api.delete(`/bookings/${id}`);
  } catch (error) {
    console.error('Error deleting booking:', error);
    throw error;
  }
};

export const getProfileBookings = async (name) => {
  try {
    console.log('Fetching bookings for profile:', name);
    const response = await api.get(`/profiles/${name}/bookings`);
    console.log('Profile bookings response:', response);
    
    // The API returns { data: [...] } structure
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } else {
      console.error('Unexpected API response structure:', response);
      return [];
    }
  } catch (error) {
    console.error('Error fetching profile bookings:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
    }
    throw error;
  }
};

export const getVenueBookings = async (venueId) => {
  try {
    console.log('Fetching bookings for venue:', venueId);
    const response = await api.get('/holidaze/bookings', {
      params: {
        _venue: 'true',
        _customer: 'true',
        _owner: 'true',
        venueId: venueId
      }
    });
    console.log('Venue bookings response:', response.data);
    
    // Handle both array and object response formats
    if (Array.isArray(response.data)) {
      console.log('Returning array of bookings:', response.data);
      return response.data;
    }
    
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      console.log('Returning bookings from data property:', response.data.data);
      return response.data.data;
    }
    
    console.error('Unexpected API response structure:', response.data);
    return [];
  } catch (error) {
    console.error('Error fetching venue bookings:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
      throw new Error(error.response.data.message || 'Failed to fetch venue bookings');
    }
    throw error;
  }
}; 