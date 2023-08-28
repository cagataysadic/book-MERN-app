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
    <div className="bg-neutral-300 border-2 border-teal-900 p-2 rounded-lg lg:mb-5 mb-2 flex flex-col flex-grow">
        {isEditing ? (
            <>
                <textarea 
                    type="text"
                    value={editedComment}
                    className="outline-teal-600 focus:caret-teal-700 bg-teal-100 text-teal-950 lg:w-72 w-52 p-1 my-4 mx-auto lg:text-sm text-xs rounded hover:shadow-lg placeholder:text-teal-950"
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
                <p className="text-neutral-950 lg:text-base text-sm m-1 break-words">{comment.text}</p>
                <p className="text-neutral-950 font-bold lg:text-base text-sm m-1 break-words">{comment.userId.userName}</p>
                <p className="text-neutral-950 lg:text-sm text-xs m-1">Created At: {formatDate(comment.createdAt)}</p>
                {comment.updatedAt && <p className="text-neutral-950 lg:text-sm text-xs m-1">Updated At: {formatDate(comment.updatedAt)}</p>}
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