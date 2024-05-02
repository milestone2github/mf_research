import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import mNiveshLogo from "./img/mNiveshLogo.png";
import { useDispatch, useSelector } from 'react-redux';

const Header = () => {
  const { userstate } = useSelector((state) => state.user)
  console.log(userstate);
  const navigate = useNavigate()
    const dispatch = useDispatch()
    const logout = async () => {
        try {
            const data = await fetch("http://localhost:5000/api/logout", {
                method: "GET",
                credentials: "include"
            })
            // const res = await data.json()
            if (data.ok) {
                navigate("/login")
                dispatch({
                    type: "checkuserloggedin",
                    payload: null
                })
            }
        } catch (error) {
            console.error(`Error occured while logging out the user ${error}`)
        }
    }
    return (
        <>
           { userstate &&<header className="App-header">
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
                    {userstate && <span className="user-name">Welcome, {userstate}</span>}
                    <button className="logout-button" onClick={logout}>Logout</button>
                </div>
            </div>
        </header>}
        </>
      
    )
}

export default Header