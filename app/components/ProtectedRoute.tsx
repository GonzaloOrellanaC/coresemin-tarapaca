import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface Props {
  children: JSX.Element;
}

const isAuthenticated = () => {
  // Simple client-side check. Replace with JWT verification as needed.
  return !!localStorage.getItem('auth_token');
};

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
};

export default ProtectedRoute;
