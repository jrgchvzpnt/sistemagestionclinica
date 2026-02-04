import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  loading: true,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  LOAD_USER_START: 'LOAD_USER_START',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.LOAD_USER_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOAD_USER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.LOAD_USER_FAILURE:
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      localStorage.removeItem('token');
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set up axios interceptor for token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [state.token]);

  // Load user on app start
  useEffect(() => {
    if (state.token) {
      loadUser();
    } else {
      dispatch({ type: AUTH_ACTIONS.LOAD_USER_FAILURE, payload: null });
    }
  }, []);

  // Load user function
  const loadUser = async () => {
    dispatch({ type: AUTH_ACTIONS.LOAD_USER_START });
    
    try {
      const response = await axios.get('/api/auth/me');
      dispatch({
        type: AUTH_ACTIONS.LOAD_USER_SUCCESS,
        payload: response.data,
      });
    } catch (error) {
      console.error('Load user error:', error);
      dispatch({
        type: AUTH_ACTIONS.LOAD_USER_FAILURE,
        payload: error.response?.data?.message || 'Error loading user',
      });
    }
  };

  // Default admin user for demo
  const DEFAULT_ADMIN = {
    id: 'admin-001',
    email: 'admin@insightdental.com',
    password: 'admin123',
    firstName: 'María',
    lastName: 'González',
    role: 'admin',
    position: 'Director Médico',
    permissions: [
      { module: 'dashboard', actions: ['read', 'write'] },
      { module: 'patients', actions: ['read', 'write', 'delete'] },
      { module: 'appointments', actions: ['read', 'write', 'delete'] },
      { module: 'users', actions: ['read', 'write', 'delete'] },
      { module: 'billing', actions: ['read', 'write'] },
      { module: 'reports', actions: ['read', 'write'] },
      { module: 'settings', actions: ['read', 'write'] }
    ]
  };

  // Login function
  const login = async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    // Check for default admin credentials first
    if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
      const mockToken = 'demo-admin-token-' + Date.now();
      const userData = {
        user: {
          id: DEFAULT_ADMIN.id,
          email: DEFAULT_ADMIN.email,
          firstName: DEFAULT_ADMIN.firstName,
          lastName: DEFAULT_ADMIN.lastName,
          role: DEFAULT_ADMIN.role,
          position: DEFAULT_ADMIN.position,
          permissions: DEFAULT_ADMIN.permissions
        },
        token: mockToken
      };

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: userData,
      });

      // toast.success('¡Inicio de sesión exitoso!');
      return { success: true };
    }

    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password,
      });

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: response.data,
      });

      // toast.success('¡Inicio de sesión exitoso!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Credenciales incorrectas';
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: errorMessage,
      });

      // toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: response.data,
      });

      toast.success('¡Registro exitoso!');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error en el registro';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      delete axios.defaults.headers.common['Authorization'];
      toast.info('Sesión cerrada');
    }
  };

  // Change password function
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await axios.put('/api/auth/change-password', {
        currentPassword,
        newPassword,
      });

      toast.success('Contraseña cambiada exitosamente');
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al cambiar contraseña';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Update user function
  const updateUser = (userData) => {
    dispatch({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: userData,
    });
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Check if user has permission
  const hasPermission = (module, action) => {
    if (!state.user) return false;
    if (state.user.role === 'admin') return true;

    return state.user.permissions?.some(
      (perm) => perm.module === module && perm.actions.includes(action)
    );
  };

  // Check if user has role
  const hasRole = (roles) => {
    if (!state.user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(state.user.role);
  };

  const value = {
    user: state.user,
    token: state.token,
    loading: state.loading,
    error: state.error,
    login,
    register,
    logout,
    loadUser,
    changePassword,
    updateUser,
    clearError,
    hasPermission,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
