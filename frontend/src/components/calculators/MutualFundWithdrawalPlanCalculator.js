// In MutualFundWithdrawalPlanCalculator.js
import React, { useState } from "react";
import "./MutualFundWithdrawalPlanCalculator.css";

const MutualFundWithdrawalPlanCalculator = () => {
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [annualWithdrawalAmount, setAnnualWithdrawalAmount] = useState("");
  const [annualReturnRate, setAnnualReturnRate] = useState("");

  const [yearsUntilDepletion, setYearsUntilDepletion] = useState(null);

  const calculateWithdrawalPlan = () => {
    if (!investmentAmount || !annualWithdrawalAmount || !annualReturnRate) {
      alert("Please fill in all the fields to calculate the withdrawal plan.");
      return;
    }

    const principal = Number(investmentAmount);
    let withdrawalAmount = Number(annualWithdrawalAmount);
    const returnRate = Number(annualReturnRate) / 100;

    let years = 0;
    let balance = principal;

    while (balance > 0) {
      balance = balance * (1 + returnRate) - withdrawalAmount;
      years++;
      if (years > 100) {
        // Break if calculation exceeds 100 years to prevent infinite loop
        break;
      }
    }

    setYearsUntilDepletion(years);
  };

  return (
    <div className="mutual-fund-withdrawal-plan-calculator">
      <h2>Mutual Fund Withdrawal Plan Calculator</h2>
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
        <label htmlFor="annualWithdrawalAmount">
          Annual Withdrawal Amount:
        </label>
        <input
          type="number"
          placeholder="Annual Withdrawal Amount"
          value={annualWithdrawalAmount}
          onChange={(e) => setAnnualWithdrawalAmount(e.target.value)}
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

      <button onClick={calculateWithdrawalPlan}>Calculate</button>

      {yearsUntilDepletion !== null && (
        <div>
          <h3>Years Until Depletion: {yearsUntilDepletion}</h3>
        </div>
      )}
    </div>
  );
};

export default MutualFundWithdrawalPlanCalculator;
