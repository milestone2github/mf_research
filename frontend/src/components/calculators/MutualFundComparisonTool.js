import React, { useState } from "react";
import BackButton from "../common/BackButton";
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
    <div key={fund.id} className="fund-input border rounded-lg bg-slate-100 p-4 px-6 mb-4 w-full md:w-3/4 lg:w-1/2 mx-auto">
      {/* Fund Name */}
      <div className="mb-3">
        <label className="text-gray-600">Fund Name</label>
        <input
          type="text"
          className="border-2 p-2 rounded-md w-full"
          placeholder="Fund Name"
          value={fund.name}
          onChange={(e) => updateFund(fund.id, "name", e.target.value)}
        />
      </div>

      {/* Return Rate (%) */}
      <div className="mb-3">
        <label className="text-gray-600">Return Rate (%)</label>
        <div className="mt-1 bg-primary-white border-2 border-gray-300 rounded-lg relative focus-within:border-2 focus-within:border-blue-500">
          <input
            className="ps-3 py-2 w-full text-gray-600 font-bold bg-transparent pe-4 outline-none focus:outline-none"
            type="text"
            placeholder="0"
            pattern="[0-9]*"
            min={0}
            maxLength={3}
            value={fund.returnRate}
            onChange={(e) => updateFund(fund.id, "returnRate", e.target.value)}
          />
          <span className="text-gray-400 font-bold bg-slate-100 text-center h-full w-12 border-s-2 border-s-gray-300 flex items-center justify-center text-sm rounded-e-md absolute right-0 top-1/2 -translate-y-1/2">
            %
          </span>
        </div>
      </div>

      {/* Expense Ratio (%) */}
      <div className="mb-3">
        <label className="text-gray-600">Expense Ratio (%)</label>
        <div className="mt-1 bg-primary-white border-2 border-gray-300 rounded-lg relative focus-within:border-2 focus-within:border-blue-500">
          <input
            className="ps-3 py-2 w-full text-gray-600 font-bold bg-transparent pe-4 outline-none focus:outline-none"
            type="text"
            placeholder="0"
            pattern="[0-9]*"
            min={0}
            maxLength={3}
            value={fund.expenseRatio}
            onChange={(e) => updateFund(fund.id, "expenseRatio", e.target.value)}
          />
          <span className="text-gray-400 font-bold bg-slate-100 text-center h-full w-12 border-s-2 border-s-gray-300 flex items-center justify-center text-sm rounded-e-md absolute right-0 top-1/2 -translate-y-1/2">
            %
          </span>
        </div>
      </div>

      {/* Risk Level */}
      <div className="mb-3">
        <label className="text-gray-600">Risk Level</label>
        <input
          type="text"
          className="border-2 p-2 rounded-md w-full"
          placeholder="Risk Level (Low, Medium, High)"
          value={fund.riskLevel}
          onChange={(e) => updateFund(fund.id, "riskLevel", e.target.value)}
        />
      </div>
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
    <div className="mutual-fund-comparison-tool px-5 py-6">
      {/* Back Button */}
      <div className="relative flex">
        <span className="absolute left-0 top-1/2 -translate-y-1/2">
          <BackButton />
        </span>
        <div className="flex flex-col w-fit mx-auto">
          <h2 className="text-2xl text-dark-blue md:text-3xl font-bold mx-auto my-1">
            Mutual Fund Comparison Tool
          </h2>
          <span className="w-full bg-yellow-600 h-2 text-start"></span>
        </div>
      </div>
      <br />
      
      {/* Render input fields for all funds */}
      {funds.map(renderFundInputs)}

      <div className="flex gap-4 my-4 w-full md:w-3/4 lg:w-1/2 mx-auto">
        <button className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-500 w-full" onClick={addFund}>
          Add Fund
        </button>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-500 w-full"
          onClick={() => setShowResults(true)}
        >
          Show Results
        </button>
      </div>

      {/* Display comparison results only when the "Show Results" button is clicked */}
      {comparisonResults && (
        <div className="comparison-results mt-5 bg-gray-100 p-4 rounded-md w-full md:w-3/4 lg:w-1/2 mx-auto">
          <h3 className="text-lg font-bold">Comparison Results</h3>
          <p className="text-blue-600">
            <strong>Best Return:</strong> {comparisonResults.bestReturnFund.name} with{" "}
            {comparisonResults.bestReturnFund.returnRate}% return
          </p>
          <p className="text-blue-600">
            <strong>Lowest Expense Ratio:</strong> {comparisonResults.lowestExpenseFund.name} with{" "}
            {comparisonResults.lowestExpenseFund.expenseRatio}% expense ratio
          </p>
          <p className="text-blue-600">
            <strong>Safest Fund (Lowest Risk):</strong> {comparisonResults.safestFund.name} (Risk Level:{" "}
            {comparisonResults.safestFund.riskLevel})
          </p>
        </div>
      )}
    </div>
  );
};

export default MutualFundComparisonTool;