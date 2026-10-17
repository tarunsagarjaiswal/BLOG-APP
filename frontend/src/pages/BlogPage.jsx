import axios from 'axios';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { Link, resolvePath, useParams } from 'react-router-dom'
import { addSelectedBlog, changeLikes, removeSelectedBlog } from '../utils/selectedBlogSlice';
import Comment from '../components/Comment';
import { setisOpen } from '../utils/commentSlice';

function BlogPage() {
    const { id } = useParams();

    const [blogData, setBlogData] = useState(null);
    const [isLike, setIsLike] = useState(false)

    const { token, email, id: userId } = useSelector((state) => state.user)
    const { likes, comments, content } = useSelector(state => state.selectedBlogSlice)
    const { isOpen } = useSelector(state => state.commentSlice)

    const dispatch = useDispatch()

    async function handleLike() {
        if (token) {
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/blogs/like/${blogData._id}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            console.log(res)
            dispatch(changeLikes(userId))

            setIsLike(prev => !prev);

            toast.success(res?.data?.message)
            console.log(blogData.likes.includes(userId))
        }

        else {
            toast.error("please Sign In for liking the Blogs..");
        }
    }

    async function fetchBlogById() {
        try {
            const { data: { getBlog, message } } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/blogs/${id}`)
            console.log(getBlog);

            toast.success(message);
            setBlogData(getBlog);

            if (getBlog.likes.includes(userId) == true) {
                setIsLike(prev => !prev);
            }

            dispatch(addSelectedBlog(getBlog))

        } catch (error) {
            toast.error(error?.response?.data?.message);

        }
    }

    useEffect(() => {
        fetchBlogById();

        //window.location.pathname  -->  gives you the current route or path.
        //location -->  gives you the previously route or path.

        return () => {
            if (!(window.location.pathname != `/edit/${id}` || window.location.pathname != `/blog/${id}`)) {
                dispatch(removeSelectedBlog());
            }
        }
    }, [id]);

    
    return (
        <div className='mx-auto w-[50%] relative'>
            {blogData ? <div className='max-w-[38.1rem] flex flex-col gap-4'>
                <h1 className='capitalize text-4xl font-bold'>{blogData?.title}</h1>
                <h2 className='text-lg opacity-80 font-semibold'>{blogData?.description}</h2>
                <img className='' src={blogData?.image} alt="" />
                <Link to={`/edit/${blogData.blogId}`}><button className={`bg-green-400 cursor-pointer w-[18%] px-2 py-2 text-xl font-semibold ${email == blogData?.creator?.email ? "" : "hidden"} `}>EDIT</button></Link>
                <div className='flex gap-6 text-2xl'>
                    <div className='flex items-center gap-2'>
                        {
                            isLike ?
                                <i onClick={handleLike} className="cursor-pointer fi fi-sr-thumbs-up text-blue-500"></i>
                                :
                                <i onClick={handleLike} className="cursor-pointer fi fi-rr-social-network "></i>
                        }

                        <p className='pb-2'>{likes?.length}</p>
                    </div>

                    <div className='flex items-center gap-2'>
                        <i onClick={() => dispatch(setisOpen(!isOpen))} className="cursor-pointer fi fi-sr-comment-alt"></i>
                        <p className='pb-2'>{comments?.length}</p>
                    </div>

                </div>

                {content && <div>
                    {
                        content.blocks.map(it => {
                            if (it.type == "header") {
                                // return (
                                if (it.data.level == "2") {
                                    return <h2 className='font-bold text-4xl my-4' dangerouslySetInnerHTML={{ __html: it.data.text }}></h2>
                                }
                                else if (it.data.level == "3") {
                                    return <h3 className='font-bold text-3xl my-4' dangerouslySetInnerHTML={{ __html: it.data.text }}></h3>
                                }
                                else if (it.data.level == "4") {
                                    return <h3 className='font-bold text-2xl my-4' dangerouslySetInnerHTML={{ __html: it.data.text }}></h3>
                                }

                            }
                            else if (it.type == "paragraph") {
                                return (
                                    <p className='my-4' dangerouslySetInnerHTML={{ __html: it.data.text }}></p>
                                )
                            }
                            else if (it.type == "list" || it.type == "List") {
                                const isUnordered = it.data.style === "unordered";

                                const ListTag = isUnordered ? "ul" : "ol";  //for correct html tag

                                const listClasses = isUnordered ? "list-disc ml-8 space-y-1 " : "list-decimal ml-8 space-y-1 ";

                                return (
                                    <ListTag className={listClasses + "my-4"}>
                                        {
                                            it.data.items.map((item, index) => {
                                                // Editor.js list items can be stored as strings or objects depending on the version
                                                const itemText = typeof item === "string" ? item : item.content;

                                                return (
                                                    // dangerouslySetInnerHTML ensures bold/italic text renders correctly
                                                    <li key={index} dangerouslySetInnerHTML={{ __html: itemText }}></li>
                                                )
                                            })
                                        }
                                    </ListTag>
                                )
                            }

                            else if (it.type == "image") {
                                return (
                                    <div className='my-4'>
                                        <img src={it.data.file.url} alt="" />
                                        <p className='font-semibold tracking-tighter text-center'>{it.data.caption}</p>
                                    </div>
                                )


                            }
                        })
                    }
                </div>}
            </div> : <h1>Loading.....</h1>}

            {
                isOpen &&
                <Comment />
            }

        </div>
    )
}

export default BlogPage