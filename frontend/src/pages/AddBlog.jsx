import axios from 'axios';
import React, { useRef } from 'react'
import { useState } from 'react';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
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
                if(it.data.file.image){
                newFormData.append("images", it.data.file.image)
                }

                else {
                    existingImages.push({
                        url : it.data.file.url,
                        imageId : it.data.file.imageId
                    })
                }
            }
        })

        for(let data of newFormData.entries()) {
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
            content : content,
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

                data : content,

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
        <div className='w-[32%] mx-auto py-6'>
            <label htmlFor="">Title</label>
            <input className='pl-2' value={blogData.title} onChange={(e) => (setBlogData(prev => ({ ...prev, title: e.target.value })))} type="text" placeholder='title' />
            <br />

            <label htmlFor="">Description</label>
            <input className='pl-2' value={blogData.description} onChange={(e) => (setBlogData(prev => ({ ...prev, description: e.target.value })))} type="text" placeholder='description' />
            <br />

            <div>
                <label htmlFor="image">
                    {
                        blogData.image ? <img className='aspect-video object-cover' src={typeof (blogData.image) == "string" ? blogData.image : URL.createObjectURL(blogData.image)} alt="" /> : <div className='aspect-video flex justify-center text-3xl font-semibold items-center bg-gray-300' >SELECT IMAGE</div>
                    }
                </label>
                <input className='hidden' id='image' onChange={(e) => (setBlogData(prev => ({ ...prev, image: e.target.files[0] })))} type="file" accept='all' placeholder='image' />
            </div>
            <br />

            <div id='editorjs'></div>

            {
                id ?
                    <button className='bg-red-300 cursor-pointer p-1 rounded-lg font-semibold' onClick={updatePost}>Update Blog..</button> :
                    <button className='bg-red-300 cursor-pointer p-1 rounded-lg font-semibold' onClick={handlePost}>POST</button>
            }
        </div>
    )
}

export default AddBlog