import { useState } from 'react';


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
    <div className='bg-stone-300 p-2 rounded mb-5 flex flex-col flex-grow'>
        {isEditing ? (
            <>
                <input 
                    type="text"
                    value={editedComment}
                    className='w-72 p-1 my-2 text-sm rounded outline-none bg-neutral-100 text-neutral-900 hover:shadow-lg placeholder:text-neutral-900'
                    onChange={(e) => setEditedComment(e.target.value)}
                />
                <div className="flex justify-center">
                    <button className='py-1 px-2 text-sm rounded cursor-pointer transition-colors bg-teal-600 hover:bg-teal-700 text-stone-100 mr-2' onClick={handleEdit}>Save</button>
                    <button className='py-1 px-2 text-sm rounded cursor-pointer transition-colors bg-red-600 hover:bg-red-700 text-stone-100' onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
            </>
        ) : (
            <>
                <p className='text-base break-words text-neutral-900'>{comment.text}</p>
                <p className='font-bold text-base mt-1 break-words'>{comment.userId.userName}</p>
                <p className='text-sm my-1'>Created At: {formatDate(comment.createdAt)}</p>
                {comment.updatedAt && <p className="comment-update-date">Updated At: {formatDate(comment.updatedAt)}</p>}
                {currentUserId === comment.userId._id && (
                    <div className="flex justify-center">
                        <button className='py-1 px-2 text-sm rounded cursor-pointer transition-colors bg-teal-600 hover:bg-teal-700 text-stone-100 mr-2' onClick={() => setIsEditing(true)}>Update</button>
                        <button className='py-1 px-2 text-sm rounded cursor-pointer transition-colors bg-red-600 hover:bg-red-700 text-stone-100' onClick={handleDelete}>Delete</button>
                    </div>
                )}
            </>
        )}
    </div>
  )
}

export default Comment;