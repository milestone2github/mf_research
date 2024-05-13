import React from 'react'
import { useNavigate } from 'react-router-dom';
// import logo from '../../../assets/mNiveshLogo.png';
import { useDispatch } from 'react-redux';
import { setLoggedIn } from '../../../Reducers/UserSlice'

function Header() {
  // const navigate = useNavigate();

  // // use useDispatch hook to use reducers 
  // const dispatch = useDispatch();

  // // Method to handle logout
  // const handleLogout = async () => {
  //   try {
  //     const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/logout`, {
  //       method: 'POST',
  //       credentials: 'include',
  //     });
  //     if (response.ok) {
  //       dispatch(setLoggedIn(false));
  //       navigate('/login', { replace: true });
  //     } else {
  //       console.error("Logout failed: Server responded with status", response.status);
  //     }
  //   } catch (error) {
  //     console.error("Logout error:", error);
  //   }
  // }

  return (
    <header className='relative py-3 px-1 md:px-8 shadow-md'>
      <nav className='flex items-center md:gap-8 justify-between'>
        {/* <a href="/"><img src={logo} alt="" className='w-32 md:w-44 aspect-[10/2]'/></a> */}
        <h1 className=' text-lg md:text-3xl w-full text-black-900 md:text-primary-white py-1 md:bg-light-blue'>MF TRANSACTIONS</h1>
        {/* <button
          type='button'
          title='Logout'
          className='bg-[#bf5d28] text-sm md:text-lg text-primary-white min-w-[80px] md:min-w-[120px] text-center rounded-md px-5 py-2 enabled:hover:bg-[#9b4b20] disabled:opacity-70'
          onClick={handleLogout}
        >Logout
        </button> */}

      </nav>
        {/* <h1 className='md:hidden mt-2 text-3xl w-full text-primary-white py-1 bg-light-blue'>MF TRANSACTIONS</h1> */}
    </header>
  )
}

export default Header