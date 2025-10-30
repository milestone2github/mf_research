import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardDocumentListIcon, 
  Squares2X2Icon,
  TagIcon,
  BuildingStorefrontIcon
} from "@heroicons/react/24/outline";

const AssetDashboard = () => {
  const navigate = useNavigate();

  const cards = [
    { id: 1, name: "Manage Assets", icon: ClipboardDocumentListIcon, link: "/assets/manage" },
    { id: 2, name: "Manage Asset Types", icon: Squares2X2Icon, link: "/assets/types" },
    { id: 3, name: "Manage Asset Categories", icon: TagIcon, link: "/assets/categories" },
    { id: 4, name: "Manage Merchants", icon: BuildingStorefrontIcon, link: "/assets/merchants" },
  ];

  return (
    <div className="p-10 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {cards.map((card) => (
            <div
              key={card.id}
              onClick={() => navigate(card.link)}
              className="border-2 border-gray-400 bg-gray-700 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center p-8 h-48 cursor-pointer hover:bg-indigo-700"
            >
              <div className="w-12 h-12 rounded-full bg-white text-indigo-600 flex items-center justify-center mb-4">
                {React.createElement(card.icon, { className: "w-8 h-8" })}
              </div>
              <h2 className="text-lg font-semibold text-white text-center">
                {card.name}
              </h2>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssetDashboard;
