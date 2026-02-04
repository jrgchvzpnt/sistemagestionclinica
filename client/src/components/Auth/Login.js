import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './Login.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(credentials.email, credentials.password);
    } catch (error) {
      setError(error.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const fillAdminCredentials = () => {
    setCredentials({
      email: 'admin@insightdental.com',
      password: 'admin123'
    });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">
            <span className="logo-icon">🦷</span>
            <h1>InsightDental</h1>
          </div>
          <p className="tagline">Diagnósticos precisos, administración inteligente.</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <h2>Iniciar Sesión</h2>
          
          {error && (
            <div className="error-message">
              <span>⚠️</span>
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              placeholder="ejemplo@insightdental.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Ingresa tu contraseña"
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Iniciando sesión...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>

          <div className="demo-credentials">
            <p>Credenciales de demostración:</p>
            <button 
              type="button" 
              className="demo-btn"
              onClick={fillAdminCredentials}
              disabled={loading}
            >
              Usar credenciales de administrador
            </button>
          </div>
        </form>

        <div className="login-footer">
          <p>© 2026 InsightDental. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
