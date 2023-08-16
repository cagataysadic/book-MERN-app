import { Link, useNavigate } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import axios from "axios";
import Modal from 'react-modal';
import "./styles/Animation.scss"


import { AuthContext } from "../context/authContext";
import { GenreContext } from "../context/genreContext";

const Dashboard = () => {

  const navigate = useNavigate();
  const { token, setToken } = useContext(AuthContext);
  const { genres, setGenres, handleGenreClick, selectedGenre } = useContext(GenreContext);
  const [isProfileDropdownVisible, setIsProfileDropdownVisible] = useState(false);
  const [isGenresDropdownVisible, setIsGenresDropdownVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    setToken(null);
    navigate('/login');
    setIsProfileDropdownVisible(false);
  };

  useEffect(() => {
    const fetchBooks = async () => {
        const response = await axios.get('/api/book/every');
        const uniqueGenres = [...new Set(response.data.map(book => book.genre))];
        setGenres(uniqueGenres);
    };
    fetchBooks();
}, [setGenres]);

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
      <div className="bg-teal-300 lg:py-2.5 py-1">
        <div className="w-1/3 flex justify-around items-center mx-auto">
          <Link to='/' className="text-neutral-900 hover:text-teal-800 lg:text-lg text-sm transition-colors">Home</Link>
          <Link to='/forum' className="text-neutral-900 hover:text-teal-800 lg:text-lg text-sm transition-colors">Forum</Link>
          <div className="relative flex items-center transition-colors duration-300 ease-in-out"
            onMouseEnter={() => setIsGenresDropdownVisible(true)}
            onMouseLeave={() => setIsGenresDropdownVisible(false)}>
            <Link to='/' className="text-neutral-900 hover:text-teal-800 lg:text-lg text-sm transition-colors">Genres</Link>
            {isGenresDropdownVisible && (
              <div className="bg-teal-300 absolute left-1/2 transform -translate-x-1/2 lg:mt-64 mt-32 lg:text-lg text-sm whitespace-nowrap z-5 flex flex-col rounded-md items-center lg:pb-3 pb-1">
                <ul>
                  {genres.map((genre, index) => (
                      <li
                          key={index}
                          className={`text-neutral-900 hover:text-teal-800 cursor-pointer flex flex-col items-center transition-colors text-sm break-words my-2 ${selectedGenre === genre ? 'font-bold' : ''}`}
                          onClick={() => handleGenreClick(genre)}
                      >
                          {genre}
                      </li>
                      ))}
                  </ul>
              </div>
            )}
          </div>
          {!token &&
            <>
              <div>
                <Link to='/register' className="text-neutral-900 hover:text-teal-800 lg:text-lg text-sm transition-colors">Register</Link>
              </div>
              <div>
                <Link to='/login' className="text-neutral-900 hover:text-teal-800 lg:text-lg text-sm transition-colors">Login</Link>
              </div>
            </>
          }
          {token && (
            <div className="relative flex items-center transition-colors duration-300 ease-in-out"
              onMouseEnter={() => setIsProfileDropdownVisible(true)}
              onMouseLeave={() => setIsProfileDropdownVisible(false)}>
              <Link to='/profile' className="text-neutral-900 hover:text-teal-800 lg:text-lg text-sm transition-colors">Profile</Link>
              {isProfileDropdownVisible && (
                <div className="bg-teal-300 absolute left-1/2 transform -translate-x-1/2 lg:mt-60 mt-32 lg:text-lg text-sm whitespace-nowrap z-5 flex flex-col rounded-md items-center lg:pb-5 pb-1">
                  <Link onClick={handleDeleteAccount} className="text-neutral-900 hover:text-teal-800 lg:px-4 lg:pt-4 px-1 pt-1">Delete Account</Link>
                  <Link to='/chat' className="text-neutral-900 hover:text-teal-800 lg:px-4 lg:pt-6 px-1 pt-2">Chat</Link>
                  <Link onClick={handleLogout} className="text-neutral-900 hover:text-teal-800 lg:px-4 lg:pt-6 px-1 pt-2">Logout</Link>
                  <Link to='/account-settings' className="text-neutral-900 hover:text-teal-800 lg:px-4 lg:pt-6 px-1 pt-2">Account Settings</Link>
                </div>
              )}
            </div>
          )}
        </div>
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          className="absolute lg:top-20 lg:left-12 top-10 left-4 h-36 w-auto bg-neutral-300 lg:p-8 p-4 lg:shadow-lg shadow-sm z-10 lg:rounded-xl rounded-lg"
          overlayClassName="content-none"
        >
          <h2 className="text-neutral-950 lg:text-lg lg:mx-8 text-sm text-center mx-2">Are You Sure?</h2>
          <div className="flex justify-between lg:mt-5 mt-2">
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