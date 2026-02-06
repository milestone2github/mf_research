import React from "react";
import { useNavigate } from "react-router-dom";
import { FaUserGraduate, FaUserTie } from "react-icons/fa";
import { Link } from "react-router-dom";

const SelectEmploymentType = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-10">
        
        {/* Header */}
      <div className="relative mb-10">
        {/* Back button */}
        <Link
          to="/onboarding"
          className="absolute left-0 top-1 text-blue-600 hover:underline text-sm"
        >
          ←
        </Link>

        {/* Centered text */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">
            Add New Joinee
          </h1>
          <p className="text-gray-500 mt-2">
            Choose the employment type to proceed with onboarding
          </p>
        </div>
      </div>


        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Intern Card */}
          <div
            onClick={() => navigate("/onboarding/add?type=intern")}
            className="cursor-pointer border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition group bg-white flex flex-col h-full"
          >
            <div className="flex items-center justify-between mb-4">
              <FaUserGraduate className="text-4xl text-blue-600" />
              <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                Intern
              </span>
            </div>

            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Intern
            </h2>

            <p className="text-gray-500 text-sm leading-relaxed">
              Short-term or training-based engagement.  
              Does not include PF or long-term benefits.
            </p>

            <div className="mt-auto text-sm text-blue-600 font-medium group-hover:underline">
              Continue →
            </div>
          </div>

          {/* Full-time Card */}
          <div
            onClick={() => navigate("/onboarding/add?type=fulltime")}
            className="cursor-pointer border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition group bg-white flex flex-col h-full"
          >
            <div className="flex items-center justify-between mb-4">
              <FaUserTie className="text-4xl text-gray-800" />
              <span className="text-xs font-semibold bg-green-100 text-green-700 px-3 py-1 rounded-full">
                Employee
              </span>
            </div>

            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Full-time Employee
            </h2>

            <p className="text-gray-500 text-sm leading-relaxed">
              Permanent role with salary, PF eligibility,  
              benefits, and full onboarding process.
            </p>

            <div className="mt-auto text-sm text-gray-700 font-medium group-hover:underline">
              Continue →
            </div>
          </div>

        </div>

        

      </div>
    </div>
  );
};

export default SelectEmploymentType;
