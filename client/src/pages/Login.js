import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom"

import "./Login.css"

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/user/login', { email, password });
            const token = response.data.token;
            localStorage.setItem('token', token);
            navigate('/profile')
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <form className='login-form' onSubmit={handleSubmit}>
            <label className='login-label'>
                Email:
                <input className='login-label-input' type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label>
                Password:
                <input className='login-label-input' type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
            <button className='login-button' type="submit">Login</button>
        </form>
    );
};

export default Login;