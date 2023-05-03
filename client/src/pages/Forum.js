import { useState, useEffect } from 'react';
import Masonry from 'masonry-layout';
import imagesLoaded from 'imagesloaded';
import axios from 'axios';
import CommentsSection from './CommentsSection';

import "./Forum.css"

function Forum() {

    const [posts, setPosts] = useState([]);
    const [search, setSearch] = useState("")

    useEffect(() => {
        const fetchPosts = async () => {
            const response = await axios.get('/api/post/every');
            setPosts(response.data);
        };
        fetchPosts();
    }, []);

    useEffect(() => {
        const initMasonry = () => {
            const grid = document.querySelector('.forum-list-masonry');
            imagesLoaded(grid, function () {
                new Masonry(grid, {
                    itemSelector: '.forum-list-item-wrapper',
                    columnWidth: '.forum-list-item-wrapper',
                    gutter: 20,
                    percentPosition: true,
                });
            });
        };
    
        if (posts.length > 0) {
            initMasonry();
        }
        
        // Trigger Masonry layout whenever posts state changes
        const observer = new MutationObserver(initMasonry);
        observer.observe(document.querySelector('.forum-list-masonry'), {
            childList: true,
            subtree: true,
        });
    
        // Clean up the observer when the component is unmounted
        return () => {
            observer.disconnect();
        };
    }, [posts]);

    const formatDate = (date) => {
        return new Date(date).toLocaleString();
    };
    

    return (
        <div className="forum-container">
            <div className="forum-search-container">
                <input type="text" placeholder="spesifik bir forum paylaşımı mı arıyorsunuz..." onChange={(e) => setSearch(e.target.value)} />
            </div>
            <h1 className="forum-heading">Hoşgeldiniz</h1>
            <h2 className="forum-subheading">Mevcut Forum Gönderilerimiz:</h2>
            <ul className="forum-list-masonry">
                {posts &&
                    posts
                        .filter((post) => post.userName.toLowerCase().includes(search.toLocaleLowerCase()))
                        .map((post) => (
                            <div key={post._id} className='forum-list-item-wrapper'>
                                <li className="forum-list-item">
                                    <h3 className="forum-post-description">{post.postText}</h3>
                                    <p className="forum-post-author">{post.userName}</p>
                                    <p className="post-date">Oluşturulma tarihi: {formatDate(post.createdAt)}</p>
                                    {post.updatedAt && <p className="post-update-date">Güncellenme tarihi: {formatDate(post.updatedAt)}</p>}
                                    <CommentsSection postId={post._id} />
                                </li>
                            </div>
                        ))}
            </ul>
        </div>
    );
}

export default Forum;
