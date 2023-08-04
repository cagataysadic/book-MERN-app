import { createContext, useState, useEffect } from 'react';

import axios from 'axios';

const AuthContext = createContext();

const AuthContextProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const storedDarkMode = localStorage.getItem('darkMode');
    return storedDarkMode === 'true' ? true : false;
  });

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');
    if (storedToken && storedUserId) {
      setIsLoggedIn(true);
      setUserId(storedUserId);
      setToken(storedToken);
    } else {
      setIsLoggedIn(false);
      setUserId(null);
      setToken(null);
    }
    
    setLoading(false);
  }, []);

  const login = (userId, token) => {
    setIsLoggedIn(true);
    setUserId(userId);
    setToken(token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserId(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
  };

  const api = axios.create({
    baseURL: '/api',
    headers: { 'Authorization': `Bearer ${token}`}
  });
  
  const toggleDarkMode = () => {
    setDarkMode(prevMode => {
      const newMode = !prevMode;
      localStorage.setItem('darkMode', newMode);
      return newMode;
    });
  };

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, userId, api, token, darkMode, setToken, login, logout, toggleDarkMode }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthContextProvider };