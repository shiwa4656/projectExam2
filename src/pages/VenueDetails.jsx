import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVenue } from '../services/venues';
import { createBooking, getVenueBookings } from '../services/bookings';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

export default function VenueDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [bookingData, setBookingData] = useState({
    dateFrom: '',
    dateTo: '',
    guests: 1,
  });

  useEffect(() => {
    loadVenue();
  }, [id]);

  useEffect(() => {
    if (venue && user) {
      if (user.venueManager && venue.owner && venue.owner.name === user.name) {
        processUpcomingBookings();
      }
    }
  }, [venue, user]);

  const loadVenue = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getVenue(id);
      if (data) {
        setVenue(data);
      } else {
        setError('Venue not found');
      }
    } catch (err) {
      setError('Failed to load venue details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const processUpcomingBookings = () => {
    try {
      if (!venue.bookings || venue.bookings.length === 0) {
        setUpcomingBookings([]);
        return;
      }

      const today = new Date();
      const upcomingBookings = venue.bookings
        .filter(booking => {
          if (!booking || !booking.dateFrom) {
            return false;
          }

          const bookingDate = new Date(booking.dateFrom);
          return bookingDate >= today;
        })
        .sort((a, b) => new Date(a.dateFrom) - new Date(b.dateFrom));
      
      setUpcomingBookings(upcomingBookings);
    } catch (err) {
      setUpcomingBookings([]);
    }
  };

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/venues/${id}` } });
      return;
    }

    try {
      setError('');
      const formattedBookingData = {
        dateFrom: bookingData.dateFrom,
        dateTo: bookingData.dateTo,
        guests: parseInt(bookingData.guests),
        venueId: id
      };

      await createBooking(formattedBookingData);
      alert('Booking created successfully!');
      navigate('/bookings');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking. Please try again.');
    }
  };

  const handleLoginClick = () => {
    navigate('/login', { state: { from: `/venues/${id}` } });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-8">
          <p className="text-gray-500">Venue not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Venue Images */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {venue.media && venue.media.length > 0 ? (
          venue.media.map((media, index) => (
            <img
              key={index}
              src={media}
              alt={media.alt || venue.name}
              className="w-full h-64 object-cover rounded-lg"
          
            />
          ))
        ) : (
          <img
            src={venue.media[0]}
            className="w-full h-64 object-cover rounded-lg"
          />
        )}
      </div>

      {/* Venue Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold mb-4">{venue.name}</h1>
          <p className="text-gray-600 mb-6">{venue.description}</p>

          {/* Location */}
          {venue.location && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Location</h2>
              <p className="text-gray-600">
                {venue.location.address && <span>{venue.location.address}, </span>}
                {venue.location.city && <span>{venue.location.city}, </span>}
                {venue.location.country && <span>{venue.location.country}</span>}
              </p>
            </div>
          )}

          {/* Amenities */}
          {venue.meta && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Amenities</h2>
              <div className="grid grid-cols-2 gap-2">
                {venue.meta.wifi && (
                  <span className="text-gray-600">✓ WiFi</span>
                )}
                {venue.meta.parking && (
                  <span className="text-gray-600">✓ Parking</span>
                )}
                {venue.meta.breakfast && (
                  <span className="text-gray-600">✓ Breakfast</span>
                )}
                {venue.meta.pets && (
                  <span className="text-gray-600">✓ Pets Allowed</span>
                )}
              </div>
            </div>
          )}

          {/* Upcoming Bookings for Venue Managers */}
          {user?.venueManager && venue?.owner && venue.owner.name === user.name && (
            <>
              {/* Venue Manager Profile Section */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Venue Manager Profile</h2>
                <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
                  <div className="flex items-center space-x-4 mb-4">
                    {user.avatar?.url ? (
                      <img
                        src={user.avatar.url}
                        alt={user.avatar.alt || user.name}
                        className="w-16 h-16 rounded-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-2xl">
                          {user.name?.charAt(0) || '?'}
                        </span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium text-lg">{user.name}</h3>
                      <p className="text-gray-600">{user.email}</p>
                      {user.bio && (
                        <p className="text-gray-600 mt-1">{user.bio}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => navigate('/profile')}
                      className="btn btn-primary"
                    >
                      Update Profile
                    </button>
                  </div>
                </div>
              </div>

              {/* Existing Upcoming Bookings Section */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Upcoming Bookings</h2>
                {upcomingBookings.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingBookings.map((booking) => (
                      <div key={booking.id} className="bg-white rounded-lg shadow p-4 border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h3 className="font-medium text-lg mb-2">Booking Details</h3>
                            <p className="text-gray-600">
                              <span className="font-medium">Check-in:</span>{' '}
                              {format(new Date(booking.dateFrom), 'MMM dd, yyyy')}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-medium">Check-out:</span>{' '}
                              {format(new Date(booking.dateTo), 'MMM dd, yyyy')}
                            </p>
                            <p className="text-gray-600">
                              <span className="font-medium">Guests:</span> {booking.guests}
                            </p>
                          </div>
                          <div>
                            <h3 className="font-medium text-lg mb-2">Customer Information</h3>
                            <div className="flex items-center space-x-3 mb-2">
                              {booking.customer?.avatar?.url ? (
                                <img
                                  src={booking.customer.avatar.url}
                                  alt={booking.customer.avatar.alt || booking.customer.name || 'Customer avatar'}
                                  className="w-10 h-10 rounded-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
                                  }}
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-gray-500 text-lg">
                                    {booking.customer?.name?.charAt(0) || '?'}
                                  </span>
                                </div>
                              )}
                              <div>
                                <p className="font-medium">{booking.customer?.name || 'Unknown'}</p>
                                <p className="text-sm text-gray-500">{booking.customer?.email || 'No email provided'}</p>
                                {booking.customer?.bio && (
                                  <p className="text-sm text-gray-500 mt-1">{booking.customer.bio}</p>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-500">
                              Booked on {format(new Date(booking.created), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-500 text-lg mb-2">No upcoming bookings</p>
                    <p className="text-sm text-gray-400">
                      Bookings will appear here when customers make reservations.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Booking Form - Only show for non-venue managers or venue managers viewing other venues */}
        {(!user?.venueManager || (user?.venueManager && venue?.owner?.name !== user.name)) && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Book this venue</h2>
            <div className="mb-4">
              <p className="text-2xl font-bold text-primary-600">
                ${venue.price}
                <span className="text-sm font-normal text-gray-600"> / night</span>
              </p>
              <p className="text-gray-600">Max guests: {venue.maxGuests}</p>
            </div>

            {isAuthenticated ? (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Check-in
                  </label>
                  <input
                    type="date"
                    name="dateFrom"
                    value={bookingData.dateFrom}
                    onChange={handleBookingChange}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="input mt-1 w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Check-out
                  </label>
                  <input
                    type="date"
                    name="dateTo"
                    value={bookingData.dateTo}
                    onChange={handleBookingChange}
                    min={bookingData.dateFrom || format(new Date(), 'yyyy-MM-dd')}
                    className="input mt-1 w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Number of Guests
                  </label>
                  <input
                    type="number"
                    name="guests"
                    value={bookingData.guests}
                    onChange={handleBookingChange}
                    min="1"
                    max={venue.maxGuests}
                    className="input mt-1 w-full"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full"
                >
                  Book Now
                </button>
              </form>
            ) : (
              <div className="text-center">
                <p className="text-gray-600 mb-4">Please log in to book this venue</p>
                <button
                  onClick={handleLoginClick}
                  className="btn btn-primary w-full"
                >
                  Login to Book
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 