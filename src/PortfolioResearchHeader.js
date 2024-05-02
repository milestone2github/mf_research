import React from "react";
import { Link } from "react-router-dom";

const Header = ({ title }) => {
  return (
    <div className="header">
      <Link to="/portfolio-analysis" className="back-button">
        Back to Portfolio Analysis
      </Link>
      <h1 className="page-title">{title}</h1>
    </div>
  );
};

export default Header;
