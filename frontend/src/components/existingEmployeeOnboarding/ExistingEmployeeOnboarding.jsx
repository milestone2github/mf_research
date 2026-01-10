import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import PersonalDetailsSection from "./sections/PersonalDetailsSection";
import ReferenceDetailsSection from "./sections/ReferenceDetailsSection";
import BankDetailsSection from "./sections/BankDetailsSection";
import EducationDetailsSection from "./sections/EducationDetailsSection";
import { useNavigate, useParams } from "react-router-dom";

const API = `${process.env.REACT_APP_API_BASE_URL}/api/onboarding`;

const ExistingEmployeeOnboarding = () => {
  const token = localStorage.getItem("token");
  const { userId } = useParams();
  const [savingSection, setSavingSection] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    personalDetails: {},
    referenceDetails: {},
    bankDetails: {},
    educationalCertificatesAndDegree: {},
  });

  const SECTION_LABELS = {
    personalDetails: "Personal Details",
    referenceDetails: "Reference Details",
    bankDetails: "Bank Details",
    educationalCertificatesAndDegree: "Education Details",
    };


  const [editMode, setEditMode] = useState({
    personalDetails: false,
    referenceDetails: false,
    bankDetails: false,
    educationalCertificatesAndDegree: false,
  });

  /* GET DATA ON LOAD */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = userId
          ? `${process.env.REACT_APP_API_BASE_URL}/api/onboarding/onboarding-details/${userId}`
          : `${API}/me`;

        const { data } = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });

        const onboarding = userId
          ? data.data?.onboarding?.userFilledInfo
          : data;

        setFormData({
          personalDetails: {
            ...onboarding?.personalDetails,
            dob: onboarding?.personalDetails?.dob
              ? onboarding.personalDetails.dob.slice(0, 10)
              : "",
          },
          referenceDetails: onboarding?.referenceDetails || {},
          bankDetails: onboarding?.bankDetails || {},
          educationalCertificatesAndDegree:
            onboarding?.educationalCertificatesAndDegree || {},
        });
      } catch (err) {
        console.error("❌ Failed to fetch onboarding data", err);
      }
    };

    if (token) fetchData();
  }, [token, userId]);

  /* SAVE SINGLE SECTION */
  const saveSection = async (sectionKey) => {
    try {
      setSavingSection(sectionKey);

      const sectionData = formData[sectionKey];
      const payload = new FormData();

      const FILE_FIELDS = new Set([
        "photo",
        "bankVerificationDoc",
        "tenthMarksheet",
        "lastEducationFile",
        "latestUpdateCv",
      ]);

      Object.entries(sectionData).forEach(([key, value]) => {
        if (FILE_FIELDS.has(key)) return;
        if (value instanceof File) return;
        payload.append(`${sectionKey}.${key}`, value ?? "");
      });

      if (sectionKey === "personalDetails" && sectionData.photo instanceof File) {
        payload.append("personalDetails.photo", sectionData.photo);
      }

      if (
        sectionKey === "bankDetails" &&
        sectionData.bankVerificationDoc instanceof File
      ) {
        payload.append(
          "bankDetails.bankVerificationDoc",
          sectionData.bankVerificationDoc
        );
      }

      if (sectionKey === "educationalCertificatesAndDegree") {
        if (sectionData.tenthMarksheet instanceof File)
          payload.append("tenthMarksheetFile", sectionData.tenthMarksheet);

        if (sectionData.lastEducationFile instanceof File)
          payload.append(
            "lastEducationFileUpload",
            sectionData.lastEducationFile
          );

        if (sectionData.latestUpdateCv instanceof File)
          payload.append(
            "latestUpdateCvUpload",
            sectionData.latestUpdateCv
          );
      }

      const saveUrl = userId
        ? `${process.env.REACT_APP_API_BASE_URL}/api/onboarding/user-filled-info/${userId}`
        : `${API}/me`;

      await axios.put(saveUrl, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      toast.success(
        `${SECTION_LABELS[sectionKey] || sectionKey} updated successfully`
        );
      setEditMode((prev) => ({ ...prev, [sectionKey]: false }));
    } catch (err) {
      console.error(`❌ Failed to save ${sectionKey}`, err);
      toast.error(
        err?.response?.data?.message ||
            `Failed to update ${SECTION_LABELS[sectionKey] || sectionKey}`
        );
    } finally {
      setSavingSection(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="
              inline-flex items-center gap-2 px-4 py-2 rounded-full
              bg-white/70 backdrop-blur border shadow
              text-sm font-medium text-gray-700
              hover:bg-white hover:shadow-md
              transition
            "
          >
            ← Back
          </button>
        </div>

        {/* Main Card */}
        <div className="relative bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-10">
          <div className="mb-10">
            <h2 className="text-4xl font-extrabold text-gray-800 tracking-tight">
              Employee Profile
            </h2>
            <p className="mt-2 text-gray-600 max-w-2xl">
              Review, edit, and securely update employee onboarding
              information across all required sections.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-10">
            <PersonalDetailsSection
              data={formData.personalDetails}
              setData={(d) =>
                setFormData((p) => ({ ...p, personalDetails: d }))
              }
              edit={editMode.personalDetails}
              onEdit={() =>
                setEditMode((p) => ({ ...p, personalDetails: true }))
              }
              onCancel={() =>
                setEditMode((p) => ({ ...p, personalDetails: false }))
              }
              onSave={() => saveSection("personalDetails")}
              saving={savingSection === "personalDetails"}
            />

            <ReferenceDetailsSection
              data={formData.referenceDetails}
              setData={(d) =>
                setFormData((p) => ({ ...p, referenceDetails: d }))
              }
              edit={editMode.referenceDetails}
              onEdit={() =>
                setEditMode((p) => ({ ...p, referenceDetails: true }))
              }
              onCancel={() =>
                setEditMode((p) => ({ ...p, referenceDetails: false }))
              }
              onSave={() => saveSection("referenceDetails")}
              saving={savingSection === "referenceDetails"}
            />

            <BankDetailsSection
              data={formData.bankDetails}
              setData={(d) =>
                setFormData((p) => ({ ...p, bankDetails: d }))
              }
              edit={editMode.bankDetails}
              onEdit={() =>
                setEditMode((p) => ({ ...p, bankDetails: true }))
              }
              onCancel={() =>
                setEditMode((p) => ({ ...p, bankDetails: false }))
              }
              onSave={() => saveSection("bankDetails")}
              saving={savingSection === "bankDetails"}
            />

            <EducationDetailsSection
              data={formData.educationalCertificatesAndDegree}
              setData={(d) =>
                setFormData((p) => ({
                  ...p,
                  educationalCertificatesAndDegree: d,
                }))
              }
              edit={editMode.educationalCertificatesAndDegree}
              onEdit={() =>
                setEditMode((p) => ({
                  ...p,
                  educationalCertificatesAndDegree: true,
                }))
              }
              onCancel={() =>
                setEditMode((p) => ({
                  ...p,
                  educationalCertificatesAndDegree: false,
                }))
              }
              onSave={() =>
                saveSection("educationalCertificatesAndDegree")
              }
              saving={
                savingSection ===
                "educationalCertificatesAndDegree"
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExistingEmployeeOnboarding;
