// In GoalBasedInvestmentCalculator.js
import React, { useState } from "react";
import "./GoalBasedInvestmentCalculator.css";

const GoalBasedInvestmentCalculator = () => {
  const [goalAmount, setGoalAmount] = useState("");
  const [currentSavings, setCurrentSavings] = useState("");
  const [annualInvestmentReturn, setAnnualInvestmentReturn] = useState("");
  const [timeFrame, setTimeFrame] = useState("");

  const [monthlyInvestment, setMonthlyInvestment] = useState(null);

  const calculateMonthlyInvestment = () => {
    if (
      !goalAmount ||
      !currentSavings ||
      !annualInvestmentReturn ||
      !timeFrame
    ) {
      alert("Please fill in all the fields.");
      return;
    }

    const r = Number(annualInvestmentReturn) / 100 / 12; // monthly interest rate
    const n = Number(timeFrame) * 12; // total number of months
    const P = Number(goalAmount);
    const S = Number(currentSavings);

    // Future value of current savings
    const futureValueOfSavings = S * Math.pow(1 + r, n);

    // If future value of current savings is greater than goal, no monthly investment is needed
    if (futureValueOfSavings >= P) {
      setMonthlyInvestment(0);
      return;
    }

    // Calculate the monthly investment needed
    const monthlyInvestment =
      ((P - futureValueOfSavings) * r) / (Math.pow(1 + r, n) - 1);

    setMonthlyInvestment(monthlyInvestment);
  };

  return (
    <div className="goal-based-investment-calculator">
      <h2>Goal-Based Investment Calculator</h2>
      <div>
        <label htmlFor="goalAmount">Goal Amount:</label>
        <input
          type="number"
          placeholder="Goal Amount"
          value={goalAmount}
          onChange={(e) => setGoalAmount(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="currentSavings">Current Savings:</label>
        <input
          type="number"
          placeholder="Current Savings"
          value={currentSavings}
          onChange={(e) => setCurrentSavings(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="annualInvestmentReturn">
          Annual Investment Return (%):
        </label>
        <input
          type="number"
          placeholder="Annual Return Rate"
          value={annualInvestmentReturn}
          onChange={(e) => setAnnualInvestmentReturn(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="timeFrame">Time Frame (years):</label>
        <input
          type="number"
          placeholder="Time Frame"
          value={timeFrame}
          onChange={(e) => setTimeFrame(e.target.value)}
        />
      </div>

      <button onClick={calculateMonthlyInvestment}>Calculate</button>

      {monthlyInvestment !== null && (
        <div>
          <h3>Monthly Investment Needed: {monthlyInvestment.toFixed(2)}</h3>
        </div>
      )}
    </div>
  );
};

export default GoalBasedInvestmentCalculator;
