import { useState } from 'react'
import './App.css'  
import { Route, Routes } from 'react-router-dom'
import AuthForm from './pages/AuthForm'
import Navbar from './components/Navbar'
import Home from './components/Home'
import AddBlog from './pages/AddBlog'
import BlogPage from './pages/BlogPage'

function App() {
  // console.log(import.meta.env.VITE_BACKEND_URL);

  return (
    <div className='min-w-full h-screen'>
      <Routes>
        <Route path='/' element={<Navbar/>}>
        <Route path='/' element={<Home/>}/>
        <Route path='/signin' element={<AuthForm type={"signin"}/>} ></Route>
        <Route path='/signup' element={<AuthForm type={"signup"}/>} ></Route>
        <Route path='/add-blog' element={<AddBlog/>}></Route>
        <Route path='/blog/:id' element={<BlogPage/>}></Route>
        <Route path='/edit/:id' element={<AddBlog edit={true}/>}></Route>
        </Route>
      </Routes>
    </div>
  )
}

export default App
