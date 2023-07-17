import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "../context/authContext";

import "./Register.css"

const Register = () => {
    const [userName,setUserName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState(null);

    const auth = useContext(AuthContext);

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

            auth.login(user._id);
            
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
        <div className="register-container">
            {errorMessage && (
                <div className="error-popup" ref={errorPopupRef}>
                    {errorMessage}
                </div>
            )}
            <form className="register-form" onSubmit={handleSubmit}>
                <label className="register-label">
                    <input className="register-label-input" type="userName" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="User name..." required />
                </label>
                <label className="register-label">
                    <input className="register-label-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-Mail..." required />
                </label>
                <label className="register-label">
                    <input className="register-label-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password..." required />
                </label>
                <label className="register-label">
                    <input className="register-label-input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password..." required />
                </label>
                <div className="password-info">
                    <h3>Your password should contain at least 8 characters, should contain a capital letter, a lower letter, a number and a special character.</h3>
                </div>
                <button className="register-button" type="submit">Register</button>
            </form>
        </div>
    );
};

export default Register;