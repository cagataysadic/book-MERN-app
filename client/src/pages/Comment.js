import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import "./Comment.css"

const Comment = ({ comment, postId, refreshComments }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedComment, setEditedComment] = useState(comment.text);

    const navigate = useNavigate();
    
    const isUserAuthenticated = () => {
        const token = localStorage.getItem('token');
        return token !== null;
    }

    const isUserAuthor = () => {
        const userId = localStorage.getItem('userId'); 
        return userId === comment.userId.toString();
    }

    const handleDelete = async () => {
        if (isUserAuthenticated()) {
            if (isUserAuthor()) {
                const token = localStorage.getItem('token');
                await axios.delete(`/api/post/${postId}/comment/${comment._id}`,{
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
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
                const token = localStorage.getItem('token');
                await axios.put(
                    `/api/post/${postId}/comment/${comment._id}`,
                    { text: editedComment },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
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
                    <button className='edit-button' onClick={handleEdit}>Kaydet</button>
                    <button className='delete-button' onClick={() => setIsEditing(false)}>İptal</button>
                </div>
            </>
        ) : (
            <>
                <p>{comment.text}</p>
                <p className='comment-author'>{comment.userName}</p>
                <p className='comment-date'>Oluşturulma tarihi: {formatDate(comment.createdAt)}</p>
                {comment.updatedAt && <p className="comment-update-date">Güncellenme tarihi: {formatDate(comment.updatedAt)}</p>}
                <div className="comment-buttons">
                    <button className='edit-button' onClick={() => setIsEditing(true)}>Güncelle</button>
                    <button className='delete-button' onClick={handleDelete}>Sil</button>
                </div>
            </>
        )}
    </div>
  )
}

export default Comment;