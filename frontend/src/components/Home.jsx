import axios from 'axios';
import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react'
import { Link } from 'react-router-dom';
import formatDate from '../utils/fromatDate';
import { useDispatch } from 'react-redux';

function Home() {
    const [blogs, setBlogs] = useState([]);

    async function fetchBlog() {
        const res = await axios.get(`http://localhost:3000/api/v1/blogs`)
        console.log(res?.data?.getBlogs);
        setBlogs(res?.data?.getBlogs)
    }

    useEffect(() => {
        fetchBlog();
    }, [])

    return (
        <div className='w-[50%] mb-5 flex flex-col mx-auto py-10 gap-12'>
            {
                blogs.map(blog => (
                    <Link key={blog._id} to={`blog/${blog.blogId}`}><div className=' flex items-center justify-between w-full border-b-2  border-[#3323232d]'>
                        <div className='w-[46%] flex flex-col gap-2'>
                            <div>
                                {/* <img src="" alt="" /> */}
                                <p>{blog.creator.name}</p>
                            </div>
                            <p className='font-bold text-3xl items-center'>{blog.title}</p>
                            <p className='line-clamp-2'>{blog.description}</p>
                            <div className='flex items-center gap-5 '>
                                <p>{formatDate(blog.createdAt)}</p>
                                <div className='flex gap-6 text-lg'>
                                    <div className='flex items-center gap-2'>

                                        <i className="cursor-pointer pt-1.5 fi fi-rr-social-network "></i>

                                        <p className=''>{blog.likes.length}</p>
                                    </div>

                                    <div className='flex items-center gap-2'>
                                        <i className="cursor-pointer pt-1.5 fi fi-sr-comment-alt"></i>
                                        <p className=''>{blog.comments.length}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='w-70 '>
                            <img src={`${blog.image}`} alt="" />
                        </div>
                    </div></Link>
                ))
            }
        </div>
    )
}

export default Home