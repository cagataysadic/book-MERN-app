import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import Comment from './Comment';

import "./CommentsSection.css"


const CommentsSection = ({ postId }) => {
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
        const token = localStorage.getItem('token');
        return token !== null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isUserAuthenticated()) {
            const token = localStorage.getItem('token');

            await axios.post(`/api/post/${postId}/comment`, { text: newComment },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
                );
                setNewComment('');
                fetchComments();
        } else {
            navigate('/giris');
        }
    };

  return (
    <div className="comments-section">
        <h3>Comments</h3>
        {comments.map((comment) => (
            <Comment key={comment._id} comment={comment} postId={postId} refreshComments={fetchComments} />
        ))}
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Write a comment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
            />
            <button type="submit">Send</button>
        </form>
    </div>
  )
}

export default CommentsSection;