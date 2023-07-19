import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';

import "./AccountSettings.css"
import { AuthContext } from '../context/authContext';


const AccountSettings = () => {

    const { token } = useContext(AuthContext)
    const api = axios.create({
        baseURL: '/api',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    const [newUsername, setNewUsername] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [password, setPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [isLocked, setIsLocked] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);

    const errorPopupRef = useRef();

    const handleClickOutside = (e) => {
        if (errorPopupRef.current && !errorPopupRef.current.contains(e.target)) {
            setErrorMessage(null);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const validatePassword = (newPassword) => {
        
        // Minimum length of 8 characters
        if (newPassword.length < 8) return false;

        // At least one uppercase letter
        if (!/[A-Z]/.test(newPassword)) return false;

        // At least one lowercase letter
        if (!/[a-z]/.test(newPassword)) return false;

        // At least one digit
        if (!/[0-9]/.test(newPassword)) return false;
        // At least one special character
        if (!/[@$!%*?&#^()_+=[\]{}|;]/.test(newPassword)) return false;

        return true;
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get('/user/me');

                setNewUsername(response.data.userName);
                setNewEmail(response.data.email);
            } catch (error) {
                console.log(error);
            }
        };

        fetchUser();
    }, []);

    const validateCurrentPassword = async e => {
        e.preventDefault();

        try {
            const response = await api.post('/user/validate', {
                currentPassword: password
            });

            if(response.data.isValid) {
                setIsLocked(false); // Unlock fields if validation is successful
            }
            setPassword(''); // Reset password field
        } catch (error) {
            console.log(error);
        }
    };

    const handleUpdate = async e => {
        e.preventDefault();

        try {
            await api.patch('/user/update', {
                userName: newUsername,
                email: newEmail,
            });
            setPassword('');
            setIsLocked(true); // Lock fields after successful update
        } catch (error) {
            console.log(error);
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmNewPassword) {
            setErrorMessage("Passwords must match. Please try again.")
            return;
        }

        if (!validatePassword(newPassword)) {
            setErrorMessage("Your password should contain at least 8 characters, should contain a capital letter, a lower letter, a number and a special character.");
            return;
        }

        try {
            await api.patch('/user/update', {
                password: newPassword
            });
            setNewPassword('');
            setIsLocked(true);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="account-settings-container">
            {errorMessage && (
                <div className="error-popup" ref={errorPopupRef}>
                    {errorMessage}
                </div>
            )}
            <div className='validate-password-form account-settings-form'>
                <h2>Validate Password</h2>
                <form onSubmit={validateCurrentPassword}>
                    <label className='account-settings-label'>
                        Current Password:
                        <input type="password" className='account-settings-label-input' value={password} onChange={e => setPassword(e.target.value)} required />
                    </label>
                    <button className='account-settings-button' type="submit">Validate</button>
                </form>
            </div>
            <div className="update-information-form account-settings-form">
                <h2>Update Information</h2>
                <form onSubmit={handleUpdate}>
                    <label className='account-settings-label'>
                        New Username:
                        <input type="text" className='account-settings-label-input' value={newUsername} onChange={e => setNewUsername(e.target.value)} disabled={isLocked} />
                    </label>
                    <label className='account-settings-label'>
                        New Email:
                        <input type="email" className='account-settings-label-input' value={newEmail} onChange={e => setNewEmail(e.target.value)} disabled={isLocked} />
                    </label>
                    <button className='account-settings-button' type="submit" disabled={isLocked}>Update</button>
                </form>
            </div>
            <div className='update-password-form account-settings-form'>
                <h2>Update Password</h2>
                <form onSubmit={handlePasswordUpdate}>
                    <label className='account-settings-label'>
                        New Password:
                        <input type="password" className='account-settings-label-input' value={newPassword} onChange={e => setNewPassword(e.target.value)} disabled={isLocked} />
                    </label>
                    <label className='account-settings-label'>
                        Confirm New Password:
                        <input type="password" className='account-settings-label-input' value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} disabled={isLocked} />
                    </label>
                    <button className='account-settings-button' type="submit" disabled={isLocked}>Update</button>
                </form>
            </div>
        </div>
    );
};

export default AccountSettings;