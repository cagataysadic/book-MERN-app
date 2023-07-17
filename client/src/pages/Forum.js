import { useState, useEffect } from 'react';
import Masonry from 'masonry-layout';
import imagesLoaded from 'imagesloaded';
import axios from 'axios';
import CommentsSection from './CommentsSection';

import "./Forum.css"

const api = axios.create({
    baseURL: '/api',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });

const Forum = () => {

    const [posts, setPosts] = useState([]);
    const [search, setSearch] = useState("");
    const [updatePost, setUpdatePost] = useState(null);
    const [postText, setPostText] = useState('');
    const [showCreateForum, setShowCreateForum] = useState(false);
    const [loading, setLoading] = useState(true);

    const userId = localStorage.getItem('userId');

    const handleScroll = () => {
        const position = window.scrollY;
        if (position > 100) {
            setShowCreateForum(true);
        } else {
            setShowCreateForum(false);
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        const fetchPosts = async () => {
            const response = await axios.get('/api/post/every');
            setPosts(response.data);
            setLoading(false);
        };
        fetchPosts();
    }, []);

    const currentUserPosts = posts.filter((post) => post.userId === userId);
    const otherUserPosts = posts.filter((post) => post.userId !== userId);

    const orderedPosts = [...currentUserPosts, ...otherUserPosts];

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

    const handlePostSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('No token');
                return;
            }
            if (updatePost) {
                const response = await api.put(`/post/${updatePost._id}`, { postText });
                setPosts(posts.map((post) => post._id === updatePost._id ? response.data : post));
            } else {
                const response = await api.post('/post', { postText, userId });
                setPosts([response.data, ...posts]);
            }
            setPostText('');
            setUpdatePost(null);
        } catch (error) {
            console.log(error);
        }
    };    

    const handlePostUpdate = (post) => {
        setUpdatePost(post);
        setPostText(post.postText);
        setShowCreateForum(true);
    };

    const handlePostDelete = async (id) => {
        try {
            await api.delete(`/post/${id}`);
            setPosts(posts.filter((post) => post._id !== id));
            setUpdatePost(null);
        } catch (error) {
            console.log(error);
        }
    };

    const handleCancelPostUpdate = () => {
        setPostText('');
        setUpdatePost(null);
        setShowCreateForum(false);
    };


    const formatDate = (date) => {
        return new Date(date).toLocaleString();
    };
    

    return (
        <div className="forum-container">
            <div className="forum-search-container">
                <input type="text" placeholder="looking for a specific user..." onChange={(e) => setSearch(e.target.value)} />
            </div>
            <h1 className="forum-heading">Welcome</h1>
            {((!loading && posts.length <= 8) || showCreateForum) && (
                <div className='sticky-form-container'>
                    <h2 className='forum-subheading'>{updatePost ? "Update Post" : "Create a new post"}</h2>
                    <form className="forum-create-post-form" onSubmit={handlePostSubmit}>
                        <label className='forum-label'>
                            <textarea className='forum-label-input-textarea' placeholder='Description...' value={postText} onChange={(e) => setPostText(e.target.value)} required />
                        </label>
                        <div className='forum-button-wrapper'>
                            <button className='forum-button' type="submit">{updatePost ? 'Update' : 'Create'}</button>
                            <button className='forum-button' type="button" onClick={handleCancelPostUpdate}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}
            <h2 className="forum-subheading">Our Current Forum Posts:</h2>
            <ul className="forum-list-masonry">
                {orderedPosts &&
                    orderedPosts
                        .filter((post) => post.userName.toLowerCase().includes(search.toLocaleLowerCase()))
                        .map((post) => (
                            <div key={post._id} className='forum-list-item-wrapper'>
                                <li className="forum-list-item">
                                    {post.userId === userId ? (
                                        <>
                                        <h3 className="forum-post-description">{post.postText}</h3>
                                        <button
                                          className="prev-book-edit-button"
                                          onClick={() => handlePostUpdate(post)}
                                        >
                                          Update
                                        </button>
                                        <button
                                          className="prev-book-delete-button"
                                          onClick={() => handlePostDelete(post._id)}
                                        >
                                          Delete
                                        </button>
                                      </>
                                    ) : (
                                      <h3 className="forum-post-description">{post.postText}</h3>
                                    )}
                                    <p className="forum-post-author">{post.userName}</p>
                                    <p className="post-date">Created At: {formatDate(post.createdAt)}</p>
                                    {post.updatedAt && <p className="post-update-date">Updated At: {formatDate(post.updatedAt)}</p>}
                                    <CommentsSection postId={post._id} />
                                </li>
                            </div>
                        ))}
            </ul>
        </div>
    );
}

export default Forum;