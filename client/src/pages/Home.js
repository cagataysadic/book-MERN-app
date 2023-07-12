import { useState, useEffect } from "react";
import axios from 'axios';
import Masonry from 'masonry-layout';
import imagesLoaded from "imagesloaded";
import { useNavigate } from "react-router-dom";

import "./Home.css"

const Home = () => {
    const [books, setBooks] = useState([]);
    const [search, setSearch] = useState("");
    const [genres, setGenres] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState(null);

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

    return (
        <div className="home-container">
            <div className="search-container">
                    <input type="text" onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="content-container">
                <div className="left-container">
                    <div className="genre-list-container">
                        <ul className="genre-list">
                        {genres.map((genre, index) => (
                            <li
                                key={index}
                                className={`genre-item${selectedGenre === genre ? ' selected' : ''}`}
                                onClick={() => handleGenreClick(genre)}
                            >
                                {genre}
                            </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="right-container">
                    <h1 className="home-heading">Welcome</h1>
                    <h2 className="home-subheading">Our Books:</h2>
                    <ul className="home-list-masonry">
                        {filteredBooks.map((book) => (
                            <div key={book._id} className="home-list-item-wrapper">
                                <li className="home-list-item">
                                    <h3 className="book-title">{book.title}</h3>
                                    <h3 className="book-title">{book.author}</h3>
                                    <p className="book-description">{book.description}</p>
                                    <h3 className="book-title">{book.genre}</h3>
                                    <p className="book-creator">{book.userId.userName}</p>
                                    <p className="book-date">Created At: {formatDate(book.createdAt)}</p>
                                    {book.updatedAt && <p className="book-update-date">updated At: {formatDate(book.updatedAt)}</p>}
                                    <button className="message-button" onClick={() => navigate('/chat', { state: { chatName: book.userId.userName, otherUserId: book.userId._id }})}>
                                        Message
                                    </button>
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
