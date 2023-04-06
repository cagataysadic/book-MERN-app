import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"

import "./Register.css"

const Register = () => {
    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/user/register', { userName, email, password });
            const token = response.data.token;
            localStorage.setItem('token', token);
            navigate('/profile')
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <form className="register-form" onSubmit={handleSubmit}>
            <label className="register-label">
                Name:
                <input className="register-label-input" type="userName" value={userName} onChange={(e) => setUserName(e.target.value)} required />
            </label>
            <label>
                Email:
                <input className="register-label-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label>
                Password:
                <input className="register-label-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
            <button className="register-button" type="submit">Register</button>
        </form>
    );
};

export default Register;
