import { useNavigate } from 'react-router-dom';
import { deleteVenue } from '../services/venues';

export default function VenueCard({ venue, onDelete }) {
  const navigate = useNavigate();

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this venue? This action cannot be undone.')) {
      try {
        await deleteVenue(venue.id);
        if (onDelete) {
          onDelete(venue.id);
        }
      } catch (error) {
        alert('Failed to delete venue. Please try again.');
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={venue.media?.[0]?.url || 'https://images.unsplash.com/photo-1716807335226-dfe1e2062db1?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
          alt={venue.name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1716807335226-dfe1e2062db1?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
          }}
        />
        <div className="absolute top-2 right-2">
          <span className="bg-primary-600 text-white px-2 py-1 rounded text-sm">
            ${venue.price}/night
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{venue.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {venue.description}
        </p>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {venue.maxGuests} guests
            </span>
            {venue.rating > 0 && (
              <span className="text-sm text-gray-600">
                • {venue.rating}/5 rating
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => navigate(`/venues/${venue.id}`)}
              className="btn btn-secondary text-sm"
            >
              View
            </button>
            <button
              onClick={() => navigate(`/edit-venue/${venue.id}`)}
              className="btn btn-primary text-sm"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="btn btn-danger text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 