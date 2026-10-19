import React from 'react'
import { Link, Outlet } from 'react-router-dom'
import logo from '/logo.svg?url'
import { useDispatch, useSelector } from 'react-redux'
import { setisOpen } from '../utils/commentSlice'

function Navbar() {
    const { name, token } = useSelector(state => state.user)
    const dispatch = useDispatch();

    return (
        <>
            <nav className='sticky top-0 z-50 w-full h-16 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm flex items-center justify-between px-4 sm:px-8'>
                
                <div className='flex items-center gap-6'>
                    <Link 
                        onClick={() => dispatch(setisOpen(false))} 
                        to={'/'}
                        className='hover:opacity-80 transition-opacity'
                    >
                        <img src={logo} alt="Logo" className="h-9 w-auto" />
                    </Link>

                    <div className='relative hidden sm:block'>
                        <i className="fi fi-rr-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        <input 
                            className='w-64 bg-gray-50 border border-gray-200 text-sm text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 pl-10 pr-4 py-2 rounded-full transition-all duration-200' 
                            type="search" 
                            placeholder='Search' 
                        />
                    </div>
                </div>

                {/* Right Section: Write & Auth/Profile */}
                <div className='flex items-center gap-6'>
                    
                    <Link to={"/add-blog"} className='flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors group'>
                        <i className="fi fi-rs-drawer-alt text-lg group-hover:-translate-y-0.5 transition-transform"></i>
                        <span className='tracking-tight font-medium'>Write</span>
                    </Link>

                    {token ? (
                        <div className='flex items-center justify-center w-9 h-9 bg-gray-800 text-white rounded-full font-semibold cursor-pointer shadow-sm hover:shadow-md transition-shadow'>
                            {name ? name.charAt(0).toUpperCase() : 'U'}
                        </div>
                    ) : (
                        <div className='flex items-center gap-3 tracking-tight text-sm font-medium'>
                            <Link to={'/signin'}>
                                <button className='cursor-pointer text-gray-600 hover:text-gray-900 px-4 py-2 transition-colors'>
                                    Sign In
                                </button>
                            </Link>

                            <Link to={'/signup'}>
                                <button className='cursor-pointer bg-blue-600 hover:bg-blue-700 px-5 py-2 text-white rounded-full shadow-sm hover:shadow-md transition-all active:scale-95'>
                                    Sign Up
                                </button>
                            </Link>
                        </div>
                    )}
                </div>
            </nav>
            <Outlet />
        </>
    )
}

export default Navbar