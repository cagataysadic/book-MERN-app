import { useRef, useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import "./styles/Animation.scss";


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

            auth.login(user._id, token);
            
            setEmail("");
            setPassword("");
            setErrorMessage(null);
            navigate('/profile')
        } catch (error) {
            setEmail("");
            setPassword("");
            console.log(error);
            setErrorMessage("Wrong E-Mail or Password. Please try again.")
        }
    };

    return (
        <div className="bg-zinc-900 flex w-full justify-center items-center min-h-screen">
            {errorMessage && (
                <div className="bg-red-500 text-stone-100 fixed top-16 right-5 rounded-xl py-2 px-3 text-base z-40" ref={errorPopupRef}>
                {errorMessage}
              </div>
            )}
            <form className="bg-zinc-950 lg:w-96 w-80 lg:rounded-3xl rounded-2xl py-10 flex flex-col items-center justify-center" onSubmit={handleSubmit}>
              <div className="input-border">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <input className="custom-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-Mail..." required />
              </div>
              <div className="input-border">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <input className="custom-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password..." required />
              </div>
              <button className="message-button" type="submit">
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                Login
              </button>
            </form>
        </div>
    )
};

export default Login;