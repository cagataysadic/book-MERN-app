import { useRef, useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";


const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState(null);

    const { auth, darkMode} = useContext(AuthContext);

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
        <div className={`${darkMode ? 'bg-stone-500' : 'bg-stone-200'} flex w-full justify-center items-center min-h-screen`}>
            {errorMessage && (
                <div className={`${darkMode ? 'bg-red-500 text-stone-100' : 'bg-red-700 text-stone-200'} fixed top-16 right-5 rounded-xl py-2 px-4 text-base z-40`} ref={errorPopupRef}>
                {errorMessage}
              </div>
            )}
            <form className={`${darkMode ? 'bg-stone-600' : 'bg-stone-300'} w-1/4 h-96 rounded-3xl py-6 flex flex-col items-center`} onSubmit={handleSubmit}>
                <label className="block my-12">
                    <input className={`${darkMode ? 'outline-teal-700 focus:caret-teal-800 bg-stone-200' : 'outline-teal-500 focus:caret-teal-700 bg-stone-100'} w-96 p-4 text-lg rounded-xl hover:shadow-lg text-stone-900 mx-auto`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-Mail..." required />
                </label>
                <label className="block mb-12">
                    <input className={`${darkMode ? 'outline-teal-700 focus:caret-teal-800 bg-stone-200' : 'outline-teal-500 focus:caret-teal-700 bg-stone-100'} w-96 p-4 text-lg rounded-xl hover:shadow-lg text-stone-900 mx-auto`} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password..." required />
                </label>
                <label className="flex justify-center w-full">
                    <button className={`${darkMode ? 'bg-teal-700 text-stone-300 hover:bg-teal-800' : 'bg-teal-600 text-stone-200 hover:bg-teal-700'} block w-1/3 p-4 text-xl rounded-xl cursor-pointer transition-colors`} type="submit">Login</button>
                </label>
            </form>
        </div>
    )
};

export default Login;