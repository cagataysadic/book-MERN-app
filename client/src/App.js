import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Forum from "./pages/Forum";
import Message from './pages/Message';
import AccountSettings from './pages/AccountSettings';

function App() {

  
  return (
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
  );
}

export default App;
