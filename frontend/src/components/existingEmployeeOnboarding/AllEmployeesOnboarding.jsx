import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const AllEmployeesOnboarding = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const statusClasses = {
    pending: "bg-yellow-100 text-yellow-700",
    onboarding: "bg-blue-100 text-blue-700",
    active: "bg-green-100 text-green-700",
    inactive: "bg-gray-100 text-gray-700",
    terminated: "bg-red-100 text-red-700",
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/onboarding/employee-onboarding/all`,
          {
            credentials: "include",
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Failed to fetch employees");
        }

        setUsers(data.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load employees");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const filteredUsers = users.filter((user) => {
    const name =
      user?.onboarding?.hrFilledInfo?.name ||
      user?.name ||
      "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm tracking-wide">
            Fetching employees...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight mb-1">
              Employee Directory
            </h1>
            <p className="mt-0 text-gray-600">
              Manage onboarding details and employee profiles
            </p>
          </div>

          <div className="mt-4 sm:mt-0 flex items-center gap-3">
            <div className="px-4 py-2 rounded-full bg-white/70 backdrop-blur border shadow text-sm font-medium text-gray-700">
              Total Employees: {filteredUsers.length}
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="
                  w-48 px-4 py-2 pl-10 rounded-full text-sm
                  bg-white/70 backdrop-blur border shadow
                  focus:outline-none focus:ring-2 focus:ring-blue-400
                  transition
                "
              />
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="relative bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <th className="px-6 py-4 text-left font-semibold">
                    Employee
                  </th>
                  <th className="px-6 py-4 text-left font-semibold">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center font-semibold">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="3"
                      className="px-6 py-16 text-center text-gray-500"
                    >
                      No employees found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user, index) => {
                    const name =
                      user?.onboarding?.hrFilledInfo?.name ||
                      user?.name ||
                      "-";

                    const email =
                      user?.email ||
                      user?.onboarding?.hrFilledInfo?.personalEmail ||
                      "-";

                    const initials = name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();

                    return (
                      <tr
                        key={user._id}
                        className="group hover:bg-blue-50/60 transition-all duration-300"
                        style={{ animationDelay: `${index * 40}ms` }}
                      >
                        {/* Employee */}
                        <td className="px-6 py-5 flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold shadow">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">
                              {name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {email}
                            </p>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-5">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                              statusClasses[user.status] ||
                              "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-6 py-5 text-center">
                          <button
                            onClick={() =>
                              navigate(
                                `edit/${user._id}`
                              )
                            }
                            className="
                              relative inline-flex items-center justify-center
                              px-5 py-2 rounded-full text-sm font-semibold
                              text-white
                              bg-gradient-to-r from-blue-600 to-indigo-600
                              shadow-lg shadow-blue-500/30
                              hover:scale-105 hover:shadow-xl
                              transition-all duration-300
                            "
                          >
                            View Profile
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllEmployeesOnboarding;
