import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import "./Comment.css"


const Comment = ({ comment, postId, refreshComments, token, userId, api }) => {

    
    const [isEditing, setIsEditing] = useState(false);
    const [editedComment, setEditedComment] = useState(comment.text);

    const navigate = useNavigate();
    
    const isUserAuthenticated = () => {
        return token !== null;
    }

    const isUserAuthor = () => {
        return userId === comment.userId._id;
    }

    const handleDelete = async () => {
        if (isUserAuthenticated()) {
            if (isUserAuthor()) {
                await api.delete(`/post/${postId}/comment/${comment._id}`,);
                refreshComments();
            } else {
                alert("Sadece kendi yorumlarınızı silebilirsiniz.")
            }
        } else {
            navigate('/giris');
        }
    };

    const handleEdit = async () => {
        if (isUserAuthenticated()) {
            if (isUserAuthor()) {
                await api.put(
                    `/post/${postId}/comment/${comment._id}`,
                    { text: editedComment }
                );
                setIsEditing(false);
                refreshComments();
                } else {
                    alert("Sadece kendi yorumlarınızı güncelleyebilirsiniz.")
                }
        } else {
            navigate('/giris')
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString();
    };
    
    const currentUserId = userId;

  return (
    <div className='comment'>
        {isEditing ? (
            <>
                <input 
                    type="text"
                    value={editedComment}
                    onChange={(e) => setEditedComment(e.target.value)}
                />
                <div className="comment-buttons">
                    <button className='edit-button' onClick={handleEdit}>Save</button>
                    <button className='delete-button' onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
            </>
        ) : (
            <>
                <p>{comment.text}</p>
                <p className='comment-author'>{comment.userId.userName}</p>
                <p className='comment-date'>Created At: {formatDate(comment.createdAt)}</p>
                {comment.updatedAt && <p className="comment-update-date">Updated At: {formatDate(comment.updatedAt)}</p>}
                {currentUserId === comment.userId._id && (
                    <div className="comment-buttons">
                        <button className='edit-button' onClick={() => setIsEditing(true)}>Update</button>
                        <button className='delete-button' onClick={handleDelete}>Delete</button>
                    </div>
                )}
            </>
        )}
    </div>
  )
}

export default Comment;