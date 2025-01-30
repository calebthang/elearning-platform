// src/components/auth/Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/components/Login.css';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signInWithGoogle, signInWithFacebook, signInWithGithub } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/courses');
    } catch (error) {
      setError('Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      setError('');
      setLoading(true);
      switch (provider) {
        case 'google':
          await signInWithGoogle();
          break;
        case 'facebook':
          await signInWithFacebook();
          break;
        case 'github':
          await signInWithGithub();
          break;
        default:
          throw new Error('Invalid provider');
      }
      navigate('/courses');
    } catch (error) {
      setError(`Failed to sign in with ${provider}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="signup-header">
          <h2 className="signup-title">Welcome back</h2>
          <p className="signup-subtitle">Sign in to continue learning</p>
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}

<div className="social-buttons">
              <button 
                onClick={() => handleSocialLogin('google')} 
                className="social-button google"
                disabled={loading}
              >
                <img src="/images/google-icon.png" alt="" />
                <span>Continue with Google</span>
              </button>
              
              <button 
                onClick={() => handleSocialLogin('facebook')} 
                className="social-button facebook"
                disabled={loading}
              >
                <img src="/images/facebook-icon.png" alt="" />
                <span>Continue with Facebook</span>
              </button>
              
              <button 
                onClick={() => handleSocialLogin('github')} 
                className="social-button github"
                disabled={loading}
              >
                <img src="/images/github-icon.png" alt="" />
                <span>Continue with GitHub</span>
              </button>
            </div>

        <div className="divider">
          <span>or</span>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>

          <button 
            type="submit" 
            className="signup-button"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="bottom-text">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}