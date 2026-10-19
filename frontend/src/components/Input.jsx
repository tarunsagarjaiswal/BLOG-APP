import React from 'react'
import { useState } from 'react'

function Input({ type, placeholder, setUserData, field, value, icon }) {

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className='relative'>
      <i className={"fi " + icon +  " absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg"}></i>

      <input
        onChange={(e) => setUserData((prev) => ({ ...prev, [field]: e.target.value }))}
        className='w-full px-4 pl-11 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-base placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#489e42]/20 focus:border-[#489e42] transition-all duration-200 shadow-sm'
        type={type == "password" && showPassword ? "text" : type}
        placeholder={placeholder}
        value={value}
        required
      />

      {
        type == "password" && 
        <i onClick={() => setShowPassword(prev => !prev)} className={`${showPassword ? `fi fi-rs-eye ` : `fi fi-rr-eye-crossed `} cursor-pointer absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg`}></i>
      }
    </div>
  )
}

export default Input