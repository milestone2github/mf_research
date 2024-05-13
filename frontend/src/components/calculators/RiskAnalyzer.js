// In RiskAnalyzer.js
import React, { useState } from "react";
import "./RiskAnalyzer.css";

const RiskAnalyzer = () => {
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [expectedReturnRate, setExpectedReturnRate] = useState("");
  const [volatilityRate, setVolatilityRate] = useState("");

  const [riskAnalysis, setRiskAnalysis] = useState(null);

  const analyzeRisk = () => {
    if (!investmentAmount || !expectedReturnRate || !volatilityRate) {
      alert("Please fill in all fields to analyze risk.");
      return;
    }

    const amount = Number(investmentAmount);
    const expectedReturn = Number(expectedReturnRate) / 100;
    const volatility = Number(volatilityRate) / 100;

    const potentialLoss = amount * volatility;
    const riskAdjustedReturn = amount * expectedReturn - potentialLoss;

    setRiskAnalysis({
      potentialLoss,
      riskAdjustedReturn,
    });
  };

  return (
    <div className="risk-analyzer">
      <h2>Risk Analyzer</h2>
      <div>
        <label htmlFor="investmentAmount">Investment Amount:</label>
        <input
          type="number"
          placeholder="Investment Amount"
          value={investmentAmount}
          onChange={(e) => setInvestmentAmount(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="expectedReturnRate">Expected Return Rate (%):</label>
        <input
          type="number"
          placeholder="Expected Return Rate"
          value={expectedReturnRate}
          onChange={(e) => setExpectedReturnRate(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="volatilityRate">Volatility Rate (%):</label>
        <input
          type="number"
          placeholder="Volatility Rate"
          value={volatilityRate}
          onChange={(e) => setVolatilityRate(e.target.value)}
        />
      </div>

      <button onClick={analyzeRisk}>Analyze Risk</button>

      {riskAnalysis && (
        <div>
          <h3>Potential Loss: {riskAnalysis.potentialLoss.toFixed(2)}</h3>
          <h3>
            Risk-Adjusted Return: {riskAnalysis.riskAdjustedReturn.toFixed(2)}
          </h3>
        </div>
      )}
    </div>
  );
};

export default RiskAnalyzer;
