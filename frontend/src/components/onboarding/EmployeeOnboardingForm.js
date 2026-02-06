import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CgSpinner } from "react-icons/cg";
import { Link } from 'react-router-dom';
import jsPDF from "jspdf";
import { useParams } from "react-router-dom";
import { HR_NAME } from '../../utils/stringConstants';
import { useSearchParams } from "react-router-dom";



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



const REPORTING_LOCATIONS = [
  { label: "Delhi", value: "Delhi" },
  { label: "Ferozepur", value: "Ferozepur" },
  { label: "Sonipat", value: "Sonipat" },
];

function fillTemplate(template, values) {
  return template.replace(/{{(.*?)}}/g, (_, key) => {
    return values[key.trim()] ?? "";
  });
}

function renderHtmlToPdf(doc, html, startY, formData, hrSignatureBase64) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const marginLeft = 40;
  const marginRight = 40;
  const textWidth = pageWidth - marginLeft - marginRight;

  const lineHeight = 16;
  const bottomMargin = 72;

  let y = startY;
  let candidateBlockRendered = false;
  let skipNextParagraph = false;


  const ensureSpace = (extra = 0) => {
    if (y + extra > pageHeight - bottomMargin) {
      doc.addPage();
      y = 80;
    }
  };

  const SECTION_HEADINGS = [
    "Compensation & Salary Structure",
    "Probation Period",
    "Confirmation & Benefits",
    "Work Location & Company Assets",
    "Company Policies & Notice Period",
    "Pre-Employment Verification",
  ];

  /* ===================== HELPERS ===================== */

  function renderBullet(text, indent = 0) {
    ensureSpace(24);
    const effectiveWidth = textWidth - indent - 32;
    const lines = doc.splitTextToSize(text, effectiveWidth);

    doc.circle(marginLeft + indent + 4, y - 4, 2.5, "F");
    doc.text(lines, marginLeft + indent + 16, y);

    y += lines.length * lineHeight + 10;
  }

  function renderUl(ulHtml, indent = 0) {
    const liMatches = [...ulHtml.matchAll(/<li>([\s\S]*?)<\/li>/gi)];

    liMatches.forEach(match => {
      let liContent = match[1].trim();

      // Extract nested UL if present
      const nestedUlMatch = liContent.match(/<ul>[\s\S]*<\/ul>/i);
      let nestedUl = null;

      if (nestedUlMatch) {
        nestedUl = nestedUlMatch[0];
        liContent = liContent.replace(nestedUl, "").trim();
      }

      // Render main bullet
      const cleanText = liContent.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
      if (cleanText) {
        renderBullet(cleanText, indent);
      }

      // Render nested bullets
      if (nestedUl) {
        renderUl(nestedUl, indent + 20);
      }
    });

    y += 6;
  }

  /* ===================== PARSING ===================== */

  html = html.replace(/\n+/g, "\n");
  const blocks = html.match(/<(h2|p|ul)[\s\S]*?<\/\1>/gi) || [];

  blocks.forEach(block => {

    /* ===================== TITLE ===================== */
    if (block.startsWith("<h2")) {
      const text = block.replace(/<[^>]+>/g, "").trim();

      ensureSpace(40);
      doc.setFont("times", "bold");
      doc.setFontSize(16);
      doc.text(text, pageWidth / 2, y, { align: "center" });
      y += 50;

      if (!candidateBlockRendered) {
        doc.setFont("times", "normal");
        doc.setFontSize(13);

        doc.text(formData.name, marginLeft, y);
        doc.text(
          `Date: ${formatLongDate(new Date())}`,
          pageWidth - marginRight,
          y,
          { align: "right" }
        );

        y += 18;
        doc.text(formData.city, marginLeft, y);
        y += 28;

        candidateBlockRendered = true;
        skipNextParagraph = true; 
      }

      return;
    }

    /* ===================== PARAGRAPHS ===================== */
    if (block.startsWith("<p")) {
      const text = block.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

      if (skipNextParagraph) {
        skipNextParagraph = false;
        return;
      }

      if (!text) return;


      // Declaration signature block
      if (text.startsWith("Name:")) {
        doc.text(`Name: ${formData.name}`, marginLeft, y);
        y += 28;
        doc.text("Signature:", marginLeft, y);
        y += 28;
        doc.text("Date:", marginLeft, y);
        y += 32;
        return;
      }

      // Warm Regards block
      if (text.startsWith("Warm Regards")) {
        ensureSpace(120);
        doc.text("Warm Regards,", marginLeft, y);
        y += 18;
        if (hrSignatureBase64) {
        doc.addImage(hrSignatureBase64, "PNG", marginLeft, y, 110, 45);
      }

        y += 60 + 8;
        doc.text(HR_NAME, marginLeft, y);
        y += 18;
        doc.text("HR", marginLeft, y);
        y += 18;
        doc.text("Milestone Global Moneymart Private Limited", marginLeft, y);
        y += 30;
        return;
      }

      // Section headings
      if (SECTION_HEADINGS.includes(text)) {
        ensureSpace(30);
        doc.setFont("times", "bold");
        doc.setFontSize(14);
        doc.text(text, marginLeft, y);
        y += 28;
        doc.setFont("times", "normal");
        doc.setFontSize(13);
        return;
      }

      // Normal paragraph
      ensureSpace(24);
      const lines = doc.splitTextToSize(text, textWidth);
      doc.text(lines, marginLeft, y);
      y += lines.length * lineHeight + 12;
      return;
    }

    
    /* ===================== UL (FULL SUPPORT) ===================== */
    if (block.startsWith("<ul")) {
      renderUl(block, 0);
    }
  });

  return y;
}


