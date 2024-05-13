import React, { useState } from "react";
import Header from "../common/PortfolioResearchHeader";

const ModelPortfolio = () => {
  const [portfolioName, setPortfolioName] = useState("");
  const [description, setDescription] = useState("");
  const [schemes, setSchemes] = useState([
    { scheme: "", amount: "", mode: "Lumpsum" },
  ]);

  const addScheme = () => {
    setSchemes([...schemes, { scheme: "", amount: "", mode: "Lumpsum" }]);
  };

  const updateScheme = (index, key, value) => {
    const updatedSchemes = schemes.map((item, i) =>
      i === index ? { ...item, [key]: value } : item
    );
    setSchemes(updatedSchemes);
  };

  const removeScheme = (index) => {
    setSchemes(schemes.filter((_, i) => i !== index));
  };

  return (
    <div className="portfolio-wrapper">
      <Header title="Portfolio Analysis - Model Portfolio" />
      <div className="portfolio-container">
        <div className="portfolio-content">
          <h2 className="section-heading">Model Portfolio Configuration</h2>
          <div className="section">
            <div className="input-group">
              <label htmlFor="modelPortfolioName">Model Portfolio Name:</label>
              <input
                type="text"
                id="modelPortfolioName"
                value={portfolioName}
                onChange={(e) => setPortfolioName(e.target.value)}
                className="input-field smaller-input"
              />
            </div>
            <div className="input-group">
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field shorter-textarea"
              />
            </div>
          </div>
          <div className="section schemes-section">
            <label>Schemes:</label>
            {schemes.map((scheme, index) => (
              <div className="scheme-row" key={index}>
                <input
                  type="text"
                  value={scheme.scheme}
                  onChange={(e) =>
                    updateScheme(index, "scheme", e.target.value)
                  }
                  placeholder="Mutual Fund Scheme Name"
                  className="input-field wider-input"
                />
                <input
                  type="text"
                  value={scheme.amount}
                  onChange={(e) =>
                    updateScheme(index, "amount", e.target.value)
                  }
                  placeholder="Amount"
                  className="input-field"
                />
                <select
                  value={scheme.mode}
                  onChange={(e) => updateScheme(index, "mode", e.target.value)}
                  className="input-field"
                >
                  <option value="Lumpsum">Lumpsum</option>
                  <option value="SIP">SIP</option>
                  <option value="SWP">SWP</option>
                </select>
                {schemes.length > 1 && (
                  <span
                    className="remove-scheme"
                    onClick={() => removeScheme(index)}
                  >
                    Remove
                  </span>
                )}
              </div>
            ))}
            <button className="add-scheme" onClick={addScheme}>
              Add Scheme
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelPortfolio;
