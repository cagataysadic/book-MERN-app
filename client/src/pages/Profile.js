import { useState, useEffect, useContext } from 'react';
import Masonry from 'masonry-layout';
import imagesLoaded from 'imagesloaded';

import { AuthContext } from '../context/authContext';


const Profile = () => {

    const { token, api } = useContext(AuthContext);

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
        <div className='min-h-screen bg-stone-200 pt-8 flex flex-col'>
            <h1 className='text-center text-4xl mb-2 mt-10 text-stone-900'>Welcome to Your Profile Page!</h1>
            <h2 className='text-center text-2xl mb-5 mt-4 text-stone-900'>Share a New Book</h2>
            <form className='flex flex-col items-center mb-5' onSubmit={handleSubmit}>
                <label className='flex flex-col mb-2.5 hover:shadow-lg'>
                    <textarea className='max-w-xl p-4 text-base outline-teal-300 focus:caret-teal-500 rounded-xl bg-stone-50 resize-y' placeholder='Title...' value={title} onChange={(e) => setTitle(e.target.value)} required />
                </label>
                <label className='flex flex-col mb-2.5 hover:shadow-lg'>
                    <textarea className='max-w-xl p-4 text-base outline-teal-300 focus:caret-teal-500 rounded-xl bg-stone-50 resize-y' placeholder='Author...' value={author} onChange={(e) => setAuthor(e.target.value)} required />
                </label>
                <label className='flex flex-col mb-2.5 hover:shadow-lg'>
                    <textarea className='max-w-xl p-4 text-base outline-teal-300 focus:caret-teal-500 rounded-xl bg-stone-50 resize-y' placeholder='Description...' value={description} onChange={(e) => setDescription(e.target.value)} required />
                </label>
                <label className='flex flex-col mb-2.5 hover:shadow-lg'>
                    <select value={genre} className=' p-4 text-base outline-teal-300 focus:caret-teal-500 rounded-xl bg-stone-50 resize-y text-stone-800' onChange={(e) => setGenre(e.target.value)} required>
                        <option value="">Select genre...</option>
                        {genres.map((g, index) => <option key={index} values={g}>{g}</option>)}
                    </select>
                </label>
                <div className='flex'>
                    <button className='py-2 px-4 m-1 text-base rounded bg-teal-500 text-stone-100 cursor-pointer transition-colors hover:bg-teal-600' type="submit">{updateBook ? 'Update' : 'Create'}</button>
                    <button className='py-2 px-4 m-1 text-base rounded bg-teal-500 text-stone-100 cursor-pointer transition-colors hover:bg-teal-600' type="button" onClick={handleCancelUpdate}>Cancel</button>
                </div>
            </form>
            <h2 className='text-center text-2xl mb-12 mt-4 text-stone-900'>Your Previous Books</h2>
            <ul className='books-ul list-none p-0 grid gap-5 ml-28'>
                {sortedBooks.map((book) => (
                    <div key={book._id} className='profile-list-item-wrapper mb-5'>
                        <li className='p-3.5 rounded break-words bg-neutral-300 w-96'>
                            <h3 className='text-base mb-2.5 text-neutral-900'>{book.title}</h3>
                            <h3 className='text-sm mb-2.5 text-neutral-900'>{book.author}</h3>
                            <p className='text-sm mb-2.5 text-neutral-900'>{book.description}</p>
                            <h3 className='text-sm mb-2.5 text-neutral-900'>{book.genre}</h3>
                            <p className='text-lg mb-2.5 text-neutral-900'>{book.userId.userName}</p>
                            <p className='text-xs mb-2.5 text-neutral-900'>Created at: {formatDate(book.createdAt)}</p>
                            {book.updatedAt && <p className='text-xs mb-2.5 text-neutral-900'>Updated at: {formatDate(book.updatedAt)}</p>}
                            <button className='py-1 px-2 text-sm rounded cursor-pointer transition-colors bg-red-600 hover:bg-red-500 text-stone-100 mr-2' onClick={() => handleDelete(book._id)}>Delete</button>
                            <button className='py-1 px-2 text-sm rounded cursor-pointer transition-colors bg-teal-600 hover:bg-teal-500 text-stone-100' onClick={() => setUpdateBook(book)}>Update</button>
                        </li>
                    </div>
                ))}
            </ul>
        </div>
    );
};

export default Profile;