async function generateOfferLetterPDF({ formData, offerTemplate, letterRole,  postProbationNotice, incentiveClause,  pfClause, }) {
  const doc = new jsPDF("p", "pt", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const headerImageBase64 = offerTemplate.settings.headerImageBase64;
  const hrSignatureBase64 = offerTemplate.settings.hrSignatureImageBase64;



  // HEADER
  if (headerImageBase64) {
  doc.addImage(headerImageBase64, "PNG", 0, 0, pageWidth, 150);
}


  // TEMPLATE
  const filledHtml = fillTemplate(offerTemplate.body, {
  // ---- ROLE ----
  Job_Title: letterRole,

  // ---- CANDIDATE ----
  Candidate_Name: formData.name,
  Candidate_First_Name: formData.name.split(" ")[0],
  Candidate_Location: formData.city,

  // ---- DATES ----
  Date_of_Joining: formatShortDate(formData.doj),

  // ---- COMPENSATION ----
  Annual_CTC: Number(formData.annualCtc || 0).toLocaleString("en-IN"),
  Monthly_Inhand: Number(formData.baseSalary || 0).toLocaleString("en-IN"),

  // ---- COMPANY ----
  Company_Name: offerTemplate.settings.companyName || "Milestone Global Moneymart Private Limited",
  Offer_Validity_Days: offerTemplate.settings.offerValidityDays || 2,

  // ---- PROBATION ----
  Probation_Months: offerTemplate.settings.probationMonths || "3",
  Probation_Notice_Days: offerTemplate.settings.probationNoticeDays || "7",
  Post_Probation_Notice: postProbationNotice
    ? `${postProbationNotice} from either side or salary in lieu thereof, or a combination of both`
    : "",
   
  // ---- PF CLAUSE ----
  PF_Clause: pfClause || "",

  // ---- INCENTIVE CLAUSE ----
  Incentive_Clause: incentiveClause,


  // ---- LOCATION ----
  Office_Location: formData.reportingLocation || "the assigned office location",
  Onboarding_Location: formData.reportingLocation || "the assigned office location",

  // ---- HR ----
  HR_Name: HR_NAME,
  HR_Designation: "HR",
  HR_Phone: offerTemplate.settings.hrPhone ,
  HR_Email: offerTemplate.settings.hrEmail ,

  // ---- VERIFICATION ----
  Verification_Vendor: "Spring Verify",
});



  renderHtmlToPdf(doc, filledHtml, 190, formData, hrSignatureBase64);

  return doc.output("blob");
}


const LOCAL_API_BASE = `${process.env.REACT_APP_API_BASE_URL}/api/onboarding`;

const EmployeeOnboardingForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type"); // "intern" | "fulltime" | null
  const [offerTemplate, setOfferTemplate] = useState(null);

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
    gender: '',
    isIntern: type === "intern",
    postProbationNoticeValue: '',
    postProbationNoticeUnit: 'days', // days | months
    incentiveStructure: 'NOT_APPLICABLE', // NOT_APPLICABLE | DOJ | POST_PROBATION
  });

  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const isIntern = type === "intern";
  const isFullTime = type === "fulltime";


    useEffect(() => {
    if (isIntern) {
      setFormData(prev => ({
        ...prev,
        isPfApplicable: false
      }));
    }
  }, [isIntern]);



const { userId } = useParams();
const isEditMode = Boolean(userId);

// Fetch existing data in edit mode
  useEffect(() => {
  if (!isEditMode) return;

  fetch(`${LOCAL_API_BASE}/onboarding-form/${userId}`)
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setFormData(data.data);

        if (data.data?.department) {
          fetchRoles(data.data.department);
     }
      }
    });
}, [userId, isEditMode]);

// Fetch offer letter template on mount
    useEffect(() => {
      const fetchTemplate = async () => {
        try {
          const res = await fetch(
            `${LOCAL_API_BASE}/offer-letter/template?type=${type || "fulltime"}`
          );
          const json = await res.json();
          if (json.success) {
            setOfferTemplate(json.data);
          }
        } catch (err) {
          console.error("Failed to load offer letter template", err);
        }
      };

      fetchTemplate();
    }, [type]);


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

   if (name === 'department') {
  await fetchRoles(value);
  }

};


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {

    const finalData = { ...formData };
    const selectedRole = roles.find(r => r._id === formData.role);
    const letterRole = selectedRole?.name || formData.role;

    


    if (!offerTemplate?.body) {
      alert("Offer letter template not loaded");
      return;
    }

    const postProbationNotice =
    formData.postProbationNoticeValue
      ? `${formData.postProbationNoticeValue} ${formData.postProbationNoticeUnit}`
      : "";

      let incentiveClause = "";

      if (formData.incentiveStructure === "DOJ") {
        incentiveClause = offerTemplate?.settings?.incentiveClauseDoj || "";
      }

      if (formData.incentiveStructure === "POST_PROBATION") {
        incentiveClause = offerTemplate?.settings?.incentiveClausePostProbation || "";
      }

      let pfClause = "";

      if (isFullTime && formData.isPfApplicable) {
        pfClause = offerTemplate?.settings?.pfClause || "";
      }

   
      finalData.pfApplicable = isFullTime && formData.isPfApplicable;
      finalData.pfClause = pfClause;



    // Generate PDF as Blob
    const pdfBlob = await generateOfferLetterPDF({
      formData: finalData,
      offerTemplate,
      letterRole,
      postProbationNotice,
      incentiveClause,
      pfClause,
    });

    // Create FormData for binary upload
    const formDataToSend = new FormData();

    Object.entries(finalData).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });

    formDataToSend.append("offerLetterPdf", pdfBlob, `OfferLetter-${finalData.name}.pdf`);

   const url = isEditMode
    ? `${LOCAL_API_BASE}/onboarding-form/${userId}`
    : `${LOCAL_API_BASE}/onboarding-form`;

  const method = isEditMode ? "PUT" : "POST";

  const response = await fetch(url, {
    method,
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
      to="/onboarding/select-type" 
      className="text-blue-600 hover:underline text-sm mb-2 inline-block"
    >
      ← 
    </Link>
    <div className="flex items-center justify-between mb-8">
    <h2 className="text-3xl font-bold text-gray-800 tracking-wide">
      {isEditMode ? "Edit Employee Details" : "Onboard New Employee"}
    </h2>

    {/* BADGES */}
    <div className="flex gap-2">
      {isIntern && (
        <span className="text-xs font-semibold bg-purple-100 text-purple-700 px-4 py-1 rounded-full">
          Intern
        </span>
      )}

      {isFullTime && (
        <span className="text-xs font-semibold bg-green-100 text-green-700 px-4 py-1 rounded-full">
          Employee
        </span>
      )}
    </div>
  </div>



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
          </select>
        </div>

        {/* Role */}
        <div className="flex flex-col">
          <label htmlFor="role" className="mb-1 text-sm font-medium text-gray-700">Role</label>
          <select name="role" id="role" value={formData.role} onChange={handleChange}
            className="border border-gray-300 rounded-md p-2 bg-white text-gray-900" required  // optional: disable select if dept is Other
>
            <option value="">Select Role
            </option>
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
        <label htmlFor="reportingLocation" className="mb-1 text-sm font-medium text-gray-700">
          Reporting Location
        </label>
        <select
          name="reportingLocation"
          id="reportingLocation"
          value={formData.reportingLocation}
          onChange={handleChange}
          className="border border-gray-300 rounded-md p-2 bg-white text-gray-900"
          required
        >
          <option value="">Select Reporting Location</option>
          {REPORTING_LOCATIONS.map(loc => (
            <option key={loc.value} value={loc.value}>
              {loc.label}
            </option>
          ))}
        </select>
      </div>


        {/* PF Checkbox */}
            {isFullTime && (
        <div className="flex items-center col-span-2 mt-2">
          <input
            type="checkbox"
            id="isPfApplicable"
            name="isPfApplicable"
            checked={formData.isPfApplicable}
            onChange={handleChange}
            className="mr-2"
          />
          <label htmlFor="isPfApplicable" className="text-gray-800">
            PF Applicable
          </label>
        </div>
      )}

        {/* DOJ */}
        <div className="flex flex-col">
          <label htmlFor="doj" className="mb-1 text-sm font-medium text-gray-700">Date of Joining (DOJ)</label>
          <input type="date" id="doj" name="doj" min={new Date().toISOString().split('T')[0]} value={formData.doj} onChange={handleChange}
            className="border border-gray-300 rounded-md p-2 bg-white text-gray-900" required />
        </div>

                {/* Post Probation Notice Period */}
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700">
            Post-Probation Notice Period
          </label>

          <div className="flex gap-3">
            <input
              type="number"
              min="1"
              required
              name="postProbationNoticeValue"
              placeholder="e.g. 30"
              value={formData.postProbationNoticeValue}
              onChange={handleChange}
              className="border border-gray-300 rounded-md p-2 w-1/2"
            />

            <select
              name="postProbationNoticeUnit"
              value={formData.postProbationNoticeUnit}
              onChange={handleChange}
              className="border border-gray-300 rounded-md p-2 w-1/2"
            >
              <option value="days">Days</option>
              <option value="months">Months</option>
            </select>
          </div>
        </div>

        {/* Incentive Structure */}
        <div className="flex flex-col col-span-2">
          <label className="mb-2 text-sm font-medium text-gray-700">
            Incentive Structure
          </label>

          <div className="flex gap-4">
            <label className={`px-4 py-2 rounded-md cursor-pointer border
              ${formData.incentiveStructure === 'NOT_APPLICABLE'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700'}`}>
              <input
                type="radio"
                name="incentiveStructure"
                value="NOT_APPLICABLE"
                checked={formData.incentiveStructure === 'NOT_APPLICABLE'}
                onChange={handleChange}
                className="hidden"
              />
              Not Applicable
            </label>

            <label className={`px-4 py-2 rounded-md cursor-pointer border
              ${formData.incentiveStructure === 'DOJ'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700'}`}>
              <input
                type="radio"
                name="incentiveStructure"
                value="DOJ"
                checked={formData.incentiveStructure === 'DOJ'}
                onChange={handleChange}
                className="hidden"
              />
              Applicable from DOJ
            </label>

            <label className={`px-4 py-2 rounded-md cursor-pointer border
              ${formData.incentiveStructure === 'POST_PROBATION'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700'}`}>
              <input
                type="radio"
                name="incentiveStructure"
                value="POST_PROBATION"
                checked={formData.incentiveStructure === 'POST_PROBATION'}
                onChange={handleChange}
                className="hidden"
              />
              Applicable from Date of Probation
            </label>
          </div>
        </div>


        {/* Fresher / Experienced */}
{isFullTime && (
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
)}


        {/* Submit */}
        <div className="col-span-2">
          <button type="submit" disabled={loading}
            className={`w-full py-2 rounded-xl font-semibold transition duration-150 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}>
            {loading ? (
            <span className="flex justify-center items-center gap-2">
              <CgSpinner className="animate-spin h-5 w-5 text-white" />
              {isEditMode ? "Updating..." : "Submitting..."}
            </span>
          ) : (
            isEditMode ? "Update & Resend Offer" : "Submit"
          )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeOnboardingForm;
