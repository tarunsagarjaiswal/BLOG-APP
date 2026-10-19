import axios from 'axios';
import React, { useRef } from 'react'
import { useState } from 'react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import CodeTool from '@editorjs/code';
import Marker from '@editorjs/marker';
import Underline from '@editorjs/underline';
import Embed from '@editorjs/embed';
import TextVariantTune from '@editorjs/text-variant-tune';
import RawTool from '@editorjs/raw';
import ImageTool from '@editorjs/image';


function AddBlog({ edit = false }) {
    const { id } = useParams();
    const dispatch = useDispatch()

    const { token } = useSelector((state) => state.user)
    const { title, description, image, content } = useSelector(state => state.selectedBlogSlice);    //EDIT..

    const formData = new FormData();

    const [blogData, setBlogData] = useState({ title: "", description: "", image: null, content: null });

    const navigate = useNavigate();
    useEffect(() => {
        if (!token) navigate("/signin")
    }, [])


    async function handlePost() {
        console.log(blogData);

        formData.append("title", blogData.title)
        formData.append("description", blogData.description)
        formData.append("image", blogData.image)

        formData.append("content", JSON.stringify(blogData.content))

        // let images = [];
        blogData.content.blocks.forEach((it) => {
            if (it.type == "image") {
                formData.append("images", it.data.file.image)
            }
        })

        // formData.append("images", images)        FormData cannot natively append an array of files.

        try {
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/blogs`,
                formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${token}`
                }
            })
            toast.success(res?.data?.message)

            navigate("/");

        } catch (error) {
            console.log(error?.response);
            toast.error(error?.response?.data?.message || "Something went wrong");
        }
    }

    async function updatePost() {
        console.log(blogData)

        let newFormData = new FormData();
        newFormData.append("title", blogData.title)
        newFormData.append("description", blogData.description)
        newFormData.append("image", blogData.image)

        newFormData.append("content", JSON.stringify(blogData.content));

        let existingImages = [];
        blogData.content.blocks.forEach((it) => {
            if (it.type == "image") {
                if (it.data.file.image) {
                    newFormData.append("images", it.data.file.image)
                }

                else {
                    existingImages.push({
                        url: it.data.file.url,
                        imageId: it.data.file.imageId
                    })
                }
            }
        })

        for (let data of newFormData.entries()) {
            console.log(data)
        }

        console.log(existingImages)
        newFormData.append("existingImages", JSON.stringify(existingImages))

        try {
            const res = await axios.patch(`http://localhost:3000/api/v1/blogs/${id}`,
                newFormData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        "Authorization": `Bearer ${token}`
                    }
                })

            toast.success(res?.data?.message);
            navigate("/");

        } catch (error) {
            toast.error(error?.response?.data?.message);
        }
    }

    async function fetchBlogById() {
        // try {
        //     const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/blogs/${id}`)

        //     toast.success(res?.data?.message);

        //     setBlogData({
        //         title: res?.data?.getBlog?.title,
        //         description: res?.data?.getBlog?.description,
        //         image: res?.data?.getBlog?.image
        //     });

        // } catch (error) {
        //     toast.error(error?.response?.data?.message);

        // }

        setBlogData({
            title: title,
            description: description,
            image: image,
            content: content,
        });
    }

    useEffect(() => {
        if (id != undefined)
            fetchBlogById();
    }, [id]);

    const editorjsRef = useRef(null);

    useEffect(() => {
        // Prevent double-initialization in React Strict Mode
        if (!editorjsRef.current) {
            const editorjs = new EditorJS({
                holder: 'editorjs',     //you have write in the id of the element which you are using.
                placeholder: "Write Something....",

                data: content,

                tools: {
                    header: {
                        class: Header,
                        inlineToolbar: true,
                        config: {
                            //placeholder when we select the heading
                            placeholder: "Enter the heading",
                            levels: [2, 3, 4],  //only access to h2, h3, h4
                            defaultLevel: 3     //h3 is default
                        },
                    },

                    List: {
                        class: List,
                        inlineToolbar: true,
                    },

                    code: CodeTool,

                    Marker: {
                        class: Marker,
                    },

                    underline: Underline,

                    embed: Embed,

                    textVariant: TextVariantTune,

                    raw: RawTool,

                    image: {
                        class: ImageTool,
                        inlineToolbar: true,
                        config: {
                            uploader: {
                                uploadByFile: async (image) => {
                                    // console.log(image);
                                    return {
                                        success: 1,
                                        file: {
                                            url: URL.createObjectURL(image),
                                            image,
                                        },
                                    };
                                },
                            },
                        },
                    },

                },

                tunes: ['textVariant'],

                onChange: async () => {
                    const data = await editorjs.save();
                    // console.log(data);
                    setBlogData((prev) => ({ ...prev, content: data }))
                }
            });

            editorjsRef.current = editorjs;
        }

        return () => {
            if (editorjsRef.current && editorjsRef.current.destroy) {
                editorjsRef.current.destroy();
                editorjsRef.current = null;
            }
        }

    }, [])


    return (
        <div className='max-w-4xl mx-auto mt-8 mb-16 p-4 sm:p-8 flex flex-col gap-6'>

            <div className="flex flex-col gap-1">
                <p className="text-gray-500 font-semibold uppercase tracking-wider pl-1">Title</p>
                <input
                    className='w-full text-2xl sm:text-3xl font-bold text-gray-800 bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-gray-300 placeholder:font-normal'
                    value={blogData.title}
                    onChange={(e) => (setBlogData(prev => ({ ...prev, title: e.target.value })))}
                    type="text"
                    placeholder='Enter your blog title...'
                />
            </div>

            <div className="flex flex-col gap-1">
                <p className="text-gray-500 font-semibold uppercase tracking-wider pl-1">Description</p>
                <textarea
                    className='w-full h-24 resize-none bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-700 text-base focus:outline-none focus:bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all shadow-sm'
                    value={blogData.description}
                    onChange={(e) => (setBlogData(prev => ({ ...prev, description: e.target.value })))}
                    placeholder='Write a short description about this post...'
                />
            </div>


            <div className="flex flex-col gap-1">
                <p className="text-gray-500 font-semibold uppercase tracking-wider pl-1">Cover Image</p>
                <label htmlFor="image" className="cursor-pointer block rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border-2 border-dashed border-gray-300 hover:border-gray-400">
                    {blogData.image ? (
                        <img
                            className='w-full aspect-video object-cover'
                            src={typeof (blogData.image) == "string" ? blogData.image : URL.createObjectURL(blogData.image)}
                            alt="Cover"
                        />
                    ) : (
                        <div className='w-full aspect-video flex flex-col gap-2 justify-center items-center bg-gray-100/50 hover:bg-gray-100 transition-colors'>
                            <i className="fi fi-rr-picture text-3xl text-gray-400"></i>
                            <span className="text-lg font-bold text-gray-700 tracking-wide">SELECT IMAGE</span>
                        </div>
                    )}
                </label>
                <input
                    className='hidden'
                    id='image'
                    onChange={(e) => (setBlogData(prev => ({ ...prev, image: e.target.files[0] })))}
                    type="file"
                    accept='image/*'
                />
            </div>

            <div className="flex flex-col gap-1 mt-2">
                <p className="text-gray-500 font-semibold uppercase tracking-wider pl-1">Content</p>
                <div
                    id='editorjs'
                    className="w-full min-h-100 text-base text-gray-800 pt-2"
                ></div>
            </div>

            <div className="flex items-center mt-4">
                {id ? (
                    <button
                        className='bg-blue-300 hover:bg-blue-400 text-blue-900 font-bold px-8 py-2.5 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer text-base'
                        onClick={updatePost}
                    >
                        Update Blog
                    </button>
                ) : (
                    <button
                        className='bg-blue-300 hover:bg-blue-400 text-blue-900 font-bold px-8 py-2.5 rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer text-base'
                        onClick={handlePost}
                    >
                        POST
                    </button>
                )}
            </div>
        </div>
    )
}

export default AddBlog