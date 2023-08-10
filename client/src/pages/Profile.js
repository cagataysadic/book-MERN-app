import { useState, useEffect, useContext } from 'react';
import Masonry from 'masonry-layout';
import imagesLoaded from 'imagesloaded';
import { AuthContext } from '../context/authContext';
import "./styles/Animation.scss";


const Profile = () => {

    const { token, api } = useContext(AuthContext);

    const [books, setBooks] = useState([]);
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('')
    const [description, setDescription] = useState('');
    const [genre, setGenre] = useState('');
    const [updateBook, setUpdateBook] = useState(null);
    
    const maxTitleLength = 40;
    const maxAuthorLength = 40;
    const maxDescritionLength = 200;


    const genres = ['Mystery', 'Fantasy', 'Romance', 'Sci-Fi', 'Thriller', 'Biography', 'Literature', 'Social-Science'];

    
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
    
      const genreAnimationName = (genre) => {
        switch (genre) {
            case 'Mystery':
                return 'rotateMysteryColor';
            case 'Fantasy':
                return 'rotateFantasyColor';
            case 'Romance':
                return 'rotateRomanceColor';
            case 'Sci-Fi':
                return 'rotateSci-FiColor';
            case 'Thriller':
                return 'rotateThrillerColor';
            case 'Biography':
                return 'rotateBiographyColor';
            case 'Literature':
                return 'rotateLiteratureColor';
            case 'Social-Science':
                return 'rotateSocial-ScienceColor';
            default:
                return 'rotateDefaultColor';
        }
    }

    return (
        <div className="bg-zinc-900 min-h-screen pt-8 flex flex-col">
            <h1 className="text-teal-500 text-center text-4xl mb-2 mt-10">Welcome to Your Profile Page!</h1>
            <h2 className="text-teal-500 text-center text-2xl mb-5 mt-4">Share a New Book</h2>
            <form className='flex flex-col items-center mb-5' onSubmit={handleSubmit}>
                <label className='flex flex-col mb-2.5 hover:shadow-lg'>
                    <textarea className="outline-teal-500 focus:caret-teal-600 rounded-xl bg-teal-200 text-teal-800 max-w-xl p-4 text-base resize-y" placeholder='Title...' value={title} maxLength={maxTitleLength} onChange={(e) => setTitle(e.target.value)} required />
                </label>
                <label className='flex flex-col mb-2.5 hover:shadow-lg'>
                    <textarea className="outline-teal-500 focus:caret-teal-600 rounded-xl bg-teal-200 text-teal-800 max-w-xl p-4 text-base resize-y" placeholder='Author...' value={author} maxLength={maxAuthorLength} onChange={(e) => setAuthor(e.target.value)} required />
                </label>
                <label className='flex flex-col mb-2.5 hover:shadow-lg'>
                    <textarea className="outline-teal-500 focus:caret-teal-600 rounded-xl bg-teal-200 text-teal-800 max-w-xl p-4 text-base resize-y" placeholder='Description...' value={description} maxLength={maxDescritionLength} onChange={(e) => setDescription(e.target.value)} required />
                </label>
                <label className='flex flex-col mb-2.5 hover:shadow-lg'>
                    <select value={genre} className="outline-teal-500 focus:caret-teal-600 rounded-xl bg-teal-200 text-teal-800 max-w-xl p-4 text-base resize-y" onChange={(e) => setGenre(e.target.value)} required>
                        <option value="">Select genre...</option>
                        {genres.map((g, index) => <option key={index} values={g}>{g}</option>)}
                    </select>
                </label>
                <div className='flex'>
                    <button className="update-button" type="submit">{updateBook ? 'Update' : 'Create'}</button>
                    <button className="delete-button" type="button" onClick={handleCancelUpdate}>Cancel</button>
                </div>
            </form>
            <h2 className="text-teal-500 text-center text-2xl mb-12 mt-4">Your Previous Books</h2>
            <ul className='books-ul list-none p-0 grid gap-5 ml-28'>
                {sortedBooks.map((book) => (
                    <div key={book._id} className='profile-list-item-wrapper mb-5'>
                        <li className="bg-zinc-950 rounded-xl break-words w-96 p-3.5 transition-all duration-300 group hover:shadow-xl rotating-border" style={{animationName: genreAnimationName(book.genre)}}>
                            <h3 className="text-base mb-2.5">{book.title}</h3>
                            <h3 className="text-sm mb-2.5">{book.author}</h3>
                            <p className="text-sm mb-2.5">{book.description}</p>
                            <h3 className="text-sm mb-2.5">{book.genre}</h3>
                            <p className="text-lg mb-2.5">{book.userId.userName}</p>
                            <p className="text-xs mb-2.5">Created at: {formatDate(book.createdAt)}</p>
                            {book.updatedAt && <p className="text-xs mb-2.5">Updated at: {formatDate(book.updatedAt)}</p>}
                            <div className='flex justify-center'>
                                <button className="delete-button" onClick={() => handleDelete(book._id)}>Delete</button>
                                <button className="update-button" onClick={() => setUpdateBook(book)}>Update</button>
                            </div>
                        </li>
                    </div>
                ))}
            </ul>
        </div>
    );
};

export default Profile;