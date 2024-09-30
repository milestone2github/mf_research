import React, { useState } from "react";
import "./MutualFundComparisonTool.css";

const MutualFundComparisonTool = () => {
  // Start with two funds by default
  const [funds, setFunds] = useState([
    { id: 1, name: "", returnRate: "", expenseRatio: "", riskLevel: "" },
    { id: 2, name: "", returnRate: "", expenseRatio: "", riskLevel: "" },
  ]);

  // State to handle result visibility
  const [showResults, setShowResults] = useState(false);

  // Add a new empty fund
  const addFund = () => {
    const newFund = {
      id: funds.length + 1,
      name: "",
      returnRate: "",
      expenseRatio: "",
      riskLevel: "",
    };
    setFunds([...funds, newFund]);
  };

  // Update the fields for a specific fund
  const updateFund = (id, field, value) => {
    const updatedFunds = funds.map((fund) => {
      if (fund.id === id) {
        return { ...fund, [field]: value };
      }
      return fund;
    });
    setFunds(updatedFunds);
  };

  // Render inputs for each fund
  const renderFundInputs = (fund) => (
    <div key={fund.id} className="fund-input">
      <input
        type="text"
        placeholder="Fund Name"
        value={fund.name}
        onChange={(e) => updateFund(fund.id, "name", e.target.value)}
      />
      <input
        type="number"
        placeholder="Return Rate (%)"
        value={fund.returnRate}
        onChange={(e) => updateFund(fund.id, "returnRate", e.target.value)}
      />
      <input
        type="number"
        placeholder="Expense Ratio (%)"
        value={fund.expenseRatio}
        onChange={(e) => updateFund(fund.id, "expenseRatio", e.target.value)}
      />
      <input
        type="text"
        placeholder="Risk Level (e.g. Low, Medium, High)"
        value={fund.riskLevel}
        onChange={(e) => updateFund(fund.id, "riskLevel", e.target.value)}
      />
    </div>
  );

  // Function to compare funds based on return rate, expense ratio, and risk level
  const compareFunds = () => {
    if (funds.length < 2) {
      alert("Please add at least two funds to compare.");
      return null;
    }

    const bestReturnFund = funds.reduce((prev, current) =>
      parseFloat(prev.returnRate) > parseFloat(current.returnRate) ? prev : current
    );

    const lowestExpenseFund = funds.reduce((prev, current) =>
      parseFloat(prev.expenseRatio) < parseFloat(current.expenseRatio) ? prev : current
    );

    const safestFund = funds.reduce((prev, current) =>
      prev.riskLevel.toLowerCase() === "low" ||
      (current.riskLevel.toLowerCase() === "low" && prev.riskLevel.toLowerCase() !== "low")
        ? prev
        : current
    );

    return {
      bestReturnFund,
      lowestExpenseFund,
      safestFund,
    };
  };

  const comparisonResults = showResults ? compareFunds() : null;

  return (
    <div className="mutual-fund-comparison-tool">
      <h2>Mutual Fund Comparison Tool</h2>

      {/* Render input fields for all funds */}
      {funds.map(renderFundInputs)}

      <button onClick={addFund}>Add Fund</button>

      {/* Button to show results */}
      <button className="show-results-btn" onClick={() => setShowResults(true)}>
        Show Results
      </button>

      {/* Display comparison results only when the "Show Results" button is clicked */}
      {comparisonResults && (
        <div className="comparison-results">
          <h3>Comparison Results</h3>
          <p>
            <strong>Best Return:</strong> {comparisonResults.bestReturnFund.name} with{" "}
            {comparisonResults.bestReturnFund.returnRate}% return
          </p>
          <p>
            <strong>Lowest Expense Ratio:</strong>{" "}
            {comparisonResults.lowestExpenseFund.name} with{" "}
            {comparisonResults.lowestExpenseFund.expenseRatio}%
          </p>
          <p>
            <strong>Safest Fund (Lowest Risk):</strong> {comparisonResults.safestFund.name}{" "}
            (Risk Level: {comparisonResults.safestFund.riskLevel})
          </p>
        </div>
      )}
    </div>
  );
};

export default MutualFundComparisonTool;
