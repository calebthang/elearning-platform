// src/components/auth/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function PrivateRoute({ children }) {
  const { currentUser } = useAuth();

  // If there's no user logged in, redirect to login page
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // If user is logged in but tries to access student dashboard while being an instructor (or vice versa)
  if (window.location.pathname.includes('/instructor/') && currentUser.role !== 'instructor') {
    return <Navigate to="/student/dashboard" />;
  }

  if (window.location.pathname.includes('/student/') && currentUser.role !== 'student') {
    return <Navigate to="/instructor/dashboard" />;
  }

  // If authenticated and proper role, render the protected component
  return children;
}