// src/components/layout/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/components/Navbar.css';

export function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <img 
            src="/images/logo.png" 
            alt="iLearn Logo" 
            className="navbar-logo"
            style={{ 
              height: '40px',  // Adjust size as needed
              marginRight: '8px',  // Space between logo and text
              verticalAlign: 'middle'
            }}
          />
          <span>iLearn</span>
        </Link>

        <div className="navbar-links">
          <Link to="/courses" className="nav-link">
            Courses
          </Link>
          
          {currentUser ? (
            <>
              {currentUser.role === 'instructor' && (
                <Link to="/instructor/dashboard" className="nav-link">
                  Dashboard
                </Link>
              )}
              {currentUser.role === 'student' && (
                <Link to="/student/dashboard" className="nav-link">
                  My Learning
                </Link>
              )}
              <button onClick={handleLogout} className="nav-button">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-button">
                Login
              </Link>
              <Link to="/signup" className="nav-button">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}