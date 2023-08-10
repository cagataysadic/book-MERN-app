import { Link, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import Modal from 'react-modal';
import "./styles/Animation.scss"


import { AuthContext } from "../context/authContext";

const Dashboard = () => {

  const navigate = useNavigate();
  const { token, setToken } = useContext(AuthContext);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    setToken(null);
    navigate('/login');
    setIsDropdownVisible(false);
  };

  const handleDeleteAccount = async () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const confirmDeleteAccount = async () => {
    try {
      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Error deleting account');
      }
      localStorage.removeItem('token');
      setIsModalOpen(false);
      navigate('/register');
    } catch (error) {
      console.error('Error:', error.message);
    }
  }

  return (
    <div className="fixed w-full z-50">
      <div className="bg-zinc-950 pt-2.5 pb-2.5">
        <div className="flex justify-around items-center mx-72">
          {!token &&
            <>
              <div>
                <Link to='/register' className="text-teal-400 hover:text-teal-200 text-lg transition-colors">Register</Link>
              </div>
              <div>
                <Link to='/login' className="text-teal-400 hover:text-teal-200 text-lg transition-colors">Login</Link>
              </div>
            </>
          }
          {token && (
            <div className="relative flex items-center transition-colors duration-300 ease-in-out"
              onMouseEnter={() => setIsDropdownVisible(true)}
              onMouseLeave={() => setIsDropdownVisible(false)}>
              <Link to='/profile' className="text-teal-400 hover:text-teal-200 text-lg transition-colors">Profile</Link>
              {isDropdownVisible && (
                <div className="bg-zinc-950 absolute left-1/2 transform -translate-x-1/2 mt-56 whitespace-nowrap z-5 flex flex-col rounded-md items-center pb-5">
                  <Link onClick={handleDeleteAccount} className="text-teal-400 hover:text-teal-200 px-4 pt-4">Delete Account</Link>
                  <Link to='/chat' className="text-teal-400 hover:text-teal-200 px-4 pt-6">Chat</Link>
                  <Link onClick={handleLogout} className="text-teal-400 hover:text-teal-200 px-4 pt-6">Logout</Link>
                  <Link to='/account-settings' className="text-teal-400 hover:text-teal-200 px-4 pt-6">Account Settings</Link>
                </div>
              )}
            </div>
          )}
          <Link to='/' className="text-teal-400 hover:text-teal-200 text-lg transition-colors">Home</Link>
          <Link to='/forum' className="text-teal-400 hover:text-teal-200 text-lg transition-colors">Forum</Link>
        </div>
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          className="absolute top-16 left-44 w-auto bg-zinc-950 p-7 shadow-lg z-10 rounded-xl"
          overlayClassName="content-none"
        >
          <h2 className="text-teal-200 text-lg mx-8">Are You Sure?</h2>
          <div className="flex justify-between mt-5">
            <button onClick={confirmDeleteAccount} className="delete-button">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              Yes
            </button>
            <button onClick={closeModal} className="update-button">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              No
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Dashboard;