import React, { useState } from "react";
import Header from "../common/PortfolioResearchHeader";
import AccessDenied from "./AccessDenied";
import { useSelector } from "react-redux";

const CasImport = () => {
  const [panNumber, setPanNumber] = useState("");
  const [email, setEmail] = useState("");
  const [casFile, setCasFile] = useState(null);
  const [pdfPassword, setPdfPassword] = useState("");

  const { userData } = useSelector(state => state.user);
  const permissions = userData?.role?.permissions;

  const handlePanChange = (e) => {
    const upperCasePan = e.target.value.toUpperCase();
    setPanNumber(upperCasePan);
  };
  const handleEmailChange = (e) => setEmail(e.target.value);
  const handleCasUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setCasFile(file);
    } else {
      alert("Please select a PDF file.");
      setCasFile(null);
    }
  };

  const handleCasTrigger = () => {
    // Basic regex for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!panNumber) {
      alert("Please enter the PAN number.");
      return;
    }

    if (panNumber.length !== 10) {
      alert("PAN number must be 10 characters long.");
      return;
    }

    if (!email) {
      alert("Please enter the Email ID.");
      return;
    }

    if (!emailRegex.test(email)) {
      alert("Please enter a valid Email ID.");
      return;
    }

    console.log("CAS triggered with PAN:", panNumber, "and Email:", email);
    // Add your logic to trigger CAS here
  };

  const handlePdfUpload = () => {
    if (!casFile) {
      alert("Please select a CAS file to upload.");
      return;
    }
    if (!pdfPassword) {
      alert("Please enter the password for the PDF.");
      return;
    }
    console.log(
      "PDF uploaded for CAS:",
      casFile.name,
      "with password:",
      pdfPassword
    );
    // Further processing logic here
  };

  if(!permissions.find(perm => perm === 'Portfolio Analysis')) 
    return (<AccessDenied />)

  return (
    <div>
      <Header title="Portfolio Analysis - Import CAS" />
      <div className="cas-import-container">
        <div className="cas-import-content">
          <div className="section cas-trigger-section">
            <h2>Trigger CAS</h2>
            <input
              type="text"
              placeholder="Enter PAN Number"
              className="input-field"
              value={panNumber}
              onChange={handlePanChange}
              maxLength="10"
            />
            <input
              type="email"
              placeholder="Enter Email ID"
              className="input-field"
              value={email}
              onChange={handleEmailChange}
            />
            <button className="action-button" onClick={handleCasTrigger}>
              Trigger CAS
            </button>
          </div>
          <div className="separator">OR</div>
          <div className="section pdf-upload-section">
            <h2>CAS Upload</h2>
            <input
              type="file"
              className="input-file"
              accept="application/pdf"
              onChange={handleCasUpload}
            />
            <input
              type="password"
              placeholder="Enter PDF password"
              className="input-field"
              value={pdfPassword}
              onChange={(e) => setPdfPassword(e.target.value)}
            />
            <button className="action-button" onClick={handlePdfUpload}>
              Upload PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CasImport;
