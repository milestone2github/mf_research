import React from 'react'
import { useSelector } from 'react-redux'
import { NavLink } from 'react-router-dom'

const Sidebar = () => {
    const { userstate } = useSelector((state) => state.user)

    return (
        <>
            {userstate && <nav className="app-sidebar">
                <ul className=" ">
                    <li className=" ">
                        <NavLink
                            to="/"
                            className={({ isActive }) =>
                                isActive ? "nav-link active" : "nav-link"
                            }
                        >
                            Home
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/portfolio-analysis"
                            className={({ isActive }) =>
                                isActive ? "nav-link active" : "nav-link"
                            }
                        >
                            Portfolio Analysis
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/calculator"
                            className={({ isActive }) =>
                                isActive ? "nav-link active" : "nav-link"
                            }
                        >
                            Calculator
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/mf-trans-request"
                            className={({ isActive }) =>
                                isActive ? "nav-link active" : "nav-link"
                            }
                        >
                            MF Trans Request
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/associate-payout"
                            className={({ isActive }) =>
                                isActive ? "nav-link active" : "nav-link"
                            }
                        >
                            Associate Payout
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/associate-payout-accounts"
                            className={({ isActive }) =>
                                isActive ? "nav-link active" : "nav-link"
                            }
                        >
                            Associate Payout Accounts
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/dir-client-payout"
                            className={({ isActive }) =>
                                isActive ? "nav-link active" : "nav-link"
                            }
                        >
                            Direct Client Payout
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            to="/dir-clientPayout-accounts"
                            className={({ isActive }) =>
                                isActive ? "nav-link active" : "nav-link"
                            }
                        >
                            Direct Client Payout Accounts
                        </NavLink>
                    </li>
                    <li>
                        <a href='https://mftrans.mnivesh.com/' target='_blank'  rel="noreferrer">
                            MF Transaction
                        </a>
                    </li>
                </ul>
            </nav>}
        </>
    )
}

export default Sidebar