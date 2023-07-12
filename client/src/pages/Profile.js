import { useState, useEffect } from 'react';
import axios from 'axios';
import Masonry from 'masonry-layout';
import imagesLoaded from 'imagesloaded';


import "./Profile.css"

const Profile = () => {
    const [books, setBooks] = useState([]);
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('')
    const [description, setDescription] = useState('');
    const [genre, setGenre] = useState('');
    const [updateBook, setUpdateBook] = useState(null);


    const genres = ['Mystery', 'Fantasy', 'Romance', 'Sci-Fi', 'Thriller', 'Biography', 'Non-Fiction'];

    
    useEffect(() => {
        const fetchBooks = async () => {
            const response = await axios.get('/api/book', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            setBooks(response.data);
        };
        fetchBooks();
    }, []);

    const initMasonry = (selector) => {
        const grid = document.querySelector(selector);
        imagesLoaded(grid, function () {
          new Masonry(grid, {
            itemSelector: '.profile-list-item-wrapper',
            columnWidth: '.profile-list-item-wrapper',
            gutter: 20,
            percentPosition: true,
          });
        });
    };

    // For notices
    useEffect(() => {
        if (books.length > 0) {
        initMasonry('.books-ul');
        }
    
        const observer = new MutationObserver(() => initMasonry('.books-ul'));
        observer.observe(document.querySelector('.books-ul'), {
        childList: true,
        subtree: true,
        });
    
        return () => {
        observer.disconnect();
        };
    }, [books]);
      

    useEffect(() => {
        if (updateBook) {
            setTitle(updateBook.title);
            setAuthor(updateBook.author);
            setDescription(updateBook.description);
            setGenre(updateBook.genre);
        } else {
            setTitle('');
            setAuthor('');
            setDescription('');
        }
    }, [updateBook]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('No token')
                return;
            }
            if (updateBook) {
                const response = await axios.put(`/api/book/${updateBook._id}`, { title, author, description, genre }, { headers: { Authorization: `Bearer ${token}`} });
                setBooks(books.map((book) => book._id === updateBook._id ? response.data : book));
            } else {
                const response = await axios.post('/api/book', { title, author, description, genre }, { headers: { Authorization: `Bearer ${token}`} });
                setBooks([...books, response.data]);
            }
            setTitle('');
            setAuthor('');
            setDescription('');
            setGenre('');
            setUpdateBook(null);
        } catch (error) {
            console.log(error);
        }
    };

    const handleCancelUpdate = () => {
        setTitle('');
        setAuthor('');
        setDescription('');
        setGenre('');
        setUpdateBook(null);
    };

    const handleDelete= async (id) => {
        try {
            await axios.delete(`/api/book/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            setBooks(books.filter((book) => book._id !== id));
            setUpdateBook(null);
        } catch (error) {
            console.log(error);
        }
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
    };
      


    return (
        <div className='profile-container'>
            <h1 className='profile-heading'>Welcome to Your Profile Page!</h1>
            <h2 className='profile-subheading'>Share a New Book</h2>
            <form className='profile-form' onSubmit={handleSubmit}>
                <label className='profile-label'>
                    <textarea className='profile-label-input-textarea' placeholder='Title...' value={title} onChange={(e) => setTitle(e.target.value)} required />
                </label>
                <label className='profile-label'>
                    <textarea className='profile-label-input-textarea' placeholder='Author...' value={author} onChange={(e) => setAuthor(e.target.value)} required />
                </label>
                <label>
                    <textarea className='profile-label-input-textarea' placeholder='Description...' value={description} onChange={(e) => setDescription(e.target.value)} required />
                </label>
                <label>
                    <span>Genre:</span>
                    <select value={genre} className='profile-label-select' onChange={(e) => setGenre(e.target.value)} required>
                        <option value="">Select genre...</option>
                        {genres.map((g, index) => <option key={index} values={g}>{g}</option>)}
                    </select>
                </label>
                <div className='button-wrapper'>
                    <button className='profile-button' type="submit">{updateBook ? 'Update' : 'Create'}</button>
                    <button className='profile-button' type="button" onClick={handleCancelUpdate}>Cancel</button>
                </div>
            </form>
            <h2 className='profile-subheading'>Your Previous Books</h2>
            <ul className='profile-ul books-ul'>
                {books.map((book) => (
                    <div key={book._id} className='profile-list-item-wrapper'>
                        <li className='profile-li'>
                            <h3 className='book-title'>{book.title}</h3>
                            <h3 className='book-title'>{book.author}</h3>
                            <p className='book-description'>{book.description}</p>
                            <h3 className='book-title'>{book.genre}</h3>
                            <p className='book-username'>{book.userName}</p>
                            <p className='book-timestamp'>Created at: {formatDate(book.createdAt)}</p>
                            {book.updatedAt && <p className='book-timestamp'>Updated at: {formatDate(book.updatedAt)}</p>}
                            <button className='prev-book-delete-button' onClick={() => handleDelete(book._id)}>Delete</button>
                            <button className='prev-book-edit-button' onClick={() => setUpdateBook(book)}>Update</button>
                        </li>
                    </div>
                ))}
            </ul>
        </div>
    );
};

export default Profile;