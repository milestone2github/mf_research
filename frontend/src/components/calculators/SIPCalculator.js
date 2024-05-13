// In SIPCalculator.js
import React, { useState } from "react";
import "./SIPCalculator.css";

const SIPCalculator = () => {
  const [monthlyInvestment, setMonthlyInvestment] = useState("");
  const [annualReturnRate, setAnnualReturnRate] = useState("");
  const [investmentPeriod, setInvestmentPeriod] = useState("");

  const [futureValue, setFutureValue] = useState(null);

  const calculateFutureValue = () => {
    if (!monthlyInvestment || !annualReturnRate || !investmentPeriod) {
      alert("Please fill in all the fields to calculate the future value.");
      return;
    }

    const P = parseFloat(monthlyInvestment);
    const r = parseFloat(annualReturnRate) / 100 / 12; // Monthly rate of return
    const n = parseFloat(investmentPeriod) * 12; // Total number of months

    // Future Value of a series formula: FV = P × ((1 + r)^n - 1) / r
    const futureValue = P * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);

    setFutureValue(futureValue);
  };

  return (
    <div className="sip-calculator">
      <h2>SIP Calculator</h2>
      <div>
        <label htmlFor="monthlyInvestment">Monthly Investment:</label>
        <input
          type="number"
          placeholder="Monthly Investment Amount"
          value={monthlyInvestment}
          onChange={(e) => setMonthlyInvestment(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="annualReturnRate">Annual Return Rate (%):</label>
        <input
          type="number"
          placeholder="Annual Return Rate"
          value={annualReturnRate}
          onChange={(e) => setAnnualReturnRate(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="investmentPeriod">Investment Period (Years):</label>
        <input
          type="number"
          placeholder="Investment Period in Years"
          value={investmentPeriod}
          onChange={(e) => setInvestmentPeriod(e.target.value)}
        />
      </div>

      <button onClick={calculateFutureValue}>Calculate</button>

      {futureValue !== null && (
        <div>
          <h3>Future Value of SIP: {futureValue.toFixed(2)}</h3>
        </div>
      )}
    </div>
  );
};

export default SIPCalculator;
