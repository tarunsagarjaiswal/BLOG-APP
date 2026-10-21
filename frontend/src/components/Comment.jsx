import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setisOpen } from '../utils/commentSlice';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { setCommentAction, setCommentLikes } from '../utils/selectedBlogSlice';
import formatDate from '../utils/fromatDate';

function Comment() {
    const { _id: blogID, comments } = useSelector(state => state.selectedBlogSlice)
    const { token, id: userId } = useSelector(state => state.user)
    const dispatch = useDispatch();
    const [comment, setComment] = useState("");


    async function handleComment() {
        try {
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/blogs/comment/${blogID}`,
                {
                    comment,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                }

            );
            toast.success(res.data.message);
            dispatch(setCommentAction(res.data.newComment));
            setComment("");

            console.log(res)
        } catch (error) {
            // console.log(error.response)
            toast.error(error?.response?.data?.message);
        }
    }

    async function handleCommentLike(commentId) {
        // console.log(commentId)
        try {
            const res = await axios.patch(`${import.meta.env.VITE_BACKEND_URL}/blogs/like-comment/${commentId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            )

            toast.success(res.data.message);
            console.log(res);

            dispatch(setCommentLikes({ commentId, userId }))

        } catch (error) {
            toast(error.response.data.message)
        }
    }

    return (
        <div className='p-5 h-screen bg-white fixed top-0 z-20 right-0 border-l w-96 border-gray-300 shadow-2xl overflow-y-scroll'>
            <div className='flex justify-between items-center'>
                <h1 className='text-xl font-semibold'>Comment {comments.length}</h1>
                <i onClick={() => dispatch(setisOpen(false))} className="flex fi fi-br-cross-small text-2xl cursor-pointer"></i>
            </div>

            <div className='mt-2'>
                <textarea
                    type="text" placeholder='Comment..'
                    value={comment}
                    className='resize-none h-24 w-full p-3 focus:outline-none text-lg shadow'
                    onChange={(e) => setComment(e.target.value)} />
            </div>

            <button onClick={handleComment} className='mt-5 cursor-pointer m-3 bg-gray-600 font-semibold rounded-xl px-6 py-3 text-white'> ADD</button>

            <div className='mt-5  p-2'>
                {
                    comments.map(it => (
                        <div key={it._id}>
                            <hr className='opacity-20' />
                            <div className='flex flex-col gap-2 py-4'>
                                <div className='w-full flex justify-between'>
                                    <div className='flex gap-5'>
                                        <div className='w-9 '>
                                            <img className='rounded-full' src={`https://api.dicebear.com/10.x/initials/svg?seed=${it.user.name}`} alt="" />
                                        </div>
                                        <div>
                                            <p>{it.user.name}</p>
                                            <p>{formatDate(it.createdAt)}</p>
                                        </div>
                                    </div>

                                    <i className="cursor-pointer flex fi fi-bs-menu-dots"></i>
                                </div>

                                <p className='text-lg tracking-tight font-serif'>{it.comment}</p>

                                <div className='flex justify-between'>
                                    <div className='flex gap-5'>
                                        <div className='flex text-lg items-center gap-2'>
                                            {
                                                it.likes.includes(userId) ?
                                                    <i onClick={() => handleCommentLike(it._id)} className=" cursor-pointer fi fi-sr-thumbs-up text-blue-500"></i>
                                                    :
                                                    <i onClick={() => handleCommentLike(it._id)} className=" cursor-pointer fi fi-rr-social-network "></i>
                                            }

                                            <p className='pb-2'>{it.likes.length}</p>
                                        </div>

                                        <div className='flex text-lg items-center gap-2'>
                                            <i className=" cursor-pointer fi fi-sr-comment-alt"></i>
                                            <p className='pb-2'>5</p>
                                        </div>
                                    </div>

                                    <p className='text-sm font-semibold  cursor-pointer hover:text-gray-600  hover:underline font-serif'>reply</p>
                                </div>
                            </div>
                        </div>

                    ))
                }
            </div>
        </div>
    )
}

export default Comment