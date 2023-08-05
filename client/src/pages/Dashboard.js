import { Link, useNavigate } from "react-router-dom";
import { useState, useContext } from "react";
import Modal from 'react-modal';


import { AuthContext } from "../context/authContext";

const Dashboard = () => {

  const navigate = useNavigate();
  const { token, setToken, darkMode, toggleDarkMode } = useContext(AuthContext);
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
      <div className={`${darkMode ? 'bg-stone-700' : 'bg-stone-400'} pt-2.5 pb-2.5`}>
        <div className="flex justify-around items-center mx-72">
          {!token &&
            <>
              <div>
                <Link to='/register' className={`${darkMode ? 'text-stone-200 hover:text-teal-200' : 'text-stone-900 hover:text-teal-900'} text-lg transition-colors`}>Register</Link>
              </div>
              <div>
                <Link to='/login' className={`${darkMode ? 'text-stone-200 hover:text-teal-200' : 'text-stone-900 hover:text-teal-900'} text-lg transition-colors`}>Login</Link>
              </div>
            </>
          }
          {token && (
            <div className="relative flex items-center transition-colors duration-300 ease-in-out"
              onMouseEnter={() => setIsDropdownVisible(true)}
              onMouseLeave={() => setIsDropdownVisible(false)}>
              <Link to='/profile' className={`${darkMode ? 'text-stone-200 hover:text-teal-200' : 'text-stone-900 hover:text-teal-900'} text-lg transition-colors`}>Profile</Link>
              {isDropdownVisible && (
                <div className={`${darkMode ? 'bg-stone-700' : 'bg-stone-400'} absolute left-1/2 transform -translate-x-1/2 mt-56 whitespace-nowrap z-5 flex flex-col rounded-md items-center pb-5`}>
                  <Link onClick={handleDeleteAccount} className={`${darkMode ? 'text-stone-200 hover:text-teal-200' : 'text-stone-900 hover:text-teal-900'} px-4 pt-4`}>Delete Account</Link>
                  <Link to='/chat' className={`${darkMode ? 'text-stone-200 hover:text-teal-200' : 'text-stone-900 hover:text-teal-900'} px-4 pt-6`}>Chat</Link>
                  <Link onClick={handleLogout} className={`${darkMode ? 'text-stone-200 hover:text-teal-200' : 'text-stone-900 hover:text-teal-900'} px-4 pt-6`}>Logout</Link>
                  <Link to='/account-settings' className={`${darkMode ? 'text-stone-200 hover:text-teal-200' : 'text-stone-900 hover:text-teal-900'} px-4 pt-6`}>Account Settings</Link>
                </div>
              )}
            </div>
          )}
          <Link to='/' className={`${darkMode ? 'text-stone-200 hover:text-teal-200' : 'text-stone-900 hover:text-teal-900'} text-lg transition-colors`}>Home</Link>
          <Link to='/forum' className={`${darkMode ? 'text-stone-200 hover:text-teal-200' : 'text-stone-900 hover:text-teal-900'} text-lg transition-colors`}>Forum</Link>
          <button onClick={toggleDarkMode} className={`${darkMode ? 'bg-stone-300 text-stone-900 hover:bg-stone-400' : 'bg-stone-700 hover:bg-stone-800 text-stone-200'} py-1 px-2 transition-colors  text-base rounded`}>
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          className="absolute top-20 left-8 w-auto bg-neutral-400 p-7 shadow-lg z-10 rounded-xl"
          overlayClassName="content-none"
        >
          <h2 className="text-neutral-900 text-lg mx-8">Are You Sure?</h2>
          <div className="flex justify-between mt-5">
            <button onClick={confirmDeleteAccount} className="flex-1 my-0 mx-1 py-2 px-5 text-base bg-red-600 text-stone-200 rounded curser-pointer transition-colors hover:bg-red-700">Yes</button>
            <button onClick={closeModal} className="flex-1 my-0 mx-1 py-2 px-5 text-base bg-teal-600 text-stone-200 rounded curser-pointer transition-colors hover:bg-teal-700">No</button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Dashboard;