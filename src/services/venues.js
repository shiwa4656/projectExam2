import api from './api';

export const getVenues = async (params = {}) => {
  try {
    // Set default pagination and sorting parameters
    const defaultParams = {
      limit: 12, // Show 12 venues per page
      page: 1,
      sort: 'created',
      sortOrder: 'desc',
      ...params
    };

    const response = await api.get('/venues', { params: defaultParams });
    
    // Handle both array and object response formats
    if (Array.isArray(response.data)) {
      return {
        venues: response.data,
        meta: {
          currentPage: 1,
          totalPages: 1,
          totalItems: response.data.length
        }
      };
    }
    
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return {
        venues: response.data.data,
        meta: {
          currentPage: response.data.meta?.currentPage || 1,
          totalPages: response.data.meta?.totalPages || 1,
          totalItems: response.data.meta?.totalItems || response.data.data.length
        }
      };
    }
    
    return {
      venues: [],
      meta: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0
      }
    };
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch venues');
    }
    throw error;
  }
};

export const getVenuesByProfile = async (profileName) => {
  try {
    const response = await api.get(`/profiles/${profileName}/venues`);
    
    // Handle both array and object response formats
    if (Array.isArray(response.data)) {
      return response.data;
    }
    
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }
    
    return [];
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch profile venues');
    }
    throw error;
  }
};

export const getVenue = async (id) => {
  try {
    const response = await api.get(`/venues/${id}`, {
      params: {
        _owner: 'true',
        _bookings: 'true',
        _customer: 'true'
      }
    });
    
    // Detailed logging of the response
    // Handle the nested data structure
    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    // If the response is a single venue object
    if (response.data && typeof response.data === 'object') {
      return response.data;
    }
    
    return null;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to fetch venue details');
    }
    throw error;
  }
};

export const createVenue = async (venueData) => {
  try {

    // Basic validation
    if (!venueData.name || !venueData.description || !venueData.price || !venueData.maxGuests) {
      throw new Error('Missing required fields: name, description, price, and maxGuests are required');
    }

    // Format data according to API requirements
    const formattedData = {
      name: venueData.name.trim(),
      description: venueData.description.trim(),
      price: Number(venueData.price),
      maxGuests: Number(venueData.maxGuests),
      rating: Number(venueData.rating) || 0,
      meta: {
        wifi: Boolean(venueData.meta.wifi),
        parking: Boolean(venueData.meta.parking),
        breakfast: Boolean(venueData.meta.breakfast),
        pets: Boolean(venueData.meta.pets)
      },
      location: {
        address: venueData.location.address?.trim() || '',
        city: venueData.location.city?.trim() || '',
        zip: venueData.location.zip?.trim() || '',
        country: venueData.location.country?.trim() || '',
        continent: venueData.location.continent?.trim() || '',
        lat: Number(venueData.location.lat) || 0,
        lng: Number(venueData.location.lng) || 0
      }
    };

    // Handle media - simplified approach
    if (venueData.media && Array.isArray(venueData.media)) {
      const validMedia = venueData.media
        .filter(media => media && media.url && media.url.trim())
        .map(media => ({
          url: media.url.trim(),
          alt: media.alt?.trim() || venueData.name
        }));

      if (validMedia.length > 0) {
        formattedData.media = validMedia;
      }
    }

    // Remove any undefined or null values from the root level
    Object.keys(formattedData).forEach(key => {
      if (formattedData[key] === undefined || formattedData[key] === null) {
        delete formattedData[key];
      }
    });

    // Remove any undefined or null values from location
    if (formattedData.location) {
      Object.keys(formattedData.location).forEach(key => {
        if (formattedData.location[key] === undefined || formattedData.location[key] === null) {
          delete formattedData.location[key];
        }
      });
    }

    // Log the final formatted data for debugging

    // Make the API request
    const response = await api.post('/venues', formattedData);
    return response.data.data;
  } catch (error) {
    
    if (error.response) {
      // Log the complete error details
    

      // Log the actual request data that was sent

      // If there are specific validation errors, show them
      if (error.response.data.errors && Array.isArray(error.response.data.errors)) {
        const errorMessages = error.response.data.errors.map(err => {
          return `${err.message} (${err.path})`;
        }).join(', ');
        throw new Error(errorMessages);
      }
      
      // If there's a specific error message, use it
      if (error.response.data.message) {
        throw new Error(error.response.data.message);
      }

      // If there's a status text, use it
      if (error.response.statusText) {
        throw new Error(error.response.statusText);
      }

      // If we have error details, show them
      if (error.response.data) {
        throw new Error(JSON.stringify(error.response.data));
      }
    }
    
    // If we get here, throw a generic error
    throw new Error('Failed to create venue. Please check your input and try again.');
  }
};

export const updateVenue = async (id, venueData) => {

  try {
    // Format the data according to the API requirements
    const formattedData = {
      name: venueData.name,
      description: venueData.description,
      price: Number(venueData.price),
      maxGuests: Number(venueData.maxGuests),
      rating: Number(venueData.rating) || 0,
      meta: {
        wifi: Boolean(venueData.meta.wifi),
        parking: Boolean(venueData.meta.parking),
        breakfast: Boolean(venueData.meta.breakfast),
        pets: Boolean(venueData.meta.pets)
      },
      location: {
        address: String(venueData.location.address || '').trim(),
        city: String(venueData.location.city || '').trim(),
        zip: String(venueData.location.zip || '').trim(),
        country: String(venueData.location.country || '').trim(),
        continent: String(venueData.location.continent || '').trim(),
        lat: Number(venueData.location.lat) || 0,
        lng: Number(venueData.location.lng) || 0
      }
    };

    // Only include media if it exists and has valid entries
    if (venueData.media && Array.isArray(venueData.media) && venueData.media.length > 0) {
      const validMedia = venueData.media
        .filter(media => media && typeof media === 'object' && media.url)
        .map(media => ({
          url: String(media.url).trim(),
          alt: String(media.alt || '').trim()
        }));

      if (validMedia.length > 0) {
        formattedData.media = validMedia;
      }
    }

    // Remove any undefined or null values
    Object.keys(formattedData).forEach(key => {
      if (formattedData[key] === undefined || formattedData[key] === null) {
        delete formattedData[key];
      }
    });

    // Remove any undefined or null values from location
    if (formattedData.location) {
      Object.keys(formattedData.location).forEach(key => {
        if (formattedData.location[key] === undefined || formattedData.location[key] === null) {
          delete formattedData.location[key];
        }
      });
    }

    const response = await api.put(`/venues/${id}`, formattedData);
    return response.data.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to update venue');
    }
    throw error;
  }
};

export const deleteVenue = async (id) => {
  try {
    const response = await api.delete(`/venues/${id}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to delete venue');
    }
    throw error;
  }
};

export const searchVenues = async (query) => {
  try {
    const response = await api.get('/venues/search', {
      params: {
        q: query
      }
    });
    return response.data.data || [];
  } catch (error) {
    throw error;
  }
}; 