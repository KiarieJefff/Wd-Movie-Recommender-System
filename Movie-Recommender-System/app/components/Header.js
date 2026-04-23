'use client';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import AuthModal from './AuthModal';
import { useState } from 'react';

export default function Header() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const handleLogin = () => {
    setAuthMode('login');
    setShowAuthModal(true);
  };

  const handleRegister = () => {
    setAuthMode('register');
    setShowAuthModal(true);
  };

  return (
    <>
      <header style={{
        background: 'linear-gradient(135deg, #2c3e50, #34495e)',
        color: 'white',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1>🎬 Movie Database</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            style={{
              padding: '8px 12px',
              border: '1px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s ease'
            }}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#007bff',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                {user.email[0].toUpperCase()}
              </div>
              <a href="/profile" style={{ color: '#3498db', textDecoration: 'none' }}>Profile</a>
              <button onClick={logout} style={{
                padding: '8px 16px',
                border: '1px solid #007bff',
                background: 'transparent',
                color: '#007bff',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={handleLogin} style={{
                padding: '8px 16px',
                border: '1px solid #007bff',
                background: 'transparent',
                color: '#007bff',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
                Login
              </button>
              <button onClick={handleRegister} style={{
                padding: '8px 16px',
                border: '1px solid #007bff',
                background: '#007bff',
                color: 'white',
                borderRadius: '4px',
                cursor: 'pointer'
              }}>
                Register
              </button>
            </div>
          )}
        </div>
      </header>

      <AuthModal 
        show={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
      />
    </>
  );
}