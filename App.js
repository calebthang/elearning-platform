// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Home } from './pages/Home';
import { Login } from './components/auth/Login';
import { SignUp } from './components/auth/Signup';
import { CourseCatalog } from './components/courses/CourseCatalog';
import { InstructorDashboard } from './components/dashboard/InstructorDashboard';
import { StudentDashboard } from './components/dashboard/StudentDashboard';
import { Navbar } from './components/layout/Navbar';
import PrivateRoute from './components/auth/PrivateRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/courses" element={<CourseCatalog />} />
            <Route
              path="/instructor/dashboard"
              element={
                <PrivateRoute>
                  <InstructorDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/student/dashboard"
              element={
                <PrivateRoute>
                  <StudentDashboard />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;