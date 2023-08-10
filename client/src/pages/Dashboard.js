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
      <div className="bg-zinc-950 lg:py-2.5 sm:py-1">
        <div className="flex justify-around items-center lg:mx-72 sm:mx-24">
          {!token &&
            <>
              <div>
                <Link to='/register' className="text-teal-400 hover:text-teal-200 lg:text-lg sm:text-sm transition-colors">Register</Link>
              </div>
              <div>
                <Link to='/login' className="text-teal-400 hover:text-teal-200 lg:text-lg sm:text-sm transition-colors">Login</Link>
              </div>
            </>
          }
          {token && (
            <div className="relative flex items-center transition-colors duration-300 ease-in-out"
              onMouseEnter={() => setIsDropdownVisible(true)}
              onMouseLeave={() => setIsDropdownVisible(false)}>
              <Link to='/profile' className="text-teal-400 hover:text-teal-200 lg:text-lg sm:text-sm transition-colors">Profile</Link>
              {isDropdownVisible && (
                <div className="bg-zinc-950 absolute left-1/2 transform -translate-x-1/2 lg:mt-56 sm:mt-32 lg:text-lg sm:text-sm whitespace-nowrap z-5 flex flex-col rounded-md items-center lg:pb-5 sm:pb-1">
                  <Link onClick={handleDeleteAccount} className="text-teal-400 hover:text-teal-200 lg:px-4 lg:pt-4 sm:px-1 sm:pt-1">Delete Account</Link>
                  <Link to='/chat' className="text-teal-400 hover:text-teal-200 lg:px-4 lg:pt-6 sm:px-1 sm:pt-2">Chat</Link>
                  <Link onClick={handleLogout} className="text-teal-400 hover:text-teal-200 lg:px-4 lg:pt-6 sm:px-1 sm:pt-2">Logout</Link>
                  <Link to='/account-settings' className="text-teal-400 hover:text-teal-200 lg:px-4 lg:pt-6 sm:px-1 sm:pt-2">Account Settings</Link>
                </div>
              )}
            </div>
          )}
          <Link to='/' className="text-teal-400 hover:text-teal-200 lg:text-lg sm:text-sm transition-colors">Home</Link>
          <Link to='/forum' className="text-teal-400 hover:text-teal-200 lg:text-lg sm:text-sm transition-colors">Forum</Link>
        </div>
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          className="absolute lg:top-16 lg:left-44 sm:top-6 sm:left-12 w-auto bg-zinc-950 lg:p-8 sm:p-4 lg:shadow-lg sm:shadow-sm z-10 lg:rounded-xl sm:rounded-md"
          overlayClassName="content-none"
        >
          <h2 className="text-teal-200 lg:text-lg lg:mx-8 sm:text-sm sm:mx-2">Are You Sure?</h2>
          <div className="flex justify-between lg:mt-5 sm:mt-2">
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