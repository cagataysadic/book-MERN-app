import { useState, useEffect, useContext } from "react";
import axios from 'axios';
import Masonry from 'masonry-layout';
import imagesLoaded from "imagesloaded";
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../context/authContext';
import { GenreContext } from "../context/genreContext";
import "./styles/Animation.scss";
import backgroundImage from "./images/background.png"


const Home = () => {
    const [books, setBooks] = useState([]);
    const [search, setSearch] = useState("");

    const { userId, isLoggedIn } = useContext(AuthContext);
    const { selectedGenre } = useContext(GenreContext);

    const navigate = useNavigate()

    useEffect(() => {
        const fetchBooks = async () => {
            const response = await axios.get('/api/book/every');
            setBooks(response.data);
        };
        fetchBooks();
    }, []);

    useEffect(() => {
        const initMasonry = () => {
            const grid = document.querySelector('.list-masonry');
            imagesLoaded(grid, function () {
                new Masonry(grid, {
                    itemSelector: '.list-item-wrapper',
                    columnWidth: '.list-item-wrapper',
                    gutter: 20,
                    percentPosition: true,
                });
            });
        };
    
        if (books.length > 0) {
            initMasonry();
        }
        
        const observer = new MutationObserver(initMasonry);
        observer.observe(document.querySelector('.list-masonry'), {
            childList: true,
            subtree: true,
        });

        return () => {
            observer.disconnect();
        };
    }, [books]);

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
        <div className="bg-neutral-200 min-h-screen lg:pt-8 pt-3 flex flex-col">
            <div className="lg:my-4 py-12 flex justify-center">
                <img src={backgroundImage} alt="background for the home page" />
            </div>
            <div className="flex justify-center mb-5">
                <input type="text" onChange={(e) => setSearch(e.target.value)} className="focus:caret-teal-600 outline-teal-600 outline-8 bg-teal-200 text-teal-800' lg:w-full lg:max-w-xl w-64 p-1 lg:text-base text-sm lg:rounded-xl rounded-md hover:shadow-lg lg:hover:shadow-lg"/>
            </div>
            <h1 className="text-center lg:text-4xl text-md text-neutral-900 lg:mb-2 mb-1 lg:mt-5 mt-2">Welcome</h1>
            <h2 className="text-center lg:text-2xl text-sm text-neutral-900 lg:mb-7 mb-2">Our Books:</h2>
            <ul className="list-masonry mx-auto">
                {sortedBooks.map((book) => (
                    <div key={book._id} className='list-item-wrapper'>
                        <li className="bg-neutral-300 text-neutral-900 lg:rounded-xl rounded-2xl break-words lg:w-96 w-72 lg:p-3.5 p-2 transition-all duration-300 rotating-border"
                            style={{animationName: genreAnimationName(book.genre)}}
                        >
                            <h3 className="lg:text-base text-center text-sm break-all">{book.title}</h3>
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
                                    Message
                                    </button>
                                </div>
                            }
                        </li>
                    </div>
                ))}
            </ul>
        </div>
    );
};

export default Home;
