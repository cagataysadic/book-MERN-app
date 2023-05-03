import { useState, useEffect } from 'react';
import axios from 'axios';
import Masonry from 'masonry-layout';
import imagesLoaded from 'imagesloaded';

import "./Profile.css"

const Profile = () => {
    const [books, setBooks] = useState([]);
    const [posts, setPosts] = useState([]);
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('')
    const [description, setDescription] = useState('');
    const [genre, setGenre] = useState('');
    const [postText, setPostText] = useState('');
    const [updateBook, setUpdateBook] = useState(null);
    const [updatePost, setUpdatePost] = useState(null);

    useEffect(() => {
        const fetchBooks = async () => {
            const response = await axios.get('/api/book', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            setBooks(response.data);
        };
        fetchBooks();
    }, []);

    useEffect(() => {
        const fetchPosts = async () => {
            const response = await axios.get('/api/post', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            setPosts(response.data);
        };
        fetchPosts();
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
    
    // For posts
    useEffect(() => {
        if (posts.length > 0) {
        initMasonry('.posts-ul');
        }
    
        const observer = new MutationObserver(() => initMasonry('.posts-ul'));
        observer.observe(document.querySelector('.posts-ul'), {
        childList: true,
        subtree: true,
        });
    
        return () => {
        observer.disconnect();
        };
    }, [posts]);
  
      

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
      

    useEffect(() => {
        if (updatePost) {
            setPostText(updatePost.postText);
        } else {
            setPostText('');
        }
    }, [updatePost]);

    const handlePostSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('No token')
                return;
            }
            if (updatePost) {
                const response = await axios.put(`/api/post/${updatePost._id}`, { postText }, { headers: { Authorization: `Bearer ${token}`} });
                setPosts(posts.map((post) => post._id === updatePost._id ? response.data : post));
            } else {
                const response = await axios.post('/api/post', { postText }, { headers: { Authorization: `Bearer ${token}`} });
                setPosts([...posts, response.data]);
            }
            setPostText('');
            setUpdatePost(null);
        } catch (error) {
            console.log(error);
        }
    };

    const handleCancelPostUpdate = () => {
        setPostText('');
        setUpdatePost(null);
    }

    const handlePostDelete = async (id) => {
        try {
            await axios.delete(`/api/post/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
            setPosts(posts.filter((post) => post._id !== id));
            setUpdatePost(null);
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
                    <textarea className='profile-label-input-textarea' placeholder='Genre...' value={genre} onChange={(e) => setGenre(e.target.value)} required />
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
            <h2 className='profile-subheading'>Yeni bir Forum gönderisi girin</h2>
            <form className='profile-form' onSubmit={handlePostSubmit}>
                <label className='profile-label'>
                    <textarea className='profile-label-input-textarea' placeholder='Description...' value={postText} onChange={(e) => setPostText(e.target.value)} required />
                </label>
                <div className='button-wrapper'>
                    <button className='profile-button' type="submit">{updatePost ? 'Update' : 'Create'}</button>
                    <button className='profile-button' type="button" onClick={handleCancelPostUpdate}>Cancel</button>
                </div>
            </form>
            <h2 className='profile-subheading'>Your Preavious Forum Posts</h2>
            <ul className='profile-ul posts-ul'>
                {posts.map((post) => (
                    <div key={post._id} className='profile-list-item-wrapper'>
                        <li className='profile-li'>
                            <p className='book-description'>{post.postText}</p>
                            <p className='book-username'>{post.userName}</p>
                            <p className='book-timestamp'>Created at: {formatDate(post.createdAt)}</p>
                            {post.updatedAt && <p className='book-timestamp'>Updated at: {formatDate(post.updatedAt)}</p>}
                            <button className='prev-book-delete-button' onClick={() => handlePostDelete(post._id)}>Delete</button>
                            <button className='prev-book-edit-button' onClick={() => setUpdatePost(post)}>Update</button>
                        </li>
                    </div>
                ))}
            </ul>
        </div>
    );
};

export default Profile;