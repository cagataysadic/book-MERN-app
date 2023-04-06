import { useState, useEffect } from "react";
import axios from 'axios';

import "./Home.css"

const Home = () => {
    const [books, setBooks] = useState([]);
    const [search, setSearch] = useState("")

    useEffect(() => {
        const fetchBooks = async () => {
            const response = await axios.get('/api/books/every');
            setBooks(response.data)
        };
        fetchBooks();
    }, []);

    return (
        <div className="home-container">
            <div className="search-container">
                <input type="text" placeholder="looking for a spesific user..." onChange={(e) => setSearch(e.target.value)} />
            </div>
            <h1 className="home-heading">Welcome to the Valley of Books</h1>
            <h2 className="home-subheading">Discover new books:</h2>
            <ul className="home-list">
                {books && books.filter((book) => book.userName.toLowerCase().includes(search.toLocaleLowerCase())).map((book) => (
                    <li key={book._id} className="home-list-item">
                        <h3 className="home-book-title">{book.title} by {book.author}</h3>
                        <p className="home-book-description">{book.description}</p>
                        <p className="home-book-creator">Created by: {book.userName}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Home;
