import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import "./styles/Animation.scss";

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
        if (password.length < 8) return false;

        if (!/[A-Z]/.test(password)) return false;

        if (!/[a-z]/.test(password)) return false;

        if (!/[0-9]/.test(password)) return false;

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
            if (error.response && error.response.data) {
                const { userName, email } = error.response.data;
                if (userName) {
                    setErrorMessage(userName);
                } else if (email) {
                    setErrorMessage(email);
                } else {
                    setErrorMessage("An error accured during registration. Please try again.")
                }
            }
        }
    };

    return (
        <div className="bg-neutral-200 flex justify-center items-center min-h-screen">
            {errorMessage && (
                <div className="bg-red-600 text-stone-100 fixed top-16 right-5 rounded-xl py-2 px-3 text-base z-40" ref={errorPopupRef}>
                    {errorMessage}
                </div>
            )}
            <form className="bg-neutral-300 lg:w-96 w-80 lg:rounded-3xl rounded-2xl mt-6 flex flex-col items-center" onSubmit={handleSubmit}>
                <div className="input-border bg-teal-100">
                    <input className="custom-input" type="userName" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="User name..." required />
                </div>
                <div className="input-border bg-teal-100">
                    <input className="custom-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-Mail..." required />
                </div>
                <div className="input-border bg-teal-100">
                    <input className="custom-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password..." required />
                </div>
                <div className="input-border bg-teal-100">
                    <input className="custom-input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password..." required />
                </div>
                <label className="bg-teal-200 border-teal-800 block w-5/6 my-2 mx-auto p-4 rounded-xl border-solid border-2 text-justify">
                    <h3 className="text-base text-teal-900 ">Your password should contain at least 8 characters, should contain a capital letter, a lower letter, a number and a special character.</h3>
                </label>
                <label className="flex justify-center mb-4">
                    <button className="message-button" type="submit">
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        Register
                    </button>
                </label>
            </form>
        </div>
    );
};

export default Register;