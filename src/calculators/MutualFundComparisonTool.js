// In MutualFundComparisonTool.js
import React, { useState } from "react";
import "./MutualFundComparisonTool.css";

const MutualFundComparisonTool = () => {
  const [funds, setFunds] = useState([
    { id: 1, name: "", returnRate: "", expenseRatio: "", riskLevel: "" },
  ]);

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

  const updateFund = (id, field, value) => {
    const updatedFunds = funds.map((fund) => {
      if (fund.id === id) {
        return { ...fund, [field]: value };
      }
      return fund;
    });
    setFunds(updatedFunds);
  };

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
        placeholder="Risk Level"
        value={fund.riskLevel}
        onChange={(e) => updateFund(fund.id, "riskLevel", e.target.value)}
      />
    </div>
  );

  return (
    <div className="mutual-fund-comparison-tool">
      <h2>Mutual Fund Comparison Tool</h2>
      {funds.map(renderFundInputs)}
      <button onClick={addFund}>Add Fund</button>
    </div>
  );
};

export default MutualFundComparisonTool;
