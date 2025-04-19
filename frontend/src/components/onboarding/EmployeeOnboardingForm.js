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
    setLoading(true); // Start loading
  
    try {
      const response = await fetch('http://localhost:5000/api/onboarding/onboarding-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
  
      const data = await response.json();
  
      if (response.ok && data.success) {
        console.log('✅ Form submitted:', data);
        navigate('/onboarding');
      } else {
        console.error('❌ Error:', data.message);
        alert(data.message || 'Failed to submit the form');
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false); // Stop loading no matter what
    }
  };
  

  return (
    <div className="max-w-4xl mx-auto p-8 rounded-2xl bg-white text-gray-900 shadow-xl border border-gray-200 mt-8">
      <h2 className="text-3xl font-bold mb-8 text-gray-800 tracking-wide">
        Onboard New Employee
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
        {/* Name */}
        <input
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          className="border border-gray-300 rounded-md p-2 bg-white text-gray-900 placeholder-gray-500"
        />

        {/* Email */}
        <input
          name="personalEmail"
          placeholder="Email"
          value={formData.personalEmail}
          onChange={handleChange}
          className="border border-gray-300 rounded-md p-2 bg-white text-gray-900 placeholder-gray-500"
        />

        {/* Phone */}
        <input
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
          className="border border-gray-300 rounded-md p-2 bg-white text-gray-900 placeholder-gray-500"
        />

        {/* Department */}
        <select
          name="department"
          value={formData.department}
          onChange={handleChange}
          className="border border-gray-300 rounded-md p-2 bg-white text-gray-900"
        >
          <option value="">Select Department</option>
          <option value="HR">HR</option>
          <option value="Sales">Sales</option>
        </select>

        {/* Role */}
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="border border-gray-300 rounded-md p-2 bg-white text-gray-900"
        >
          <option value="">Select Role</option>
          <option value="Executive">Executive</option>
          <option value="Manager">Manager</option>
        </select>

        {/* Annual CTC */}
        <input
          name="annualCtc"
          placeholder="Annual CTC"
          type="number"
          value={formData.annualCtc}
          onChange={handleChange}
          className="border border-gray-300 rounded-md p-2 bg-white text-gray-900 placeholder-gray-500"
        />

        {/* Base Salary */}
        <input
          name="baseSalary"
          placeholder="Basic Monthly Salary"
          type="number"
          value={formData.baseSalary}
          onChange={handleChange}
          className="border border-gray-300 rounded-md p-2 bg-white text-gray-900 placeholder-gray-500"
        />

        {/* Checkbox */}
        <div className="flex items-center col-span-2">
          <input
            type="checkbox"
            name="isPfApplicable"
            checked={formData.isPfApplicable}
            onChange={handleChange}
            className="mr-2"
          />
          <label className="text-gray-800">PF Applicable</label>
        </div>

        {/* DOB Label + Date Input */}
        <div className="flex flex-col">
          <label htmlFor="doj" className="mb-1 text-sm font-medium text-gray-700">
            DOJ
          </label>
          <input
            type="date"
            id="doj"
            name="doj"
            value={formData.doj}
            onChange={handleChange}
            className="border border-gray-300 rounded-md p-2 bg-white text-gray-900"
          />
        </div>

        {/* Submit Button */}
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
