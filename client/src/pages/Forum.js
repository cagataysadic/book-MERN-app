import { useState, useEffect, useContext } from 'react';
import Masonry from 'masonry-layout';
import imagesLoaded from 'imagesloaded';
import axios from 'axios';
import CommentsSection from './CommentsSection';
import { AuthContext } from '../context/authContext';
import "./styles/Animation.scss";
import forumBackgroundImage from './images/forumBackground.png';


const Forum = () => {

    const { token, userId, api } = useContext(AuthContext);

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
    
        if (posts.length > 0) {
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
    }, [posts]);

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
        <div className="bg-neutral-100  min-h-screen lg:pt-8 pt-3 flex flex-col">
            <div className="my-8 flex justify-center">
                <img src={forumBackgroundImage} alt="background for the forum page" />
            </div>
            <div className="flex justify-center mb-5">
                <input type="text" className="outline-teal-500 focus:caret-teal-600 bg-teal-200 lg:w-96 w-64 lg:h-10 h-8 p-2 lg:text-base text-sm rounded-xl text-teal-800 placeholder:text-teal-800 hover:shadow-lg hover:shadow-teal-300" placeholder="looking for a specific user..." onChange={(e) => setSearch(e.target.value)} />
            </div>
            <h1 className="text-neutral-900 text-center lg:text-4xl text-xl">Welcome</h1>
            {((!loading && posts.length <= 8) || showCreateForum) && (
                <div className='sticky lg:inset-y-12 inset-y-4 mx-auto w-fit lg:p-5 pt-6 rounded z-40'>
                    <h2 className="text-neutral-900 lg:text-2xl text-md items-center text-center lg:mb-6 mb-2 opacity-80">{updatePost ? "Update Post" : "Create a new post"}</h2>
                    <form className="flex flex-col items-center justify-center lg:mb-5 mb-2" onSubmit={handlePostSubmit}>
                        <label className='flex flex-col items-center justify-center mb-2.5'>
                            <textarea className="outline-teal-500 focus:caret-teal-600 bg-teal-200 text-teal-950 placeholder:text-teal-800' lg:w-96 w-80 lg:h-36 h-24 p-2 lg:text-base text-sm rounded-xl resize-y hover:shadow-lg hover:shadow-teal-300 opacity-80" placeholder='Description...' value={postText} onChange={(e) => setPostText(e.target.value)} required />
                        </label>
                        <div className='flex flex-row justify-center items-center'>
                            <button className="update-button" type="submit">
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                                {updatePost ? 'Update' : 'Create'}
                            </button>
                            <button className="delete-button" type="button" onClick={handleCancelPostUpdate}>
                                <span></span>
                                <span></span>
                                <span></span>
                                <span></span>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}
            {sortedPosts && sortedPosts.length > 0 && (
                <h2 className="text-neutral-900 text-center lg:text-2xl text-lg mt-4 mb-8">Our Current Forum Posts:</h2>
            )}
            <div className="list-masonry mx-auto">
                {sortedPosts &&
                    sortedPosts
                        .filter((post) => post.userId.userName.toLowerCase().includes(search.toLocaleLowerCase()))
                        .map((post) => (
                            <div key={post._id} className='list-item-wrapper'>
                                <li className="bg-neutral-200 text-neutral-900 lg:rounded-xl rounded-2xl break-words lg:w-96 w-72 lg:p-3.5 p-2 transition-all duration-300 rotating-border" style={{animationName: 'rotateDefaultColor'}}>
                                    {post.userId._id === userId ? (
                                        <>
                                        <h3 className="lg:text-xl text-sm lg:mb-2.5 mb-1">{post.postText}</h3>
                                        <button
                                        className="update-button"
                                        onClick={() => handlePostUpdate(post)}
                                        >
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        Update
                                        </button>
                                        <button
                                        className="delete-button"
                                        onClick={() => handlePostDelete(post._id)}
                                        >
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                        Delete
                                        </button>
                                    </>
                                    ) : (
                                    <h3 className="lg:text-xl text-sm lg:mb-2.5 mb-1">{post.postText}</h3>
                                    )}
                                    <p className="lg:text-lg text-xs lg:mb-2.5 mb-1">{post.userId.userName}</p>
                                    <p className="text-xs lg:mb-2.5 mb-1">Created At: {formatDate(post.createdAt)}</p>
                                    {post.updatedAt && <p className="text-xs lg:mb-2.5 mb-1">Updated At: {formatDate(post.updatedAt)}</p>}
                                    <CommentsSection postId={post._id} />
                                </li>
                            </div>
                        ))}
            </div>
        </div>
    );
}

export default Forum;