import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/authContext';


const AccountSettings = () => {

    const { api, darkMode } = useContext(AuthContext);
    
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
    }, [api]);

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
            setConfirmNewPassword('');
            setIsLocked(true);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className={`${darkMode ? 'bg-stone-500' : 'bg-stone-200'} items-start flex gap-8 justify-around min-h-screen p-8`}>
            {errorMessage && (
                <div className={`${darkMode ? 'bg-red-500 text-stone-200' : 'bg-red-700 text-stone-100'} fixed top-16 right-6 py-2 px-4 rounded-xl text-base z-40`} ref={errorPopupRef}>
                    {errorMessage}
                </div>
            )}
            <div className={`${darkMode ? 'bg-stone-600' : 'bg-stone-300'} my-auto self-start items-center rounded-xl box-border flex flex-col w-1/4 p-8`}>
                <h1 className={`${darkMode ? 'text-stone-200' : 'text-stone-900'} text-xl font-bold mb-6`}>Validate Password</h1>
                <form onSubmit={validateCurrentPassword}>
                    <label className='block mb-6'>
                        <input type="password" className={`${darkMode ? 'bg-stone-200' : 'bg-stone-100'} rounded-xl w-96 px-4 h-12 text-stone-900 text-lg mx-4 outline-none hover:shadow-lg`} value={password} onChange={e => setPassword(e.target.value)} required />
                    </label>
                    <button className={`${darkMode ? 'bg-teal-700 text-stone-200 hover:bg-teal-800' : 'bg-teal-500 text-stone-100 hover:bg-teal-600'} text-center rounded-lg block text-xl p-3 mx-auto transition-colors`} type="submit">Validate</button>
                </form>
            </div>
            <div className={`${darkMode ? 'bg-stone-600' : 'bg-stone-300'} my-auto self-start items-center rounded-xl box-border flex flex-col w-1/4 p-8`}>
                <h1 className={`${darkMode ? 'text-stone-200' : 'text-stone-900'} text-xl font-bold mb-6`}>Update Credentials</h1>
                <form onSubmit={handleUpdate}>
                    <label className='block mb-6'>
                        <input type="text" className={`${darkMode ? 'bg-stone-200' : 'bg-stone-100'} rounded-xl w-96 px-4 h-12 text-stone-900 text-lg mx-4 outline-none hover:shadow-lg`} value={newUsername} onChange={e => setNewUsername(e.target.value)} disabled={isLocked} />
                    </label>
                    <label className='block mb-6'>
                        <input type="email" className={`${darkMode ? 'bg-stone-200' : 'bg-stone-100'} rounded-xl w-96 px-4 h-12 text-stone-900 text-lg mx-4 outline-none hover:shadow-lg`} value={newEmail} onChange={e => setNewEmail(e.target.value)} disabled={isLocked} />
                    </label>
                    <button className={`${darkMode ? 'bg-teal-700 text-stone-200 hover:bg-teal-800' : 'bg-teal-500 text-stone-100 hover:bg-teal-600'} text-center rounded-lg block text-xl p-3 mx-auto transition-colors`} type="submit" disabled={isLocked}>Update</button>
                </form>
            </div>
            <div className={`${darkMode ? 'bg-stone-600' : 'bg-stone-300'} my-auto self-start items-center rounded-xl box-border flex flex-col w-1/4 p-8`}>
                <h2 className={`${darkMode ? 'text-stone-200' : 'text-stone-900'} text-xl font-bold mb-6`}>Update Password</h2>
                <form onSubmit={handlePasswordUpdate}>
                    <label className='block mb-6'>
                        <input type="password" className={`${darkMode ? 'bg-stone-200' : 'bg-stone-100'} rounded-xl w-96 px-4 h-12 text-stone-900 text-lg mx-4 outline-none hover:shadow-lg placeholder:text-stone-900`} placeholder='New Password...' value={newPassword} onChange={e => setNewPassword(e.target.value)} disabled={isLocked} />
                    </label>
                    <label className='block mb-6'>
                        <input type="password" className={`${darkMode ? 'bg-stone-200' : 'bg-stone-100'} rounded-xl w-96 px-4 h-12 text-stone-900 text-lg mx-4 outline-none hover:shadow-lg placeholder:text-stone-900`} placeholder='Confirm Password...' value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} disabled={isLocked} />
                    </label>
                    <button className={`${darkMode ? 'bg-teal-700 text-stone-200 hover:bg-teal-800' : 'bg-teal-500 text-stone-100 hover:bg-teal-600'} text-center rounded-lg block text-xl p-3 mx-auto transition-colors`} type="submit" disabled={isLocked}>Update</button>
                </form>
            </div>
        </div>
    );
};

export default AccountSettings;