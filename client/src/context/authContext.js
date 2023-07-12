// AuthContext.js
import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    if (token && userId) {
      setIsLoggedIn(true);
      setUserId(userId);
    } else {
      setIsLoggedIn(false);
      setUserId(null);
    }
  }, []);

  const login = (userId) => {
    setIsLoggedIn(true);
    setUserId(userId);
    setToken(token)
    localStorage.setItem('userId', userId);
    localStorage.setItem('token', token);
    // Consider setting the token here as well, if it is not being done elsewhere
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserId(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
