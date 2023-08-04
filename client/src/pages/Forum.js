import { useState, useEffect, useContext } from 'react';
import Masonry from 'masonry-layout';
import imagesLoaded from 'imagesloaded';
import axios from 'axios';
import CommentsSection from './CommentsSection';

import { AuthContext } from '../context/authContext';


const Forum = () => {

    const { token, userId, api, darkMode } = useContext(AuthContext);

    const [posts, setPosts] = useState([]);
    const [search, setSearch] = useState("");
    const [updatePost, setUpdatePost] = useState(null);
    const [postText, setPostText] = useState('');
    const [showCreateForum, setShowCreateForum] = useState(false);
    const [loading, setLoading] = useState(true);


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

    const currentUserPosts = posts.filter((post) => post.userId._id === userId);
    const otherUserPosts = posts.filter((post) => post.userId._id !== userId);
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
    
    const sortedPosts = orderedPosts.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt);
        const dateB = new Date(b.updatedAt || b.createdAt);
        return dateB - dateA;
      });

    return (
        <div className={`${darkMode ? 'bg-stone-500' : 'bg-stone-200'} min-h-screen pt-8 flex flex-col`}>
            <div className="pt-12 mb-2 flex mx-auto">
                <input type="text" className={`${darkMode ? 'outline-teal-500 focus:caret-teal-600 bg-stone-300' : 'outline-teal-300 focus:caret-teal-500 bg-stone-100'} w-96 h-10 p-1 text-base rounded-xl text-stone-900 placeholder:text-stone-900 hover:shadow-lg`} placeholder="looking for a specific user..." onChange={(e) => setSearch(e.target.value)} />
            </div>
            <h1 className={`${darkMode ? 'text-stone-200' : 'text-stone-900'} text-center text-4xl mb-2 mt-5`}>Welcome</h1>
            {((!loading && posts.length <= 8) || showCreateForum) && (
                <div className='sticky inset-y-12 mx-auto w-fit p-5 rounded z-40'>
                    <h2 className={`${darkMode ? 'text-stone-200' : 'text-stone-900'} text-2xl items-center text-center mb-6 opacity-80`}>{updatePost ? "Update Post" : "Create a new post"}</h2>
                    <form className="flex flex-col items-center justify-center mb-5" onSubmit={handlePostSubmit}>
                        <label className='flex flex-col items-center justify-center mb-2.5'>
                            <textarea className={`${darkMode ? 'outline-teal-500 focus:caret-teal-600 bg-stone-300 text-stone-900 placeholder:text-stone-800' : 'outline-teal-300 focus:caret-teal-500 bg-stone-100 text-stone-900 placeholder:text-stone-800'} w-96 h-36 p-2 text-base rounded-xl resize-y hover:shadow-lg opacity-80`} placeholder='Description...' value={postText} onChange={(e) => setPostText(e.target.value)} required />
                        </label>
                        <div className='flex flex-row justify-center items-center'>
                            <button className={`${darkMode ? 'bg-teal-600 text-stone-200 hover:bg-teal-500' : 'bg-teal-500 text-stone-100 hover:bg-teal-600'} py-2 px-4 my-1 mx-2 text-base rounded cursor-pointer transition-colors opacity-80`} type="submit">{updatePost ? 'Update' : 'Create'}</button>
                            <button className={`${darkMode ? 'bg-teal-600 text-stone-200 hover:bg-teal-500' : 'bg-teal-500 text-stone-100 hover:bg-teal-600'} py-2 px-4 my-1 mx-2 text-base rounded cursor-pointer transition-colors opacity-80`} type="button" onClick={handleCancelPostUpdate}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}
            <h2 className={`${darkMode ? 'text-stone-200' : 'text-stone-900'} text-center text-2xl mt-4 mb-8`}>Our Current Forum Posts:</h2>
            <ul className="forum-list-masonry list-none p-0 grid gap-5 ml-28">
                {sortedPosts &&
                    sortedPosts
                        .filter((post) => post.userId.userName.toLowerCase().includes(search.toLocaleLowerCase()))
                        .map((post) => (
                            <div key={post._id} className='forum-list-item-wrapper mb-5'>
                                <li className={`${darkMode ? 'bg-stone-600' : 'bg-stone-300'} p-3.5 rounded break-words w-96`}>
                                    {post.userId._id === userId ? (
                                        <>
                                        <h3 className={`${darkMode ? 'text-neutral-200' : 'text-neutral-900'} text-xl mb-2.5`}>{post.postText}</h3>
                                        <button
                                          className={`${darkMode ? 'bg-teal-600 text-stone-200 hover:bg-teal-500' : 'bg-teal-500 text-stone-100 hover:bg-teal-600'} py-2 px-4 my-1 mx-2 text-base rounded cursor-pointer transition-colors`}
                                          onClick={() => handlePostUpdate(post)}
                                        >
                                          Update
                                        </button>
                                        <button
                                          className={`${darkMode ? 'bg-red-600 text-stone-200 hover:bg-red-500' : 'bg-red-500 text-stone-100 hover:bg-red-600'} py-2 px-4 my-1 mx-2 text-base rounded cursor-pointer transition-colors`}
                                          onClick={() => handlePostDelete(post._id)}
                                        >
                                          Delete
                                        </button>
                                      </>
                                    ) : (
                                      <h3 className={`${darkMode ? 'text-neutral-200' : 'text-neutral-900'} text-xl mb-2.5`}>{post.postText}</h3>
                                    )}
                                    <p className={`${darkMode ? 'text-neutral-200' : 'text-neutral-900'} text-lg mb-2.5`}>{post.userId.userName}</p>
                                    <p className={`${darkMode ? 'text-neutral-200' : 'text-neutral-900'} text-xs mb-2.5`}>Created At: {formatDate(post.createdAt)}</p>
                                    {post.updatedAt && <p className={`${darkMode ? 'text-neutral-200' : 'text-neutral-900'} text-xs mb-2.5`}>Updated At: {formatDate(post.updatedAt)}</p>}
                                    <CommentsSection postId={post._id} />
                                </li>
                            </div>
                        ))}
            </ul>
        </div>
    );
}

export default Forum;