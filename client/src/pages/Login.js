import { useRef, useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";

import "./Login.css";


const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/user/login', { email, password });
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('userId', user._id);

            auth.login(user._id);
            
            setEmail("");
            setPassword("");
            setErrorMessage(null);
            navigate('/profile')
        } catch (error) {
            setEmail("");
            setPassword("");
            console.log(error);
            setErrorMessage("Yanlış e-posta adresi veya şifre girdiniz. Lütfen tekrar deneyiniz.")
        }
    };

    return (
        <div className="login-container">
            {errorMessage && (
                <div className="error-popup" ref={errorPopupRef}>
                {errorMessage}
              </div>
            )}
            <form className="login-form" onSubmit={handleSubmit}>
                <label className="login-label">
                    <input className="login-label-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e-posta adresiniz..." required />
                </label>
                <label className="login-label">
                    <input className="login-label-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Şifreniz..." required />
                </label>
                <div className="login-button-wrapper">
                <button className="login-button" type="submit">Giriş</button>
                </div>
            </form>
        </div>
    )
};

export default Login;