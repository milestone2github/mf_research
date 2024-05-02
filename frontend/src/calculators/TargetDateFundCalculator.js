// In TargetDateFundCalculator.js
import React, { useState } from "react";
import "./TargetDateFundCalculator.css";

const TargetDateFundCalculator = () => {
  const [initialInvestment, setInitialInvestment] = useState("");
  const [monthlyContribution, setMonthlyContribution] = useState("");
  const [annualReturnRate, setAnnualReturnRate] = useState("");
  const [yearsToTarget, setYearsToTarget] = useState("");

  const [accumulatedAmount, setAccumulatedAmount] = useState(null);

  const calculateAccumulatedAmount = () => {
    if (
      !initialInvestment ||
      !monthlyContribution ||
      !annualReturnRate ||
      !yearsToTarget
    ) {
      alert("Please fill in all fields to calculate the accumulated amount.");
      return;
    }

    const principal = parseFloat(initialInvestment);
    const monthlyInvest = parseFloat(monthlyContribution);
    const annualReturn = parseFloat(annualReturnRate) / 100;
    const years = parseFloat(yearsToTarget);

    const months = years * 12;
    const monthlyReturnRate = annualReturn / 12;

    let futureValue = principal * Math.pow(1 + monthlyReturnRate, months);
    for (let i = 1; i <= months; i++) {
      futureValue +=
        monthlyInvest * Math.pow(1 + monthlyReturnRate, months - i);
    }

    setAccumulatedAmount(futureValue);
  };

  return (
    <div className="target-date-fund-calculator">
      <h2>Target Date Fund Calculator</h2>
      <div>
        <label htmlFor="initialInvestment">Initial Investment:</label>
        <input
          type="number"
          placeholder="Initial Investment Amount"
          value={initialInvestment}
          onChange={(e) => setInitialInvestment(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="monthlyContribution">Monthly Contribution:</label>
        <input
          type="number"
          placeholder="Monthly Contribution Amount"
          value={monthlyContribution}
          onChange={(e) => setMonthlyContribution(e.target.value)}
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
        <label htmlFor="yearsToTarget">Years to Target Date:</label>
        <input
          type="number"
          placeholder="Years to Target"
          value={yearsToTarget}
          onChange={(e) => setYearsToTarget(e.target.value)}
        />
      </div>

      <button onClick={calculateAccumulatedAmount}>Calculate</button>

      {accumulatedAmount !== null && (
        <div>
          <h3>
            Accumulated Amount by Target Date: {accumulatedAmount.toFixed(2)}
          </h3>
        </div>
      )}
    </div>
  );
};

export default TargetDateFundCalculator;
