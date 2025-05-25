import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Home from './pages/Home';
import Venues from './pages/Venues';
import VenueDetails from './pages/VenueDetails';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateVenue from './pages/CreateVenue';
import EditVenue from './pages/EditVenue';
import Bookings from './pages/Bookings';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="venues" element={<Venues />} />
            <Route path="venues/:id" element={<VenueDetails />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="venues/create"
              element={
                <ProtectedRoute>
                  <CreateVenue />
                </ProtectedRoute>
              }
            />
            <Route
              path="edit-venue/:id"
              element={
                <ProtectedRoute>
                  <EditVenue />
                </ProtectedRoute>
              }
            />
            <Route
              path="bookings"
              element={
                <ProtectedRoute>
                  <Bookings />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
