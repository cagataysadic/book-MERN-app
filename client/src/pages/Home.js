import { useState, useEffect, useContext } from "react";
import axios from 'axios';
import Masonry from 'masonry-layout';
import imagesLoaded from "imagesloaded";
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../context/authContext';
import "./styles/Animation.scss";


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

    const [filteredBooks, setFilteredBooks] = useState([]);

    useEffect(() => {
        const results = books.filter((book) => {
            return (
                (!selectedGenre || book.genre === selectedGenre) && 
                (book.title.toLowerCase().includes(search.toLocaleLowerCase()) ||
                book.author.toLowerCase().includes(search.toLocaleLowerCase()))
                );
        });
        setFilteredBooks(results);
    }, [books, search, selectedGenre]);

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
        <div className="bg-zinc-900 min-h-screen flex flex-col items-center">
            <div className="grow flex w-full">
                <div className="bg-zinc-950 w-1/12 h-screen pt-24 mx-auto overflow-y-hidden">
                    <ul>
                    {genres.map((genre, index) => (
                        <li
                            key={index}
                            className={`text-teal-400 hover:text-teal-200 cursor-pointer flex flex-col items-center transition-colors text-xl break-words ${selectedGenre === genre ? 'font-bold' : ''}`}
                            onClick={() => handleGenreClick(genre)}
                        >
                            {genre}
                        </li>
                        ))}
                    </ul>
                </div>
                <div className="w-11/12 h-screen overflow-y-auto pt-6">
                    <div className="pt-12 mb-2 flex justify-center">
                        <input type="text" onChange={(e) => setSearch(e.target.value)} className="outline-teal-500 focus:caret-teal-600 bg-teal-200 text-teal-800' w-full max-w-xl p-1 text-base rounded-xl hover:shadow-lg"/>
                    </div>
                    <h1 className="text-center text-4xl text-teal-500 mb-2 mt-5">Welcome</h1>
                    <h2 className="text-center text-2xl text-teal-500 mb-7">Our Books:</h2>
                    <ul className="home-list-masonry list-none ml-10 grid gap-5">
                        {sortedBooks.map((book) => (
                            <div key={book._id} className="home-list-item-wrapper mb-5">
                                <li className="bg-zinc-950 rounded-xl break-words w-96 p-3.5 transition-all duration-300 group hover:shadow-xl rotating-border" style={{animationName: genreAnimationName(book.genre)}}>
                                    <div className="absolute inset-0 flex items-center justify-center group-hover:items-start p-3.5">
                                        <h3 className={`text-base break-all`}>{book.title}</h3>
                                    </div>
                                    <div className="mt-8 relative opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <h3 className={` text-sm mb-2`}>{book.author}</h3>
                                        <p className={` text-sm mb-2`}>{book.description}</p>
                                        <h3 className={` text-sm mb-2`}>{book.genre}</h3>
                                        <p className={` text-lg mb-2`}>{book.userId.userName}</p>
                                        <p className={` text-xs mb-2`}>Created At: {formatDate(book.createdAt)}</p>
                                        {book.updatedAt && <p className={` text-xs mb-2`}>updated At: {formatDate(book.updatedAt)}</p>}
                                        {book.userId._id !== userId &&
                                            <div className="flex justify-center">
                                                <button className="message-button" onClick={() => {
                                                    if (!isLoggedIn) {
                                                    navigate('/register');
                                                    } else if (book.userId._id !== userId) {
                                                    navigate('/chat', { state: { chatName: book.userId.userName, otherUserId: book.userId._id } });
                                                    }
                                                }}>
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                                Message
                                                </button>
                                            </div>
                                        }
                                    </div>
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
