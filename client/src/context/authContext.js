import { createContext, useState, useEffect } from 'react';

import axios from 'axios';

const AuthContext = createContext();

const AuthContextProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, userId, api, token, setToken, login, logout, }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthContextProvider };