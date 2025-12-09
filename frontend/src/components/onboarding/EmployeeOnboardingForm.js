import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CgSpinner } from "react-icons/cg";
import { Link } from 'react-router-dom';
import jsPDF from "jspdf";
import HeaderImage from '../../assets/Header1.png';
import SignatureImage from '../../assets/SirSign.png';



function formatLongDate(dateInput) {
  const d = new Date(dateInput);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
} 


function formatShortDate(dateInput) {
  const d = new Date(dateInput);
  return d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function generateOfferLetterPDF(formData) {
  const doc = new jsPDF("p", "pt", "a4");

  // Insert header image
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.addImage(HeaderImage, "PNG", 20, 20, pageWidth - 40, 110);

  const marginLeft = 40;
  const marginRight = 40;
  const textWidth = doc.internal.pageSize.getWidth() - marginLeft - marginRight;
  const lineHeight = 16;
  const paraGap = 22;
  const pageHeight = doc.internal.pageSize.getHeight();
  const bottomMargin = 72;

  let y = 150;

  const todayFormatted = formatLongDate(new Date());
  const dojShort = formatShortDate(formData.doj);

  const salutation = formData.gender === "female" ? "Ms." : "Mr.";
  const firstName = (formData.name || "").split(" ")[0];
  const roleText = formData.letterRole || formData.role;

  const annualCtcNumber = Number(formData.annualCtc || 0);
  const baseSalaryNumber = Number(formData.baseSalary || 0);

  const annualCtcFormatted = annualCtcNumber.toLocaleString("en-IN");
  const baseSalaryFormatted = baseSalaryNumber.toLocaleString("en-IN");
  const ctcLakhs = (annualCtcNumber / 100000 || 0).toFixed(2);

  doc.setFont("times", "normal");
  doc.setFontSize(12);

  const ensurePageSpace = (extra = 0) => {
    if (y + extra > pageHeight - bottomMargin) {
      doc.addPage();
      y = 72;
    }
  };

  const addParagraph = (text, extraGap = paraGap) => {
    ensurePageSpace(lineHeight * 3);
    const lines = doc.splitTextToSize(text, textWidth);
    doc.text(lines, marginLeft, y);
    y += lines.length * lineHeight + extraGap;
  };

  const addRichParagraph = (segments, extraGap = paraGap) => {
    ensurePageSpace(lineHeight * 3);
    let x = marginLeft;

    segments.forEach((seg) => {
      const words = seg.text.split(" ");
      doc.setFont("times", seg.bold ? "bold" : "normal");

      words.forEach((word, i) => {
        if (!word) return;
        const token = i === words.length - 1 ? word : word + " ";
        const w = doc.getTextWidth(token);

        if (x + w > marginLeft + textWidth) {
          x = marginLeft;
          y += lineHeight;
          ensurePageSpace();
        }

        doc.text(token, x, y);
        x += w;
      });
    });

    y += extraGap;
    doc.setFont("times", "normal");
  };

  // ---------- HEADER ----------
  doc.text(todayFormatted, marginLeft, y);
  y += 40;

  doc.text(`${salutation} ${formData.name}`, marginLeft, y);
  y += 18;

  doc.text(formData.city, marginLeft, y);
  y += 40;

  doc.text(`Dear ${firstName},`, marginLeft, y);
  y += 34;

  // Paragraphs
  addRichParagraph([
    {
      text:
        "I would like to congratulate you on-behalf of Milestone Global Moneymart Private Limited alongside welcoming you to our family. We are excited to offer you a position in our organisation for ",
      bold: false,
    },
    { text: roleText, bold: true },
    { text: ".", bold: false },
  ]);

  addRichParagraph([
    {
      text:
        "This offer letter will be valid for 2 working days for you to accept the job from the date of receipt. The date of joining as set by the terms of the offer letter will be ",
      bold: false,
    },
    { text: dojShort, bold: true },
    { text: " with option for extension of 1 week available on request.", bold: false },
  ]);

  addParagraph(
    "As per our discussion done during the interview are stated as followed to prevent any miscommunication on either part -",
    4
  );

  // ---------- BULLET LIST (UPDATED) ----------
  const bullets = [
    `Your annual compensation will be ${annualCtcFormatted} INR subject to tax and other statutory deductions. EPF deductions will be mandatory and set at 12% of basic pay or 1800 INR per month with equal contribution from employer, if opted. Making your net-inhand compensation ${baseSalaryFormatted} INR per month. Your CTC (Cost to Company) will be ${ctcLakhs} Lakhs annually approximately.`,
    "For the first three months from the joining date, you'll be appointed as probationary officer, where the notice period in case of resignation or termination will be 07 days from either side or in-lieu 07 days of pay to waive notice period or any combination thereof. Your probation period can be extended on discretion of Milestone.",
    `You'll be reporting to our ${formData.reportingLocation} office.`,
    "NISM VA qualification will be mandatory within probationary period, if you're appointed in Mutual Fund Sales.",
    "After the probation period, you'll be regarded as a permanent employee on the payroll of the organisation where you'll be eligible for the following -",
    "Corporate Health Insurance for the employee for which the premium will be borne by the organisation.",
    "Corporate Personal Accidental Policy for the employee for which the premium will be borne by the organisation.",
    "You'll be eligible for the Gratuity Scheme as per the government issued guidelines, where the 15 days of your basic pay will be accumulated annually and paid to you in case of cessation of employment from either side.",
    "On date of joining, we expect you to be present physically at our Rohini, Delhi office for onboarding where you'll also be provided with SIM card for official Number, Laptop ( Owned by Milestone Global Moneymart (P) Ltd. and maintained by employee ).",
    "From date of joining, you'll abide by HR policies as issued by the organisation. The policy will supersede any or all terms and conditions as stated under the offer letter.",
    "Your notice period will be set as 1 month from either side or in-lieu same days of pay or a combination of both.",
    "You'll be eligible for the incentive structure from the end of your probation period.",
  ];

  const bulletIndent = marginLeft + 14;
  const bulletDotX = marginLeft + 4;

  bullets.forEach((text) => {
    const lines = doc.splitTextToSize(text, textWidth - 32);
    const requiredHeight = lines.length * lineHeight + 10;

    if (y + requiredHeight > pageHeight - bottomMargin) {
      doc.addPage();
      y = 72;
    }

    doc.circle(bulletDotX, y - 4, 2.5, "F"); // BULLET SIZE 2.5

    doc.setFontSize(13);
    doc.text(lines, bulletIndent, y);
    doc.setFontSize(12);

    // LINE GAP BELOW EACH BULLET
    y += lines.length * lineHeight + 10;
  });

  // Extra gap after bullet section
  y += 20;

  // ---------- FINAL PARAGRAPHS ----------
  addParagraph(
    "Before your date of joining, you will receive an email from Spring Verify to complete pre-employment verification. You will be deemed unfit until you have completed that verification form.",
    26
  );

  addParagraph(
    "For any information, clarification you may contact the undersigned at +91 9910076952 or jobs@niveshonline.com.",
    42
  );

  doc.text("Regards,", marginLeft, y);
  y += 50;

  doc.addImage(SignatureImage, "PNG", marginLeft, y, 140, 60, undefined, "NONE");
  y += 70;

  doc.text("Vilakshan Bhutani", marginLeft, y);
  y += 18;
  doc.text("Executive Director", marginLeft, y);
  y += 18;
  doc.text("Milestone Global Moneymart Private Limited", marginLeft, y);
  y += 35;

  addParagraph(
    "I have read all terms and conditions and will abide by them in all scenarios.",
    30
  );

  doc.text(`${salutation} ${formData.name}`, marginLeft, y);

   return doc.output("blob");
}


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
    reportingLocation: '',
    gender: ''
  });

  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

//For "Other" handling
const [departmentIsOther, setDepartmentIsOther] = useState(false);
const [roleIsOther, setRoleIsOther] = useState(false);
const [departmentOtherText, setDepartmentOtherText] = useState("");
const [roleOtherText, setRoleOtherText] = useState("");

  // Fetch departments on mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await fetch(`${LOCAL_API_BASE}/department`);
        const json = await res.json();
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

  // --- Department ---
  if (name === 'department') {
    if (value === 'others') {
      setDepartmentIsOther(true);
      setRoles([]);           // no roles to fetch
      setRoleIsOther(false);  // reset roleOther state if switching dept
    } else {
      setDepartmentIsOther(false);
      await fetchRoles(value);
    }
  }

  // --- Role ---
  if (name === 'role') {
    if (value === 'others') {
      setRoleIsOther(true);
    } else {
      setRoleIsOther(false);
    }
  }
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
    
    const finalData = {
      ...formData,
      department: departmentIsOther ? departmentOtherText.trim() : formData.department,
      role: (roleIsOther || departmentIsOther) ? roleOtherText.trim() : formData.role,
    };

    let letterRole = roleOtherText.trim();
    if (!departmentIsOther && !roleIsOther) {
      const selectedRole = roles.find(r => r._id === formData.role);
      letterRole = selectedRole?.name || formData.role;
    }

    // Generate PDF as Blob
    const pdfBlob = generateOfferLetterPDF({
      ...finalData,
      letterRole,
    });

    // Create FormData for binary upload
    const formDataToSend = new FormData();

    Object.entries(finalData).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });

    formDataToSend.append("offerLetterPdf", pdfBlob, `OfferLetter-${finalData.name}.pdf`);

      const response = await fetch(`${LOCAL_API_BASE}/onboarding-form`, {
       method: 'POST',
       body: formDataToSend,      
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
      <Link 
      to="/onboarding" 
      className="text-blue-600 hover:underline text-sm mb-2 inline-block"
    >
      ← 
    </Link>
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
      
        {/* Gender */}
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium text-gray-700">Gender</label>
          <div className="flex gap-4">
            <label className={`px-4 py-2 rounded-md cursor-pointer border ${formData.gender==='male' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}>
              <input
                type="radio"
                name="gender"
                value="male"
                checked={formData.gender === 'male'}
                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                className="hidden"
              />
              Male
            </label>

            <label className={`px-4 py-2 rounded-md cursor-pointer border ${formData.gender==='female' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}>
              <input
                type="radio"
                name="gender"
                value="female"
                checked={formData.gender === 'female'}
                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                className="hidden"
              />
              Female
            </label>
          </div>
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
            <option value="others">Others</option>
          </select>
          {departmentIsOther && (
            <input
              type="text"
              className="mt-2 border border-gray-300 rounded-md p-2 bg-white text-gray-900 placeholder-gray-500"
              placeholder="Enter department"
              value={departmentOtherText}
              onChange={(e) => setDepartmentOtherText(e.target.value)}
              required
            />
          )}
        </div>

        {/* Role */}
        <div className="flex flex-col">
          <label htmlFor="role" className="mb-1 text-sm font-medium text-gray-700">Role</label>
          <select name="role" id="role" value={formData.role} onChange={handleChange}
            className="border border-gray-300 rounded-md p-2 bg-white text-gray-900" required disabled={departmentIsOther}  // optional: disable select if dept is Other
>
            <option value="">Select Role</option>
            {roles.map((role) => (
              <option key={role._id} value={role._id}>{role.name}</option>
            ))}
              <option value="others">Others</option>
          </select>
          {(roleIsOther || departmentIsOther) && (
            <input
              type="text"
              className="mt-2 border border-gray-300 rounded-md p-2 bg-white text-gray-900 placeholder-gray-500"
              placeholder="Enter role/designation"
              value={roleOtherText}
              onChange={(e) => setRoleOtherText(e.target.value)}
              required
            />
          )}
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
