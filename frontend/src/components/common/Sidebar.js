import React from 'react'
import { useSelector } from 'react-redux'
import { NavLink } from 'react-router-dom'

const tabs = [
    { name: 'Home', to: '/', label: 'Home' },
    { name: 'Portfolio Analysis', to: '/portfolio-analysis', label: 'Portfolio Analysis' },
    { name: 'Calculator', to: '/calculator', label: 'Calculator' },
    { name: 'MF Trans Request', to: '/mf-trans-request', label: 'MF Trans Request' },
    { name: 'Associate Payout', to: '/associate-payout', label: 'Associate Payout' },
    { name: 'Associate Payout Accounts', to: '/associate-payout-accounts', label: 'Associate Payout Accounts' },
    { name: 'Direct Client Payout', to: '/dir-client-payout', label: 'Direct Client Payout' },
    { name: 'Direct Client Payout Accounts', to: '/dir-client-payout-accounts', label: 'Direct Client Payout Accounts' },
    { name: 'MF Transaction', to: '/mf-trans-form', label: 'MF Transaction' },
    { name: 'NFO', to: '/nfo-form', label: 'NFO Transaction' },
    { name: 'Operations Dashboard', to: 'https://ops.mnivesh.com', label: 'OPS Dashboard' },
    { name: 'Links', to: '/links', label: 'Links' },
    { name: 'Mint', to: '/mint', label: 'Mint' },
    { name: 'Workdrive', to: '/workdrive', label: 'Workdrive Files' },
]

const Sidebar = () => {
    const { isLoggedIn, userData } = useSelector((state) => state.user)
    const permissions = userData?.role?.permissions;

    const allowedTabs = tabs.filter(tab =>
        tab.name === 'Calculator' || tab.name === 'Home' || permissions?.find(permission => permission === tab.name)
    )

    return (
        <>
            {isLoggedIn && <nav className="app-sidebar min-w-64">
                <ul>{
                    allowedTabs.map(tab => (  //test temp
                        <li key={tab.to}>
                            <NavLink
                                to={tab.to}
                                className={({ isActive }) =>
                                    isActive ? "nav-link active" : "nav-link"
                                }
                            >
                                {tab.label}
                            </NavLink>
                        </li>

                    ))
                }</ul>
            </nav>}
        </>
    )
}

export default Sidebar