import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EmployeeOnboardingForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    personalEmail: '',
    phone: '',
    department: '',
    role: '',
    annualCtc: '',
    baseSalary: '',
    isPfApplicable: false,
    doj: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/onboarding/onboarding-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        navigate('/onboarding');
      } else {
        alert(data.message || 'Failed to submit the form');
      }
    } catch (error) {
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 rounded-2xl bg-white text-gray-900 shadow-xl border border-gray-200 mt-8">
      <h2 className="text-3xl font-bold mb-8 text-gray-800 tracking-wide">
        Onboard New Employee
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">

        {/* Name */}
        <div className="flex flex-col">
          <label htmlFor="name" className="mb-1 text-sm font-medium text-gray-700">Name</label>
          <input
            name="name"
            id="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className="border border-gray-300 rounded-md p-2 bg-white text-gray-900 placeholder-gray-500"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col">
          <label htmlFor="personalEmail" className="mb-1 text-sm font-medium text-gray-700">Email</label>
          <input
            name="personalEmail"
            id="personalEmail"
            placeholder="Email"
            value={formData.personalEmail}
            onChange={handleChange}
            className="border border-gray-300 rounded-md p-2 bg-white text-gray-900 placeholder-gray-500"
          />
        </div>

        {/* Phone */}
        <div className="flex flex-col">
          <label htmlFor="phone" className="mb-1 text-sm font-medium text-gray-700">Phone</label>
          <input
            name="phone"
            id="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            className="border border-gray-300 rounded-md p-2 bg-white text-gray-900 placeholder-gray-500"
          />
        </div>

        {/* Department */}
        <div className="flex flex-col">
          <label htmlFor="department" className="mb-1 text-sm font-medium text-gray-700">Department</label>
          <select
            name="department"
            id="department"
            value={formData.department}
            onChange={handleChange}
            className="border border-gray-300 rounded-md p-2 bg-white text-gray-900"
          >
            <option value="">Select Department</option>
            <option value="HR">HR</option>
            <option value="Sales">Sales</option>
          </select>
        </div>

        {/* Role */}
        <div className="flex flex-col">
          <label htmlFor="role" className="mb-1 text-sm font-medium text-gray-700">Role</label>
          <select
            name="role"
            id="role"
            value={formData.role}
            onChange={handleChange}
            className="border border-gray-300 rounded-md p-2 bg-white text-gray-900"
          >
            <option value="">Select Role</option>
            <option value="Executive">Executive</option>
            <option value="Manager">Manager</option>
          </select>
        </div>

        {/* Annual CTC */}
        <div className="flex flex-col">
          <label htmlFor="annualCtc" className="mb-1 text-sm font-medium text-gray-700">Annual CTC</label>
          <input
            name="annualCtc"
            id="annualCtc"
            type="number"
            placeholder="Annual CTC"
            value={formData.annualCtc}
            onChange={handleChange}
            className="border border-gray-300 rounded-md p-2 bg-white text-gray-900 placeholder-gray-500"
          />
        </div>

        {/* Base Salary */}
        <div className="flex flex-col">
          <label htmlFor="baseSalary" className="mb-1 text-sm font-medium text-gray-700">Basic Monthly Salary</label>
          <input
            name="baseSalary"
            id="baseSalary"
            type="number"
            placeholder="Basic Monthly Salary"
            value={formData.baseSalary}
            onChange={handleChange}
            className="border border-gray-300 rounded-md p-2 bg-white text-gray-900 placeholder-gray-500"
          />
        </div>

        {/* PF Checkbox */}
        <div className="flex items-center col-span-2 mt-2">
          <input
            type="checkbox"
            id="isPfApplicable"
            name="isPfApplicable"
            checked={formData.isPfApplicable}
            onChange={handleChange}
            className="mr-2"
          />
          <label htmlFor="isPfApplicable" className="text-gray-800">PF Applicable</label>
        </div>

        {/* DOJ */}
        <div className="flex flex-col">
          <label htmlFor="doj" className="mb-1 text-sm font-medium text-gray-700">Date of Joining (DOJ)</label>
          <input
            type="date"
            id="doj"
            name="doj"
            value={formData.doj}
            onChange={handleChange}
            className="border border-gray-300 rounded-md p-2 bg-white text-gray-900"
          />
        </div>

        {/* Submit */}
        <div className="col-span-2">
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-xl font-semibold transition duration-150 ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {loading ? (
              <span className="flex justify-center items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3.5-3.5L12 0v4a8 8 0 00-8 8h4z"
                  ></path>
                </svg>
                Submitting...
              </span>
            ) : (
              'Submit'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeOnboardingForm;
