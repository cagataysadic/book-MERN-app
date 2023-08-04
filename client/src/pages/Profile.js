import { useState, useEffect, useContext } from 'react';
import Masonry from 'masonry-layout';
import imagesLoaded from 'imagesloaded';

import { AuthContext } from '../context/authContext';


const Profile = () => {

    const { token, api, darkMode } = useContext(AuthContext);

    const [books, setBooks] = useState([]);
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('')
    const [description, setDescription] = useState('');
    const [genre, setGenre] = useState('');
    const [updateBook, setUpdateBook] = useState(null);


    const genres = ['Mystery', 'Fantasy', 'Romance', 'Sci-Fi', 'Thriller', 'Biography', 'Non-Fiction'];

    
    useEffect(() => {
        const fetchBooks = async () => {
            if (!api) {
                console.log('API not initialized');
                return;
            }
            try {
                const response = await api.get('/book');
                setBooks(response.data);
            } catch (err) {
                console.log('Error fetching books:', err);
            }
        };

        if (api) {
            fetchBooks();
        };

    }, [token, api]);

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
            if (!token) {
                console.log('No token')
                return;
            }
            if (updateBook) {
                const response = await api.put(`/book/${updateBook._id}`, { title, author, description, genre });
                setBooks(books.map((book) => book._id === updateBook._id ? response.data : book));
            } else {
                const response = await api.post('/book', { title, author, description, genre });
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
            await api.delete(`/book/${id}`);
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
    
    const sortedBooks = books.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt);
        const dateB = new Date(b.updatedAt || b.createdAt);
        return dateB - dateA;
      });

    return (
        <div className={`${darkMode ? 'bg-stone-500' : 'bg-stone-200'} min-h-screen pt-8 flex flex-col`}>
            <h1 className={`${darkMode ? 'text-stone-200' : 'text-stone-900'} text-center text-4xl mb-2 mt-10`}>Welcome to Your Profile Page!</h1>
            <h2 className={`${darkMode ? 'text-stone-200' : 'text-stone-900'} text-center text-2xl mb-5 mt-4`}>Share a New Book</h2>
            <form className='flex flex-col items-center mb-5' onSubmit={handleSubmit}>
                <label className='flex flex-col mb-2.5 hover:shadow-lg'>
                    <textarea className={`${darkMode ? 'outline-teal-500 focus:caret-teal-600 rounded-xl bg-stone-200 text-stone-900' : 'outline-teal-300 focus:caret-teal-500 rounded-xl bg-stone-50 text-stone-800'} max-w-xl p-4 text-base resize-y`} placeholder='Title...' value={title} onChange={(e) => setTitle(e.target.value)} required />
                </label>
                <label className='flex flex-col mb-2.5 hover:shadow-lg'>
                    <textarea className={`${darkMode ? 'outline-teal-500 focus:caret-teal-600 rounded-xl bg-stone-200 text-stone-900' : 'outline-teal-300 focus:caret-teal-500 rounded-xl bg-stone-50 text-stone-800'} max-w-xl p-4 text-base resize-y`} placeholder='Author...' value={author} onChange={(e) => setAuthor(e.target.value)} required />
                </label>
                <label className='flex flex-col mb-2.5 hover:shadow-lg'>
                    <textarea className={`${darkMode ? 'outline-teal-500 focus:caret-teal-600 rounded-xl bg-stone-200 text-stone-900' : 'outline-teal-300 focus:caret-teal-500 rounded-xl bg-stone-50 text-stone-800'} max-w-xl p-4 text-base resize-y`} placeholder='Description...' value={description} onChange={(e) => setDescription(e.target.value)} required />
                </label>
                <label className='flex flex-col mb-2.5 hover:shadow-lg'>
                    <select value={genre} className={`${darkMode ? 'outline-teal-500 focus:caret-teal-600 rounded-xl bg-stone-200 text-stone-900' : 'outline-teal-300 focus:caret-teal-500 rounded-xl bg-stone-50 text-stone-800'} max-w-xl p-4 text-base resize-y`} onChange={(e) => setGenre(e.target.value)} required>
                        <option value="">Select genre...</option>
                        {genres.map((g, index) => <option key={index} values={g}>{g}</option>)}
                    </select>
                </label>
                <div className='flex'>
                    <button className={`${darkMode ? 'bg-teal-600 text-stone-200 hover:bg-teal-500' : 'bg-teal-500 text-stone-100 hover:bg-teal-600'} py-2 px-4 my-1 mx-2 text-base rounded cursor-pointer transition-colors`} type="submit">{updateBook ? 'Update' : 'Create'}</button>
                    <button className={`${darkMode ? 'bg-teal-600 text-stone-200 hover:bg-teal-500' : 'bg-teal-500 text-stone-100 hover:bg-teal-600'} py-2 px-4 my-1 mx-2 text-base rounded cursor-pointer transition-colors`} type="button" onClick={handleCancelUpdate}>Cancel</button>
                </div>
            </form>
            <h2 className={`${darkMode ? 'text-stone-200' : 'text-stone-900'} text-center text-2xl mb-12 mt-4`}>Your Previous Books</h2>
            <ul className='books-ul list-none p-0 grid gap-5 ml-28'>
                {sortedBooks.map((book) => (
                    <div key={book._id} className='profile-list-item-wrapper mb-5'>
                        <li className={`${darkMode ? 'bg-neutral-600' : 'bg-neutral-300'} p-3.5 rounded break-words w-96`}>
                            <h3 className={`${darkMode ? 'text-neutral-200' : 'text-neutral-900'} text-base mb-2.5`}>{book.title}</h3>
                            <h3 className={`${darkMode ? 'text-neutral-200' : 'text-neutral-900'} text-sm mb-2.5`}>{book.author}</h3>
                            <p className={`${darkMode ? 'text-neutral-200' : 'text-neutral-900'} text-sm mb-2.5`}>{book.description}</p>
                            <h3 className={`${darkMode ? 'text-neutral-200' : 'text-neutral-900'} text-sm mb-2.5`}>{book.genre}</h3>
                            <p className={`${darkMode ? 'text-neutral-200' : 'text-neutral-900'} text-lg mb-2.5`}>{book.userId.userName}</p>
                            <p className={`${darkMode ? 'text-neutral-200' : 'text-neutral-900'} text-xs mb-2.5`}>Created at: {formatDate(book.createdAt)}</p>
                            {book.updatedAt && <p className={`${darkMode ? 'text-neutral-200' : 'text-neutral-900'} text-xs mb-2.5`}>Updated at: {formatDate(book.updatedAt)}</p>}
                            <div className='flex justify-center'>
                                <button className={`${darkMode ? 'bg-red-700 text-stone-200 hover:bg-red-600' : 'bg-red-600 text-stone-100 hover:bg-red-700'} py-2 px-4 m-2 text-base rounded cursor-pointer transition-colors`} onClick={() => handleDelete(book._id)}>Delete</button>
                                <button className={`${darkMode ? 'bg-teal-700 text-stone-200 hover:bg-teal-600' : 'bg-teal-600 text-stone-100 hover:bg-teal-700'} py-2 px-4 m-2 text-base rounded cursor-pointer transition-colors`} onClick={() => setUpdateBook(book)}>Update</button>
                            </div>
                        </li>
                    </div>
                ))}
            </ul>
        </div>
    );
};

export default Profile;