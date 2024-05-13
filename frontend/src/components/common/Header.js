import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import mNiveshLogo from "../../assets/mNiveshLogo.png";
import { useDispatch, useSelector } from 'react-redux';
import { setLoggedIn } from '../../Reducers/UserSlice'

const Header = () => {
    const { isLoggedIn, userData } = useSelector((state) => state.user)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    // Method to handle logout
    const handleLogout = async () => {
        try {
            const response = await fetch(`${process.env.VITE_API_BASE_URL}/api/logout`, {
                method: 'POST',
                credentials: 'include',
            });
            if (response.ok) {
                dispatch(setLoggedIn(false));
                navigate('/login', { replace: true });
            } else {
                console.error("Logout failed: Server responded with status", response.status);
            }
        } catch (error) {
            console.error("Logout error:", error);
        }
    }
    return (
        <>
            {isLoggedIn && <header className="App-header">
                <div className="flex justify-between w-full items-center ">
                    <NavLink to="/">
                        <img
                            src={mNiveshLogo}
                            alt="mNivesh Logo"
                            className="mNivesh-logo"
                        />
                    </NavLink>
                    <h1 className=" text-white text-xl mt-6">Mutual Fund Research Portal</h1>
                    <div className="header-right">
                        {isLoggedIn && <span className="user-name">Welcome, {userData?.name}</span>}
                        <button className="logout-button" onClick={handleLogout}>Logout</button>
                    </div>
                </div>
            </header>}
        </>

    )
}

export default Header