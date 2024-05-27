import React from "react";
import { useNavigate } from "react-router-dom";
import PortfolioAnalysisImage from "../../assets/PortfolioAnalysisImage.png";
import AccessDenied from "./AccessDenied";
import { useSelector } from "react-redux";

const PortfolioReport = () => {
  const navigate = useNavigate();
  const { userData } = useSelector(state => state.user);
  const permissions = userData?.role?.permissions;

  if(!permissions.find(perm => perm === 'Portfolio Analysis')) 
    return (<AccessDenied />)

  return (
    <div className="portfolio-analysis">
      <h2 className="report-heading">Portfolio Analysis</h2>
      <div className="image-container">
        <img
          src={PortfolioAnalysisImage}
          alt="Portfolio Analysis"
          className="portfolio-image"
        />
      </div>
      <div className="buttons-container">
        <button
          className="report-button"
          onClick={() => navigate("/existing-portfolio")}
        >
          View Existing Portfolio
        </button>
        <button
          className="report-button"
          onClick={() => navigate("/import-cas")}
        >
          Import CAS
        </button>
        <button
          className="report-button"
          onClick={() => navigate("/model-portfolio")}
        >
          Model Portfolio Analysis
        </button>
      </div>
    </div>
  );
};

export default PortfolioReport;
