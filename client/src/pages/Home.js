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
                <div className="bg-zinc-950 lg:w-1/12 w-1/6 h-screen lg:pt-24 pt-8 overflow-y-hidden">
                    <ul>
                    {genres.map((genre, index) => (
                        <li
                            key={index}
                            className={`text-teal-400 hover:text-teal-200 cursor-pointer flex flex-col items-center transition-colors lg:text-xl text-sm break-words ${selectedGenre === genre ? 'font-bold' : ''}`}
                            onClick={() => handleGenreClick(genre)}
                        >
                            {genre}
                        </li>
                        ))}
                    </ul>
                </div>
                <div className="lg:w-11/12 w-5/6 h-screen overflow-y-auto lg:pt-6 pt-3">
                    <div className="lg:pt-12 pt-8 lg:mb-2 mb-1 flex justify-center">
                        <input type="text" onChange={(e) => setSearch(e.target.value)} className="outline-teal-500 focus:caret-teal-600 bg-teal-200 text-teal-800' lg:w-full lg:max-w-xl w-64 p-1 lg:text-base text-sm lg:rounded-xl rounded-md hover:shadow-lg lg:hover:shadow-lg hover:shadow-teal-300"/>
                    </div>
                    <h1 className="text-center lg:text-4xl text-md text-teal-500 lg:mb-2 mb-1 lg:mt-5 mt-2">Welcome</h1>
                    <h2 className="text-center lg:text-2xl text-sm text-teal-500 lg:mb-7 mb-2">Our Books:</h2>
                    <ul className="home-list-masonry list-none lg:ml-12 ml-3 grid lg:gap-5 gap-1">
                        {sortedBooks.map((book) => (
                            <div key={book._id} className="home-list-item-wrapper lg:mb-5 mb-3">
                                <li className="bg-zinc-950 lg:rounded-xl rounded-2xl break-words lg:w-96 w-72 lg:p-3.5 p-2 transition-all duration-300 group rotating-border" style={{animationName: genreAnimationName(book.genre)}}>
                                    <div className="absolute inset-0 flex items-center justify-center text-center group-hover:items-start lg:p-3.5 p-3">
                                        <h3 className="lg:text-base text-sm break-all">{book.title}</h3>
                                    </div>
                                    <div className="lg:mt-8 mt-10 relative opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <h3 className="lg:text-sm text-xs lg:mb-2 mb-1">{book.author}</h3>
                                        <p className="lg:text-sm text-xs lg:mb-2 mb-1">{book.description}</p>
                                        <h3 className="lg:text-sm text-xs lg:mb-2 mb-1">{book.genre}</h3>
                                        <p className="lg:text-lg text-xs lg:mb-2 mb-1">{book.userId.userName}</p>
                                        <p className="text-xs lg:mb-2 mb-1">Created At: {formatDate(book.createdAt)}</p>
                                        {book.updatedAt && <p className="text-xs lg:mb-2 mb-1">updated At: {formatDate(book.updatedAt)}</p>}
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
