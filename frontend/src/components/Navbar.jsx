import React from 'react'
import { Link, Outlet } from 'react-router-dom'
import logo from '/logo.svg?url'
import { useDispatch, useSelector } from 'react-redux'
import { setisOpen } from '../utils/commentSlice'

function Navbar() {
    const { name,  token } = useSelector(state => state.user)
    
    const dispatch = useDispatch();

  return (
    <>
      <div className='min-w-full h-16 border-gray-300 shadow-sm  border-b mb-3 flex items-center justify-between px-7'>
        <div className='flex items-center gap-4'>
          <Link onClick={dispatch(setisOpen(false))} to={'/'}>
            <img src={logo} alt="" />
          </Link>

          <div className='relative'>
            <i className=" opacity-50 absolute mt-2.5 ml-2 text-lg fi fi-rr-search"></i>
            <input className='tracking-tight bg-gray-200 focus:outline-none pl-9 p-2 rounded-2xl' type="search" placeholder='Search' />
          </div>
        </div>

        <div className='flex items-center gap-6'>
          <div className='flex items-center gap-2'>
            <i className="flex fi fi-rs-drawer-alt"></i>
            <Link to={"/add-blog"}><button className='tracking-tight cursor-pointer'>Write</button></Link>
          </div>

          {
            token ? <div>{name}</div> :
            <div className='flex gap-3 tracking-tight'>
            <Link to={'/signup'}><button className='cursor-pointer bg-blue-500 px-3 py-1.5 text-white rounded-2xl'>Sign Up</button></Link>

            <Link to={'/signin'}><button className='cursor-pointer border text-black px-3 py-1.5 border-gray-300 rounded-2xl'>Sign In</button></Link>
          </div>
          }
        </div>
      </div>
      <Outlet />
    </>
  )
}

export default Navbar