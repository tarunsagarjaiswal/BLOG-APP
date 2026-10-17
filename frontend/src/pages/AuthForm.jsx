import React, { useState } from 'react'
import toast from 'react-hot-toast';
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../utils/userSlice';

function AuthForm({ type }) {

    const [userData, setUserData] = useState({ name: "", email: "", password: "" });
    const dispatch = useDispatch();
    const navigate = useNavigate();

    async function handleRegister(e) {
        e.preventDefault();
        console.log(userData);

        try {
            const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/${type}`, userData)
            console.log(res);

            dispatch(login(res.data.user));
            
            toast.success("Done")
            navigate("/");
        } catch (error) {
            console.log(error.response);
            toast.error(error.response.data.message)
        }

    }

    return (
        <div className='w-72 flex flex-col items-center gap-5 mx-auto'>

            <h1 className='text-5xl font-bold'>{type == "signin" ? "Sign In" : "Sign Up"}</h1>

            <form className='w-full flex flex-col items-center gap-5' onSubmit={handleRegister}>

                {type == "signup" && <input onChange={(e) => setUserData((prev) => ({ ...prev, name: e.target.value }))} className='bg-gray-500 text-white p-1.5 focus:outline-none text-lg rounded-lg w-full' type="text" placeholder='Enter your name..' />}

                <input onChange={(e) => setUserData((prev) => ({ ...prev, email: e.target.value }))} className='bg-gray-500 text-white p-1.5 focus:outline-none text-lg rounded-lg w-full' type="email" placeholder='Enter your email..' />

                <input onChange={(e) => setUserData((prev) => ({ ...prev, password: e.target.value }))} className='bg-gray-500 text-white p-1.5 focus:outline-none text-lg rounded-lg w-full' type="password" placeholder='Enter your pass..' />

                <button type='submit' className='bg-[#489e42] text-white font-semibold p-1.5 text-lg rounded-lg w-[30%] cursor-pointer'>{type == "signup" ? "Register" : "Log In"}</button>
                {type == "signin" ? <Link to={'/signup'}>Don't have an account</Link> : <Link to={'/signin'}>Already have an account</Link>}
                
            </form>
        </div>
    )
}

export default AuthForm