import React, { useState } from 'react'
import toast from 'react-hot-toast';
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../utils/userSlice';
import Input from '../components/Input';

function AuthForm({ type }) {

    const [userData, setUserData] = useState({ name: "", email: "", password: "" });
    const dispatch = useDispatch();
    const navigate = useNavigate();

    function removeField() {
        setUserData({
                name: "",
                email: "",
                password: ""
            })
    }

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

        } finally {     //finally means this things will be done no matter try runs or catch.
            setUserData({
                name: "",
                email: "",
                password: ""
            })
        }

    }

    return (
        <div className='w-full max-w-sm flex flex-col items-center mt-24 mx-auto p-8 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 gap-6'>

            <h1 className='text-3xl font-extrabold text-gray-800 tracking-tight'>{type == "signin" ? "Sign In" : "Sign Up"}</h1>

            <form className='w-full flex flex-col gap-4' onSubmit={handleRegister}>
                {
                    type == "signup" &&

                    <Input
                        type={"text"}
                        placeholder={"Enter your name.."}
                        setUserData={setUserData}
                        field={"name"}
                        value={userData.name}
                        icon={"fi-br-user"}
                    />
                }

                <Input
                    type={"email"}
                    placeholder={"Enter your email.."}
                    setUserData={setUserData}
                    field={"email"}
                    value={userData.email}
                    icon={"fi-tr-envelopes"}
                />

                <Input
                    type={"password"}
                    placeholder={"Enter your password.."}
                    setUserData={setUserData}
                    field={"password"}
                    value={userData.password}
                    icon={"fi-rr-password"}
                />

                <button type='submit' className='w-full bg-[#489e42] hover:bg-[#3a8235] text-white font-bold py-3 text-lg rounded-xl transition-all duration-200 active:scale-[0.98] shadow-md hover:shadow-lg cursor-pointer mt-2'>{
                    type == "signup" ? "Register" : "Log In"
                }
                </button>

                {
                    type == "signin"
                        ?
                        <Link onClick={removeField} className='text-center text-sm font-medium text-gray-500 hover:text-[#489e42] hover:underline transition-all duration-200 mt-2' to={'/signup'}>Don't have an account?</Link>

                        :
                        <Link onClick={removeField} className='text-center text-sm font-medium text-gray-500 hover:text-[#489e42] hover:underline transition-all duration-200 mt-2' to={'/signin'}>Already have an account?</Link>
                }

            </form>
        </div>
    )
}

export default AuthForm