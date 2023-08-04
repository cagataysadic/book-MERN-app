import { useState } from 'react';


const Comment = ({ comment, postId, refreshComments, userId, api, darkMode }) => {

    
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
    <div className={`${darkMode ? 'bg-stone-800' : 'bg-stone-300'} p-2 rounded mb-5 flex flex-col flex-grow`}>
        {isEditing ? (
            <>
                <textarea 
                    type="text"
                    value={editedComment}
                    className={`${darkMode ? 'outline-teal-600 focus:caret-teal-700 bg-neutral-300 text-neutral-900' : 'outline-teal-500 focus:caret-teal-700 bg-neutral-100 text-neutral-900'} w-72 p-1 my-2 text-sm rounded hover:shadow-lg placeholder:text-neutral-900`}
                    onChange={(e) => setEditedComment(e.target.value)}
                />
                <div className="flex justify-center">
                    <button className={`${darkMode ? 'bg-teal-700 hover:bg-teal-800 text-stone-300' : 'bg-teal-600 hover:bg-teal-700 text-stone-100'} py-1 px-2 text-sm rounded cursor-pointer transition-colors mx-2 my-1`} onClick={handleEdit}>Save</button>
                    <button className={`${darkMode ? 'bg-red-700 hover:bg-red-800 text-stone-300' : 'bg-red-600 hover:bg-red-700 text-stone-100'} py-1 px-2 text-sm rounded cursor-pointer transition-colors mx-2 my-1`} onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
            </>
        ) : (
            <>
                <p className={`${darkMode ? 'text-neutral-200' : 'text-neutral-900'} text-base m-1 break-words`}>{comment.text}</p>
                <p className={`${darkMode ? 'text-neutral-200' : 'text-neutral-900'} font-bold text-base m-1 break-words`}>{comment.userId.userName}</p>
                <p className={`${darkMode ? 'text-neutral-200' : 'text-neutral-900'} text-sm m-1`}>Created At: {formatDate(comment.createdAt)}</p>
                {comment.updatedAt && <p className={`${darkMode ? 'text-neutral-200' : 'text-neutral-900'} text-sm m-1`}>Updated At: {formatDate(comment.updatedAt)}</p>}
                {currentUserId === comment.userId._id && (
                    <div className="flex justify-center">
                        <button className={`${darkMode ? 'bg-teal-700 hover:bg-teal-800 text-stone-200' : 'bg-teal-600 hover:bg-teal-700 text-stone-100'} py-1 px-2 text-sm rounded cursor-pointer transition-colors mr-2`} onClick={() => setIsEditing(true)}>Update</button>
                        <button className={`${darkMode ? 'bg-red-700 hover:bg-red-800 text-stone-200' : 'bg-red-600 hover:bg-red-700 text-stone-100'} py-1 px-2 text-sm rounded cursor-pointer transition-colors mr-2`} onClick={handleDelete}>Delete</button>
                    </div>
                )}
            </>
        )}
    </div>
  )
}

export default Comment;