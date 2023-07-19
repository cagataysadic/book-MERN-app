import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Forum from "./pages/Forum";
import { AuthContext } from './context/authContext';
import Message from './pages/Message';
import AccountSettings from './pages/AccountSettings';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const uid = localStorage.getItem('userId');
    if (token && uid) {
      setIsLoggedIn(true);
      setUserId(uid);
      setToken(token);
    }
  }, []);

  const login = useCallback((uid) => {
    setIsLoggedIn(true);
    setUserId(uid);
    setToken(token);
  }, []);

  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUserId(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn: isLoggedIn, userId: userId, token: token, login: login, logout: logout }}>
      <div className="App">
        <Router>
          <Dashboard />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/forum" element={<Forum />} />
            <Route path="/chat" element={<Message />}>
              <Route path=":otherUserId" element={<Message />} />
            </Route>
            <Route path="/account-settings" element={<AccountSettings />} />
          </Routes>
        </Router>
      </div>
    </AuthContext.Provider>
  );
}

export default App;
