import React from "react";
import { Link } from "react-router-dom";
import BackButton from "./BackButton";

const Header = ({ title }) => {
  return (
    <div className="header relative">
      <span className="absolute left-0 top-1/2 -translate-y-1/2">
        <BackButton action={() => {window.history.back()}}/>
      </span>
      <h1 className="page-title">{title}</h1>
    </div>
  );
};

export default Header;
