import { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import Comment from './Comment';

import { AuthContext } from "../context/authContext";


const CommentsSection = ({ postId }) => {

    const { token, userId, api, isLoggedIn } = useContext(AuthContext);
    
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
    <div className="bg-stone-400 p-4 rounded mt-2 flex-wrap opacity-90">
        <h3 className="text-xl mb-2">Comments</h3>
        {comments.map((comment) => (
            <Comment key={comment._id} comment={comment} postId={postId} refreshComments={fetchComments} userId={userId} api={api} />
        ))}
        <form className="flex items-center justify-between mt-2" onSubmit={handleSubmit}>
            <input
                type="text"
                className="w-96 p-1 text-sm rounded outline-none bg-neutral-200 text-neutral-900 hover:shadow-lg placeholder:text-neutral-900"
                placeholder="Write a comment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
            />
            <button type="submit" className="ml-2 py-1 px-2 text-sm rounded cursor-pointer bg-teal-600 text-neutral-100 hover:bg-teal-700" onClick={() => {
                if (!isLoggedIn) {
                    navigate('/register')
                }
            }}>Send</button>
        </form>
    </div>
  )
}

export default CommentsSection;