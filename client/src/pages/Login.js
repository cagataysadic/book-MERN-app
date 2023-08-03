import { useRef, useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";


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
            setErrorMessage("Yanlış e-posta adresi veya şifre girdiniz. Lütfen tekrar deneyiniz.")
        }
    };

    return (
        <div className="flex w-full justify-center items-center min-h-screen bg-stone-200">
            {errorMessage && (
                <div className="fixed top-16 right-5 rounded-xl bg-red-700 text-stone-200 py-2 px-4 text-base z-40" ref={errorPopupRef}>
                {errorMessage}
              </div>
            )}
            <form className="w-1/4 h-96 rounded-3xl py-6 bg-stone-300 flex flex-col items-center" onSubmit={handleSubmit}>
                <label className="block my-12">
                    <input className="w-96 p-4 text-lg rounded-xl outline-teal-500 focus:caret-teal-700 hover:shadow-lg bg-stone-100 text-stone-900 mx-auto" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-Mail..." required />
                </label>
                <label className="block mb-12">
                    <input className="w-96 p-4 text-lg rounded-xl outline-teal-500 focus:caret-teal-700 hover:shadow-lg bg-stone-100 text-stone-900 mx-auto" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password..." required />
                </label>
                <label className="flex justify-center w-full">
                    <button className="block w-1/3 p-4 text-xl bg-teal-700 text-stone-200 rounded-xl cursor-pointer transition-colors hover:bg-teal-800" type="submit">Login</button>
                </label>
            </form>
        </div>
    )
};

export default Login;