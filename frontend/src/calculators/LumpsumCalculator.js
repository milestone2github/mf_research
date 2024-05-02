// In LumpsumCalculator.js
import React, { useState } from "react";
import "./LumpsumCalculator.css";

const LumpsumCalculator = () => {
  const [lumpSumAmount, setLumpSumAmount] = useState("");
  const [annualReturnRate, setAnnualReturnRate] = useState("");
  const [investmentYears, setInvestmentYears] = useState("");
  const [futureValue, setFutureValue] = useState(null);

  const calculateFutureValue = () => {
    if (!lumpSumAmount || !annualReturnRate || !investmentYears) {
      alert("Please fill in all the fields.");
      return;
    }

    const P = Number(lumpSumAmount);
    const r = Number(annualReturnRate) / 100;
    const n = Number(investmentYears);

    const futureValue = P * Math.pow(1 + r, n);
    setFutureValue(futureValue);
  };

  return (
    <div className="lumpsum-calculator">
      <h2>Lump Sum Investment Calculator</h2>
      <div>
        <label htmlFor="lumpSumAmount">Lump Sum Amount:</label>
        <input
          type="number"
          id="lumpSumAmount"
          placeholder="Enter Lump Sum Amount"
          value={lumpSumAmount}
          onChange={(e) => setLumpSumAmount(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="annualReturnRate">Annual Return Rate (%):</label>
        <input
          type="number"
          id="annualReturnRate"
          placeholder="Enter Annual Return Rate"
          value={annualReturnRate}
          onChange={(e) => setAnnualReturnRate(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="investmentYears">Investment Duration (years):</label>
        <input
          type="number"
          id="investmentYears"
          placeholder="Enter Investment Duration"
          value={investmentYears}
          onChange={(e) => setInvestmentYears(e.target.value)}
        />
      </div>

      <button onClick={calculateFutureValue}>Calculate</button>

      {futureValue !== null && (
        <div>
          <h3>Future Value of Investment: {futureValue.toFixed(2)}</h3>
        </div>
      )}
    </div>
  );
};

export default LumpsumCalculator;
