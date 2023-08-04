import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "../context/authContext";

const Register = () => {
    const [userName,setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState(null);

    const auth = useContext(AuthContext);
    const { darkMode } = useContext(AuthContext);

    const navigate = useNavigate();
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

    const validatePassword = (password) => {
        // Minimum length of 8 characters
        if (password.length < 8) return false;

        // At least one uppercase letter
        if (!/[A-Z]/.test(password)) return false;

        // At least one lowercase letter
        if (!/[a-z]/.test(password)) return false;

        // At least one digit
        if (!/[0-9]/.test(password)) return false;

        // At least one special character
        if (!/[@$!%*?&#^()_+=[\]{}|;]/.test(password)) return false;

        return true;
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setErrorMessage("Passwords must match. Please try again.")
            return;
        }

        if (!validatePassword(password)) {
            setErrorMessage("Your password should contain at least 8 characters, should contain a capital letter, a lower letter, a number and a special character.");
            return;
        }

        try {
            const response = await axios.post("/api/user/register", { userName, email, password });
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('userId', user._id);

            auth.login(user._id, token);
            
            setErrorMessage("");
            setUserName("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
            navigate('/profile')
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className={`${darkMode ? 'bg-stone-500' : 'bg-stone-200'} flex w-full justify-center items-center min-h-screen`}>
            {errorMessage && (
                <div className={`${darkMode ? 'bg-red-500 text-stone-100' : 'bg-red-700 text-stone-200'} fixed top-16 right-5 rounded-xl py-2 px-4 text-base z-40`} ref={errorPopupRef}>
                    {errorMessage}
                </div>
            )}
            <form className={`${darkMode ? 'bg-stone-600' : 'bg-stone-300'} w-1/4 rounded-3xl py-6 flex flex-col items-center`} onSubmit={handleSubmit}>
                <label className="block my-4">
                    <input className={`${darkMode ? 'outline-teal-700 focus:caret-teal-800 bg-stone-200' : 'outline-teal-500 focus:caret-teal-700 bg-stone-100'} w-96 p-4 text-lg rounded-xl hover:shadow-lg text-stone-900 mx-auto`} type="userName" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="User name..." required />
                </label>
                <label className="block my-4">
                    <input className={`${darkMode ? 'outline-teal-700 focus:caret-teal-800 bg-stone-200' : 'outline-teal-500 focus:caret-teal-700 bg-stone-100'} w-96 p-4 text-lg rounded-xl hover:shadow-lg text-stone-900 mx-auto`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-Mail..." required />
                </label>
                <label className="block my-4">
                    <input className={`${darkMode ? 'outline-teal-700 focus:caret-teal-800 bg-stone-200' : 'outline-teal-500 focus:caret-teal-700 bg-stone-100'} w-96 p-4 text-lg rounded-xl hover:shadow-lg text-stone-900 mx-auto`} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password..." required />
                </label>
                <label className="block my-4">
                    <input className={`${darkMode ? 'outline-teal-700 focus:caret-teal-800 bg-stone-200' : 'outline-teal-500 focus:caret-teal-700 bg-stone-100'} w-96 p-4 text-lg rounded-xl hover:shadow-lg text-stone-900 mx-auto`} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password..." required />
                </label>
                <label className={`${darkMode ? 'bg-stone-300 border-teal-800' : 'bg-stone-100 border-teal-700'} w-96 my-2 mx-auto p-4 rounded-xl border-solid border-2 text-justify`}>
                    <h3 className="text-base text-stone-900 ">Your password should contain at least 8 characters, should contain a capital letter, a lower letter, a number and a special character.</h3>
                </label>
                <label className="flex justify-center w-full">
                    <button className={`${darkMode ? 'bg-teal-700 text-stone-300 hover:bg-teal-800' : 'bg-teal-600 text-stone-200 hover:bg-teal-700'} block w-1/3 p-4 mt-2 mb-4 text-xl rounded-xl cursor-pointer transition-colors`} type="submit">Register</button>
                </label>
            </form>
        </div>
    );
};

export default Register;