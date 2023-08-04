import { useState, useEffect, useContext } from "react";
import axios from 'axios';
import Masonry from 'masonry-layout';
import imagesLoaded from "imagesloaded";
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../context/authContext';


const Home = () => {
    const [books, setBooks] = useState([]);
    const [search, setSearch] = useState("");
    const [genres, setGenres] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState(null);

    const { userId, isLoggedIn, darkMode } = useContext(AuthContext);

    const navigate = useNavigate()

    useEffect(() => {
        const fetchBooks = async () => {
            const response = await axios.get('/api/book/every');
            setBooks(response.data);
            const uniqueGenres = [...new Set(response.data.map(book => book.genre))];
            setGenres(uniqueGenres);
        };
        fetchBooks();
    }, []);

    const handleGenreClick = (genre) => {
        if ( selectedGenre === genre) {
            setSelectedGenre(null);
        } else {
            setSelectedGenre(genre);
        }
    };

    const filteredBooks = books.filter((book) => {
        return (
            (!selectedGenre || book.genre === selectedGenre) && 
            (book.title.toLowerCase().includes(search.toLocaleLowerCase()) ||
            book.author.toLowerCase().includes(search.toLocaleLowerCase()))
            );
    });

    useEffect(() => {
        const initMasonry = () => {
            const grid = document.querySelector('.home-list-masonry');
            imagesLoaded(grid, function () {
                new Masonry(grid, {
                    itemSelector: '.home-list-item-wrapper',
                    columnWidth: '.home-list-item-wrapper',
                    gutter: 20,
                    percentPosition: true,
                });
            });
        };

        if (books.length > 0) {
            initMasonry();
        }

        const observer = new MutationObserver(initMasonry);
        observer.observe(document.querySelector('.home-list-masonry'), {
            childList: true,
            subtree: true,
        });

        return () => {
            observer.disconnect();
        };
    }, [books]);

    const formatDate = (date) => {
        return new Date(date).toLocaleString();
    };

    const sortedBooks = filteredBooks.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt);
        const dateB = new Date(b.updatedAt || b.createdAt);
        return dateB - dateA;
      });

    return (
        <div className={`${darkMode ? 'bg-stone-500' : 'bg-stone-200'} min-h-screen flex flex-col`}>
            <div className="grow flex w-full">
                <div className={`${darkMode ? 'bg-stone-600' : 'bg-stone-300'} w-1/5 h-screen pt-24 mx-auto overflow-y-hidden`}>
                    <ul>
                    {genres.map((genre, index) => (
                        <li
                            key={index}
                            className={`${darkMode ? 'text-teal-600 hover:text-teal-500' : 'text-teal-700 hover:text-teal-500'} cursor-pointer flex flex-col items-center transition-colors text-xl break-words ${selectedGenre === genre ? 'font-bold' : ''}`}
                            onClick={() => handleGenreClick(genre)}
                        >
                            {genre}
                        </li>
                        ))}
                    </ul>
                </div>
                <div className="w-4/5 pl-28 h-screen overflow-y-auto pt-6">
                    <div className="pt-12 mb-2 flex justify-center">
                        <input type="text" onChange={(e) => setSearch(e.target.value)} className={`${darkMode ? 'outline-teal-500 focus:caret-teal-600 bg-stone-300 text-stone-900' : 'outline-teal-300 focus:caret-teal-500 bg-stone-100 text-stone-800'} w-full max-w-xl p-1 text-base rounded-xl hover:shadow-lg`} />
                    </div>
                    <h1 className="text-center text-4xl mb-2 mt-5">Welcome</h1>
                    <h2 className="text-center text-2xl mb-7">Our Books:</h2>
                    <ul className="home-list-masonry list-none p-0 grid gap-5">
                        {sortedBooks.map((book) => (
                            <div key={book._id} className="home-list-item-wrapper mb-5">
                                <li className={`${darkMode ? 'bg-neutral-600' : 'bg-neutral-300'} p-3.5 rounded break-words w-96`}>
                                    <h3 className={`${darkMode ? 'text-stone-200' : 'text-neutral-900'} text-base mb-2.5`}>{book.title}</h3>
                                    <h3 className={`${darkMode ? 'text-stone-200' : 'text-neutral-900'} text-sm mb-2.5`}>{book.author}</h3>
                                    <p className={`${darkMode ? 'text-stone-200' : 'text-neutral-900'} text-sm mb-2.5`}>{book.description}</p>
                                    <h3 className={`${darkMode ? 'text-stone-200' : 'text-neutral-900'} text-sm mb-2.5`}>{book.genre}</h3>
                                    <p className={`${darkMode ? 'text-stone-200' : 'text-neutral-900'} text-lg mb-2.5`}>{book.userId.userName}</p>
                                    <p className={`${darkMode ? 'text-stone-200' : 'text-neutral-900'} text-xs mb-2.5`}>Created At: {formatDate(book.createdAt)}</p>
                                    {book.updatedAt && <p className={`${darkMode ? 'text-stone-200' : 'text-neutral-900'} text-xs mb-2.5`}>updated At: {formatDate(book.updatedAt)}</p>}
                                    {book.userId._id !== userId &&
                                        <div className="flex justify-center">
                                            <button className={`${darkMode ? 'bg-teal-600 text-stone-200 hover:bg-teal-700' : 'bg-teal-500 text-stone-100 hover:bg-teal-400'} py-1 px-2 text-sm rounded cursor-pointer transition-colors`} onClick={() => {
                                                if (!isLoggedIn) {
                                                navigate('/register');
                                                } else if (book.userId._id !== userId) {
                                                navigate('/chat', { state: { chatName: book.userId.userName, otherUserId: book.userId._id } });
                                                }
                                            }}>
                                            Message
                                            </button>
                                        </div>
                                    }
                                </li>
                            </div>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Home;
