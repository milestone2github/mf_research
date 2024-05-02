// In MutualFundToETFComparisonCalculator.js
import React, { useState } from "react";
import "./MutualFundToETFComparisonCalculator.css";

const MutualFundToETFComparisonCalculator = () => {
  const [mutualFundReturn, setMutualFundReturn] = useState("");
  const [mutualFundExpenseRatio, setMutualFundExpenseRatio] = useState("");
  const [etfReturn, setEtfReturn] = useState("");
  const [etfExpenseRatio, setEtfExpenseRatio] = useState("");

  const [comparisonResult, setComparisonResult] = useState(null);

  const compareInvestments = () => {
    if (
      !mutualFundReturn ||
      !mutualFundExpenseRatio ||
      !etfReturn ||
      !etfExpenseRatio
    ) {
      alert("Please fill in all fields to perform the comparison.");
      return;
    }

    const mfReturnNum = parseFloat(mutualFundReturn);
    const mfExpenseRatioNum = parseFloat(mutualFundExpenseRatio);
    const etfReturnNum = parseFloat(etfReturn);
    const etfExpenseRatioNum = parseFloat(etfExpenseRatio);

    const mfNetReturn = mfReturnNum - mfExpenseRatioNum;
    const etfNetReturn = etfReturnNum - etfExpenseRatioNum;

    setComparisonResult({
      mutualFundNetReturn: mfNetReturn,
      etfNetReturn: etfNetReturn,
    });
  };

  return (
    <div className="mutual-fund-to-etf-comparison-calculator">
      <h2>Mutual Fund to ETF Comparison Calculator</h2>
      <div>
        <label htmlFor="mutualFundReturn">Mutual Fund Return (%):</label>
        <input
          type="number"
          placeholder="Mutual Fund Return"
          value={mutualFundReturn}
          onChange={(e) => setMutualFundReturn(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="mutualFundExpenseRatio">
          Mutual Fund Expense Ratio (%):
        </label>
        <input
          type="number"
          placeholder="Mutual Fund Expense Ratio"
          value={mutualFundExpenseRatio}
          onChange={(e) => setMutualFundExpenseRatio(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="etfReturn">ETF Return (%):</label>
        <input
          type="number"
          placeholder="ETF Return"
          value={etfReturn}
          onChange={(e) => setEtfReturn(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="etfExpenseRatio">ETF Expense Ratio (%):</label>
        <input
          type="number"
          placeholder="ETF Expense Ratio"
          value={etfExpenseRatio}
          onChange={(e) => setEtfExpenseRatio(e.target.value)}
        />
      </div>

      <button onClick={compareInvestments}>Compare</button>

      {comparisonResult && (
        <div>
          <h3>Comparison Result</h3>
          <p>
            Mutual Fund Net Return:{" "}
            {comparisonResult.mutualFundNetReturn.toFixed(2)}%
          </p>
          <p>ETF Net Return: {comparisonResult.etfNetReturn.toFixed(2)}%</p>
        </div>
      )}
    </div>
  );
};

export default MutualFundToETFComparisonCalculator;
