import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Modal from 'react-modal';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    navigate('/login');
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
    <div className="dashboard-container">
      <div className="dashboard">
        <div className="center-links">
          {!token &&
            <>
              <div>
                <Link to='/register' className="dashboard-nav-link">Üye Ol</Link>
              </div>
              <div>
                <Link to='/login' className="dashboard-nav-link">Login</Link>
              </div>
            </>
          }
          {token &&
            <div className="dashboard-account">
              <Link to='/profile' className="dashboard-nav-link">Profile</Link>
              <div className="dashboard-account-dropdown">
                <Link onClick={handleDeleteAccount} className="dashboard-nav-hovered-link">Delete Account</Link>
                <Link to='/chat' className="dashboard-nav-hovered-link">Chat</Link>
                <Link onClick={handleLogout} className="dashboard-nav-hovered-link">Logout</Link>
                <Link to='/account-settings' className="dashboard-nav-hovered-link">Account Settings</Link>
              </div>
            </div>
          }
          <Link to='/' className="dashboard-nav-link">Home</Link>
          <Link to='/forum' className="dashboard-nav-link">Forum</Link>
        </div>
        <Modal
          isOpen={isModalOpen}
          onRequestClose={closeModal}
          className="delete-account-modal custom-modal"
          overlayClassName="delete-account-modal-overlay"
        >
          <h2>Hesabınızı silmek istediğinize emin misiniz?</h2>
          <div className="modal-buttons">
            <button onClick={confirmDeleteAccount} className="modal-button">Yes</button>
            <button onClick={closeModal} className="modal-button">No</button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Dashboard;