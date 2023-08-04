import { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import Comment from './Comment';

import { AuthContext } from "../context/authContext";


const CommentsSection = ({ postId }) => {

    const { token, userId, api, isLoggedIn, darkMode } = useContext(AuthContext);
    
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');

    const fetchComments = useCallback(async () => {
        const response = await axios.get(`/api/post/${postId}/comments`);
        setComments(response.data);
    }, [postId])

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const navigate = useNavigate();

    const isUserAuthenticated = () => {
        return token !== null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isUserAuthenticated()) {

            await api.post(`/post/${postId}/comment`, { text: newComment });
                setNewComment('');
                fetchComments();
        } else {
            navigate('/giris');
        }
    };

  return (
    <div className={`${darkMode ? 'bg-stone-700' : 'bg-stone-400'} p-4 rounded mt-2 flex-wrap`}>
        <h3 className={`${darkMode ? 'text-stone-300' : 'text-stone-900'} text-xl mb-2`}>Comments</h3>
        {comments.map((comment) => (
            <Comment key={comment._id} comment={comment} postId={postId} refreshComments={fetchComments} userId={userId} api={api} darkMode={darkMode} />
        ))}
        <form className="flex items-center justify-between mt-2" onSubmit={handleSubmit}>
            <textarea
                type="text"
                className={`${darkMode ? 'outline-teal-600 focus:caret-teal-700 bg-neutral-300' : 'outline-teal-500 focus:caret-teal-700 bg-neutral-200'} w-96 p-1 text-sm rounded text-neutral-900 hover:shadow-lg placeholder:text-neutral-900`}
                placeholder="Write a comment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
            />
            <button type="submit" className={`${darkMode ? 'bg-teal-700 text-neutral-300 hover:bg-teal-800' : 'bg-teal-600 text-neutral-100 hover:bg-teal-700'} ml-2 py-1 px-2 text-sm rounded cursor-pointer`} onClick={() => {
                if (!isLoggedIn) {
                    navigate('/register')
                }
            }}>Send</button>
        </form>
    </div>
  )
}

export default CommentsSection;