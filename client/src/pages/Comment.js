import { useState } from 'react';
import "./styles/Animation.scss";


const Comment = ({ comment, postId, refreshComments, userId, api }) => {

    
    const [isEditing, setIsEditing] = useState(false);
    const [editedComment, setEditedComment] = useState(comment.text);


    const handleDelete = async () => {
        await api.delete(`/post/${postId}/comment/${comment._id}`,);
        refreshComments();
    };

    const handleEdit = async () => {
        if (editedComment) {
            await api.put(
                `/post/${postId}/comment/${comment._id}`,
                { text: editedComment }
            );
            setIsEditing(false);
            refreshComments();
        } else {
            alert("Comments must not be empty")
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString();
    };
    
    const currentUserId = userId;

  return (
    <div className="bg-zinc-800 p-2 rounded mb-5 flex flex-col flex-grow">
        {isEditing ? (
            <>
                <textarea 
                    type="text"
                    value={editedComment}
                    className="outline-teal-600 focus:caret-teal-700 bg-teal-200 text-teal-800 w-72 p-1 my-2 text-sm rounded hover:shadow-lg placeholder:text-neutral-900"
                    onChange={(e) => setEditedComment(e.target.value)}
                />
                <div className="flex justify-center">
                    <button className="update-button" onClick={handleEdit}>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        Save
                    </button>
                    <button className="delete-button" onClick={() => setIsEditing(false)}>
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        Cancel
                    </button>
                </div>
            </>
        ) : (
            <>
                <p className="text-teal-200 text-base m-1 break-words">{comment.text}</p>
                <p className="text-teal-200 font-bold text-base m-1 break-words">{comment.userId.userName}</p>
                <p className="text-teal-200 text-sm m-1">Created At: {formatDate(comment.createdAt)}</p>
                {comment.updatedAt && <p className="text-teal-200 text-sm m-1">Updated At: {formatDate(comment.updatedAt)}</p>}
                {currentUserId === comment.userId._id && (
                    <div className="flex justify-center">
                        <button className="update-button" onClick={() => setIsEditing(true)}>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            Update
                        </button>
                        <button className="delete-button" onClick={handleDelete}>
                            <span></span>
                            <span></span>
                            <span></span>
                            <span></span>
                            Delete
                        </button>
                    </div>
                )}
            </>
        )}
    </div>
  )
}

export default Comment;