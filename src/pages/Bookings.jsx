import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProfileBookings } from '../services/bookings';
import { deleteBooking } from '../services/bookings';

export default function Bookings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.name) {
      loadBookings();
    }
  }, [user]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const bookingsData = await getProfileBookings(user.name);
      
      if (Array.isArray(bookingsData)) {
        setBookings(bookingsData);
      } else {
        setBookings([]);
      }
    } catch (err) {
      setError('Failed to load bookings. Please try again later.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      setError('');
      await deleteBooking(bookingId);
      setBookings((prev) => prev.filter((booking) => booking.id !== bookingId));
    } catch (err) {
      setError('Failed to cancel booking. Please try again.');
    }
  };

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Please log in to view your bookings.</p>
          <button
            onClick={() => navigate('/login')}
            className="btn btn-primary"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <button
          onClick={() => navigate('/venues')}
          className="btn btn-primary"
        >
          Book a Venue
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">You haven't made any bookings yet.</p>
          <button
            onClick={() => navigate('/venues')}
            className="btn btn-primary"
          >
            Browse Venues
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="space-y-4">
                <p className="text-gray-600">
                  <span className="font-semibold">Check-in:</span>{' '}
                  {new Date(booking.dateFrom).toLocaleDateString()}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Check-out:</span>{' '}
                  {new Date(booking.dateTo).toLocaleDateString()}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Guests:</span> {booking.guests}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Created:</span>{' '}
                  {new Date(booking.created).toLocaleDateString()}
                </p>
                <div className="flex justify-end">
                  <button
                    onClick={() => handleDelete(booking.id)}
                    className="btn btn-danger"
                  >
                    Cancel Booking
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 