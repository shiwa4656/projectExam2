import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export default function BookingCard({ booking }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={booking.venue?.media?.[0]?.url || 'https://images.unsplash.com/photo-1716807335226-dfe1e2062db1?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
          alt={booking.venue?.name || 'Venue'}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1716807335226-dfe1e2062db1?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
          }}
        />
        <div className="absolute top-2 right-2">
          <span className="bg-primary-600 text-white px-2 py-1 rounded text-sm">
            ${booking.venue?.price}/night
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{booking.venue?.name || 'Unknown Venue'}</h3>
        <div className="space-y-2 mb-4">
          <p className="text-gray-600 text-sm">
            <span className="font-medium">Check-in:</span>{' '}
            {format(new Date(booking.dateFrom), 'MMM dd, yyyy')}
          </p>
          <p className="text-gray-600 text-sm">
            <span className="font-medium">Check-out:</span>{' '}
            {format(new Date(booking.dateTo), 'MMM dd, yyyy')}
          </p>
          <p className="text-gray-600 text-sm">
            <span className="font-medium">Guests:</span> {booking.guests}
          </p>
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => navigate(`/venues/${booking.venue?.id}`)}
            className="btn btn-primary text-sm"
          >
            View Venue
          </button>
        </div>
      </div>
    </div>
  );
} 