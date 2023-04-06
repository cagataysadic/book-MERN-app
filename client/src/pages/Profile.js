import { useState, useEffect } from 'react';
import axios from 'axios';

import "./Profile.css"

const Profile = () => {
    const [books, setBooks] = useState([]);
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        const fetchBooks = async () => {
            const response = await axios.get('/api/books', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            setBooks(response.data);
        };
        fetchBooks();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('No token')
                return;
            }
            const response = await axios.post('/api/books', { title, author, description }, { headers: { Authorization: `Bearer ${token}`} });
            setBooks([...books, response.data]);
            setTitle('');
            setAuthor('');
            setDescription('');
        } catch (error) {
            console.log(error);
        }
    };

    const handleDelete= async (id) => {
        try {
            await axios.delete(`/api/books/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            setBooks(books.filter((book) => book._id !== id));
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className='profile-container'>
            <h1 className='profile-heading'>Welcome to your Profile Page!</h1>
            <h2 className='profile-subheading'>Enter a new book</h2>
            <form className='profile-form' onSubmit={handleSubmit}>
                <label className='profile-label'>
                    Title:
                    <input className='profile-label-input' type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </label>
                <label>
                    Author:
                    <input className='profile-label-input' type="text" value={author} onChange={(e) => setAuthor(e.target.value)} required />
                </label>
                <label>
                    Description:
                    <textarea className='profile-label-input-textarea' value={description} onChange={(e) => setDescription(e.target.value)} required />
                </label>
                <button className='profile-button' type="submit">Create</button>
            </form>
            <h2 className='profile-subheading'>Your previous Booklists</h2>
            <ul className='profile-ul'>
                {books.map((book) => (
                    <li className='profile-li' key={book._id}>
                        <h3>{book.title} by {book.author}</h3>
                        <p>{book.description}</p>
                        <p>Created by: {book.userName}</p>
                        <button className='prev-book-delete-button' onClick={() => handleDelete(book._id)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Profile;