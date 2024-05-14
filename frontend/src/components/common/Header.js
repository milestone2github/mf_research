import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import mNiveshLogo from "../../assets/mNiveshLogo.png";
import { useDispatch, useSelector } from 'react-redux';
import { setLoggedIn } from '../../Reducers/UserSlice'

const Header = () => {
    const { isLoggedIn, userData } = useSelector((state) => state.user)
    console.log(userData);
    const navigate = useNavigate()
    const dispatch = useDispatch()
    // Method to handle logout
    const checklogout = ()=>{
        console.log(userData.userdata.email);
        if(userData.userdata.email.match("gmail")){
             dispatch(setLoggedIn(false))
             navigate("/login")
        }
        else{
            handleLogout()
        }
    }
    const handleLogout = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/logout`, {
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
                        <button className="logout-button" onClick={checklogout}>Logout</button>
                    </div>
                </div>
            </header>}
        </>

    )
}

export default Header