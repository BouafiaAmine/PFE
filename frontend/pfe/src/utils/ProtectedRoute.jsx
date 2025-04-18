// frontend/pfe/src/utils/ProtectedRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token'); // or use context/auth hook

  return token ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;
