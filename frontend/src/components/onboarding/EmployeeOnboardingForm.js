import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CgSpinner } from "react-icons/cg";


const LOCAL_API_BASE = `${process.env.REACT_APP_API_BASE_URL}/api/onboarding`;

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
    isExperienced: false,
    doj: '',
    city: '',
    reportingLocation: ''
  });

  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch departments on mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await fetch(`${LOCAL_API_BASE}/department`);
        const json = await res.json();
        console.log("Departments fetched:", json);
        if (json?.data) setDepartments(json.data);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };
    fetchDepartments();
  }, []);

  // Fetch roles based on selected department
  const fetchRoles = async (deptId) => {
    try {
      const res = await fetch(`${LOCAL_API_BASE}/roles?dept=${deptId}`);
      const json = await res.json();
      console.log("Roles fetched:", json);
      if (json?.data) setRoles(json.data);
      else setRoles([]);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const handleChange = async (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'department' ? { role: '' } : {}), // Reset role if department changes
    }));

    if (name === 'department') {
      await fetchRoles(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${LOCAL_API_BASE}/onboarding-form`, {
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
      <h2 className="text-3xl font-bold mb-8 text-gray-800 tracking-wide">Onboard New Employee</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">

        {/* Name */}
        <div className="flex flex-col">
          <label htmlFor="name" className="mb-1 text-sm font-medium text-gray-700">Name</label>
          <input name="name" id="name" placeholder="Name" value={formData.name} onChange={handleChange}
            className="border border-gray-300 rounded-md p-2 bg-white text-gray-900 placeholder-gray-500" required />
        </div>

        {/* Email */}
        <div className="flex flex-col">
          <label htmlFor="personalEmail" className="mb-1 text-sm font-medium text-gray-700">Email</label>
          <input name="personalEmail" id="personalEmail" placeholder="Email" value={formData.personalEmail} onChange={handleChange}
            className="border border-gray-300 rounded-md p-2 bg-white text-gray-900 placeholder-gray-500" required />
        </div>

        {/* Phone */}
        <div className="flex flex-col">
          <label htmlFor="phone" className="mb-1 text-sm font-medium text-gray-700">Phone</label>
          <input name="phone" id="phone" placeholder="Phone" value={formData.phone} onChange={handleChange}
            className="border border-gray-300 rounded-md p-2 bg-white text-gray-900 placeholder-gray-500" required />
        </div>

        {/* Department */}
        <div className="flex flex-col">
          <label htmlFor="department" className="mb-1 text-sm font-medium text-gray-700">Department</label>
          <select name="department" id="department" value={formData.department} onChange={handleChange}
            className="border border-gray-300 rounded-md p-2 bg-white text-gray-900" required>
            <option value="">Select Department</option>
            {departments.map((dept) => (
              <option key={dept._id} value={dept._id}>{dept.name}</option>
            ))}
          </select>
        </div>

        {/* Role */}
        <div className="flex flex-col">
          <label htmlFor="role" className="mb-1 text-sm font-medium text-gray-700">Role</label>
          <select name="role" id="role" value={formData.role} onChange={handleChange}
            className="border border-gray-300 rounded-md p-2 bg-white text-gray-900" required>
            <option value="">Select Role</option>
            {roles.map((role) => (
              <option key={role._id} value={role._id}>{role.name}</option>
            ))}
          </select>
        </div>

        {/* Annual CTC */}
        <div className="flex flex-col">
          <label htmlFor="annualCtc" className="mb-1 text-sm font-medium text-gray-700">Annual CTC</label>
          <input type="number" name="annualCtc" id="annualCtc" placeholder="Annual CTC" value={formData.annualCtc} onChange={handleChange}
            className="border border-gray-300 rounded-md p-2 bg-white text-gray-900 placeholder-gray-500" required />
        </div>

        {/* City  */}
        <div className="flex flex-col">
          <label htmlFor="city" className="mb-1 text-sm font-medium text-gray-700">City</label>
          <input
            name="city"
            id="city"
            placeholder="Residential City"
            value={formData.city}
            onChange={handleChange}
            className="border border-gray-300 rounded-md p-2 bg-white text-gray-900 placeholder-gray-500"
            required
          />
        </div>

        {/* Monthly Salary */}
        <div className="flex flex-col">
          <label htmlFor="baseSalary" className="mb-1 text-sm font-medium text-gray-700">Monthly In-hand Salary</label>
          <input type="number" name="baseSalary" id="baseSalary" placeholder="Monthly In-hand Salary" value={formData.baseSalary} onChange={handleChange}
            className="border border-gray-300 rounded-md p-2 bg-white text-gray-900 placeholder-gray-500" required />
        </div>


        {/* Reporting Location (between Monthly In-hand Salary and PF Applicable) */}
        <div className="flex flex-col">
          <label htmlFor="reportingLocation" className="mb-1 text-sm font-medium text-gray-700">Reporting Location</label>
          <input
            name="reportingLocation"
            id="reportingLocation"
            placeholder="Reporting Location"
            value={formData.reportingLocation}
            onChange={handleChange}
            className="border border-gray-300 rounded-md p-2 bg-white text-gray-900 placeholder-gray-500"
            required
          />
        </div>


        {/* PF Checkbox */}
        <div className="flex items-center col-span-2 mt-2">
          <input type="checkbox" id="isPfApplicable" name="isPfApplicable" checked={formData.isPfApplicable} onChange={handleChange}
            className="mr-2" />
          <label htmlFor="isPfApplicable" className="text-gray-800">PF Applicable</label>
        </div>

        {/* DOJ */}
        <div className="flex flex-col">
          <label htmlFor="doj" className="mb-1 text-sm font-medium text-gray-700">Date of Joining (DOJ)</label>
          <input type="date" id="doj" name="doj" min={new Date().toISOString().split('T')[0]} value={formData.doj} onChange={handleChange}
            className="border border-gray-300 rounded-md p-2 bg-white text-gray-900" required />
        </div>

        {/* Fresher / Experienced */}
<div className="flex flex-col col-span-2">
  <label className="mb-2 text-sm font-medium text-gray-700">Candidate Type</label>
  <div className="flex gap-4">
    <div>
      <input
        type="radio"
        id="fresher"
        name="isExperienced"
        value="false"
        checked={!formData.isExperienced}
        onChange={() => setFormData((prev) => ({ ...prev, isExperienced: false }))}
        className="hidden"
      />
      <label
        htmlFor="fresher"
        className={`px-4 py-2 rounded-md cursor-pointer border block text-center ${
          !formData.isExperienced
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white text-gray-700 border-gray-300'
        }`}
      >
        Fresher
      </label>
    </div>

    <div>
      <input
        type="radio"
        id="experienced"
        name="isExperienced"
        value="true"
        checked={formData.isExperienced}
        onChange={() => setFormData((prev) => ({ ...prev, isExperienced: true }))}
        className="hidden"
      />
      <label
        htmlFor="experienced"
        className={`px-4 py-2 rounded-md cursor-pointer border block text-center ${
          formData.isExperienced
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white text-gray-700 border-gray-300'
        }`}
      >
        Experienced
      </label>
    </div>
  </div>

  {/* Small grey info line */}
  <p className="text-xs text-gray-500 mt-1">
    Used only for internal purpose during the Spring Verification setup
  </p>
</div>


        {/* Submit */}
        <div className="col-span-2">
          <button type="submit" disabled={loading}
            className={`w-full py-2 rounded-xl font-semibold transition duration-150 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}>
            {loading ? (
              <span className="flex justify-center items-center gap-2">
                <CgSpinner className="animate-spin h-5 w-5 text-white" />

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
