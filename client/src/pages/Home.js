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

    const { userId, isLoggedIn } = useContext(AuthContext);

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
        <div className="min-h-screen bg-stone-200 flex flex-col">
            <div className="grow flex w-full">
                <div className="w-1/5 h-screen bg-stone-300 pt-24 mx-auto overflow-y-hidden">
                    <ul>
                    {genres.map((genre, index) => (
                        <li
                            key={index}
                            className={`cursor-pointer flex flex-col items-center transition-colors text-teal-700 hover:text-teal-500 text-xl break-words ${selectedGenre === genre ? 'font-bold' : ''}`}
                            onClick={() => handleGenreClick(genre)}
                        >
                            {genre}
                        </li>
                        ))}
                    </ul>
                </div>
                <div className="w-4/5 pl-28 h-screen overflow-y-auto pt-6">
                    <div className="pt-12 mb-2 flex justify-center">
                        <input type="text" onChange={(e) => setSearch(e.target.value)} className="w-full max-w-xl p-1 text-base border-stone-100 rounded-xl outline-teal-300 focus:caret-teal-500 bg-stone-100 text-stone-800 hover:shadow-lg" />
                    </div>
                    <h1 className="text-center text-4xl mb-2 mt-5">Welcome</h1>
                    <h2 className="text-center text-2xl mb-7">Our Books:</h2>
                    <ul className="home-list-masonry list-none p-0 grid gap-5">
                        {sortedBooks.map((book) => (
                            <div key={book._id} className="home-list-item-wrapper mb-5">
                                <li className="p-3.5 rounded break-words bg-neutral-300 w-96">
                                    <h3 className="text-base mb-2.5 text-neutral-900">{book.title}</h3>
                                    <h3 className="text-sm mb-2.5 text-neutral-900">{book.author}</h3>
                                    <p className="text-sm mb-2.5 text-neutral-900">{book.description}</p>
                                    <h3 className="text-sm mb-2.5 text-neutral-900">{book.genre}</h3>
                                    <p className="text-lg mb-2.5 text-neutral-900">{book.userId.userName}</p>
                                    <p className="text-xs mb-2.5 text-neutral-900">Created At: {formatDate(book.createdAt)}</p>
                                    {book.updatedAt && <p className="text-xs mb-2.5 text-neutral-900">updated At: {formatDate(book.updatedAt)}</p>}
                                    {book.userId._id !== userId &&
                                        <div className="flex justify-center">
                                            <button className="bg-teal-500 text-stone-100 py-1 px-2 text-sm rounded cursor-pointer transition-colors hover:bg-teal-400" onClick={() => {
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
