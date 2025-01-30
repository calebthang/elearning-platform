// src/components/auth/SignUp.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/components/Signup.css';

export function SignUp() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const checkPasswordStrength = (password) => {
    if (password.length < 6) return 'weak';
    if (password.length < 10) return 'medium';
    return 'strong';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (formData.password.length < 6) {
      return setError('Password should be at least 6 characters long');
    }

    try {
      setError('');
      setLoading(true);
      await signup(formData.email, formData.password, formData.role, formData.fullName);
      navigate('/courses');
    } catch (error) {
      setError('Failed to create an account. ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = checkPasswordStrength(formData.password);

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <h2 className="signup-title">Create your account</h2>
          <p className="signup-subtitle">Join our learning platform today</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <label htmlFor="fullName" className="form-label">Full Name</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              className="form-input"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">I want to</label>
            <div className="role-selector">
              <div
                className={`role-option ${formData.role === 'student' ? 'selected' : ''}`}
                onClick={() => handleChange({ target: { name: 'role', value: 'student' } })}
              >
                <div className="role-option-icon">👨‍🎓</div>
                <div className="role-option-label">Learn as Student</div>
              </div>
              <div
                className={`role-option ${formData.role === 'instructor' ? 'selected' : ''}`}
                onClick={() => handleChange({ target: { name: 'role', value: 'instructor' } })}
              >
                <div className="role-option-icon">👨‍🏫</div>
                <div className="role-option-label">Teach as Instructor</div>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {formData.password && (
              <div className={`password-strength strength-${passwordStrength}`}>
                Password strength: {passwordStrength}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className="form-input"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="signup-button"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="signup-divider">
          <span>or</span>
        </div>

        <div className="login-link">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}