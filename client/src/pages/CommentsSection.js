import { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import Comment from './Comment';
import { AuthContext } from "../context/authContext";
import "./styles/Animation.scss";


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
    <div className="bg-zinc-900 p-4 rounded mt-2 flex-wrap">
        <h3 className="text-teal-500 text-xl mb-2">Comments</h3>
        {comments.map((comment) => (
            <Comment key={comment._id} comment={comment} postId={postId} refreshComments={fetchComments} userId={userId} api={api} />
        ))}
        <form className="flex items-center justify-between mt-2" onSubmit={handleSubmit}>
            <textarea
                type="text"
                className="outline-teal-200 focus:caret-teal-800 bg-teal-200 w-96 p-1 text-sm rounded text-teal-800 hover:shadow-lg placeholder:text-text-800"
                placeholder="Write a comment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
            />
            <button type="submit" className="update-button" onClick={() => {
                if (!isLoggedIn) {
                    navigate('/register')
                }
            }}>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                Send
            </button>
        </form>
    </div>
  )
}

export default CommentsSection;