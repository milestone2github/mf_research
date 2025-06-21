import React from 'react'
import { useSelector } from 'react-redux'
import { NavLink } from 'react-router-dom'
import { appRoutes } from '../../routes/RouteConfig'

const Sidebar = () => {
    const { isLoggedIn, userData } = useSelector((state) => state.user)
    const permissions = userData?.permissions;
    const internalRole = userData?.internalDashboardRole;
    console.log(userData);

    if (!isLoggedIn) return null;

    const isTabAllowed = (route) => {
        if (!route.showInSidebar) return false;
        if (route.requiredInternalRole && !route.requiredInternalRole.includes(internalRole)) return false;
        if (!route.protected) return true;
        if (!route.requiredPermission) return true;


        // If permission is required, check if user has it
        return permissions.includes(route.requiredPermission);
    };

    const allowedTabs = appRoutes.filter(isTabAllowed);

    return (
        <>
            {isLoggedIn && <nav className="app-sidebar min-w-64">
                <ul>{
                    allowedTabs.map(tab => ( 
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