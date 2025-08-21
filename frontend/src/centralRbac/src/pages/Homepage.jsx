import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Outlet, useNavigate } from "react-router-dom";
import {
  UsersIcon, ShieldCheckIcon, BuildingOfficeIcon, KeyIcon, LinkIcon, ComputerDesktopIcon
} from "@heroicons/react/24/outline";
import { getUserRole } from '../utils/auth';


const cards = [
  { id: 1, name: "User Management Dashboard", link: "/rbac/users", icon: "users" },
  { id: 2, name: "Permission Management", link: "/rbac/permissions", icon: "shield-check" },
  { id: 3, name: "Department Management", link: "/rbac/departments", icon: "building-office" },
  { id: 4, name: "Roles Management", link: "/rbac/roles/manage", icon: "key" },
  { id: 5, name: "Manage NFO Hyperlinks", link: "/rbac/nfohyperlinks", icon: "linkicon" },
  { id: 6, name: "Admin Management ", link: "/rbac/admin", icon: "computerdesktopicon", showFor: 'Super Admin' },
];

function Homepage() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.userData);

  useEffect(() => {
  }, []);

  const iconMap = {
    "users": UsersIcon,
    "shield-check": ShieldCheckIcon,
    "building-office": BuildingOfficeIcon,
    "key": KeyIcon,
    "linkicon": LinkIcon,
    "computerdesktopicon": ComputerDesktopIcon
  };

  const handleCardClick = (link) => {
    if (link) {
      navigate(link);
    } else {
      console.error("Clicked on a non-navigable card");
    }
  };

  // filtering to visible and accesible cards on basis of Internal Dashboard Role
  const getFilteredCards = () => {
    if (user?.internalDashboardRole === 'Super Admin') {
      return cards;
    }
    return cards.filter(card => card.showFor !== 'Super Admin');
  }

  const filteredCards = getFilteredCards();

  return (
    <div className="p-10 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCards.map((card) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card.link)}
              className={`border-2 border-gray-300 bg-slate-700 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col items-center justify-center p-6 h-48 cursor-pointer ${card.link ? "hover:bg-gray-800" : "opacity-70"
                }`}
            >
              {/* Rendering the icon if it exists */}
              {card.icon && iconMap[card.icon] && (
                <div className="w-10 h-10 rounded-full bg-white text-indigo-600 flex items-center justify-center mb-2">
                  {React.createElement(iconMap[card.icon], {
                    className: "w-6 h-6",
                  })}
                </div>
              )}
              <h2 className="text-lg font-semibold font-sans text-white text-center mt-5">
                {card.name}
              </h2>
            </div>
          ))}
        </div>
        <Outlet />
      </div>
    </div>
  );
}

export default Homepage;
