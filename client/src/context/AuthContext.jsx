import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import api from '../api/axios.js';

const initialState = {
  user: null,
  accessToken: null,
  loading: true,
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_SUCCESS':
      return { ...state, user: action.payload.user, accessToken: action.payload.accessToken, loading: false, error: null };
    case 'AUTH_FAIL':
      return { ...state, user: null, accessToken: null, loading: false, error: action.payload };
    case 'LOGOUT':
      return { ...state, user: null, accessToken: null, loading: false, error: null };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { data } = await api.post('/auth/refresh');
        window.__kinophile_access_token = data.accessToken;
        const { data: meData } = await api.get('/auth/me');
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: meData.user, accessToken: data.accessToken },
        });
      } catch {
        dispatch({ type: 'AUTH_FAIL', payload: null });
      }
    };
    restoreSession();
  }, []);

  const register = useCallback(async ({ username, email, password }) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { data } = await api.post('/auth/register', { username, email, password });
      window.__kinophile_access_token = data.accessToken;
      dispatch({ type: 'AUTH_SUCCESS', payload: { user: data.user, accessToken: data.accessToken } });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      dispatch({ type: 'AUTH_FAIL', payload: msg });
      return { success: false, error: msg };
    }
  }, []);

  const login = useCallback(async ({ email, password }) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      window.__kinophile_access_token = data.accessToken;
      dispatch({ type: 'AUTH_SUCCESS', payload: { user: data.user, accessToken: data.accessToken } });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      dispatch({ type: 'AUTH_FAIL', payload: msg });
      return { success: false, error: msg };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      window.__kinophile_access_token = null;
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  const updateUser = useCallback((user) => {
    dispatch({ type: 'UPDATE_USER', payload: user });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        accessToken: state.accessToken,
        loading: state.loading,
        error: state.error,
        isAuthenticated: !!state.user,
        register,
        login,
        logout,
        updateUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};