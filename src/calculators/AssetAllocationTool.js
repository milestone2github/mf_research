import React, { useState } from "react";
import { Pie } from "react-chartjs-2";
import "./AssetAllocationTool.css";
// Import the required Chart.js components
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Register the components
ChartJS.register(ArcElement, Tooltip, Legend);

const AssetAllocationAdvisorTool = () => {
  const [riskProfile, setRiskProfile] = useState("");
  const [investmentGoal, setInvestmentGoal] = useState("");
  const [timeHorizon, setTimeHorizon] = useState("");

  const [allocation, setAllocation] = useState({
    equity: null,
    debt: null,
    others: null,
  });

  const calculateAssetAllocation = () => {
    if (!riskProfile || !investmentGoal || !timeHorizon) {
      alert("Please fill in all fields to calculate asset allocation.");
      return;
    }

    let equityPercentage, debtPercentage, othersPercentage;

    // Example allocation logic based on risk profile
    switch (riskProfile) {
      case "conservative":
        equityPercentage = 20;
        debtPercentage = 70;
        othersPercentage = 10;
        break;
      case "moderate":
        equityPercentage = 50;
        debtPercentage = 40;
        othersPercentage = 10;
        break;
      case "aggressive":
        equityPercentage = 70;
        debtPercentage = 20;
        othersPercentage = 10;
        break;
      default:
        equityPercentage = 0;
        debtPercentage = 0;
        othersPercentage = 0;
    }

    setAllocation({
      equity: equityPercentage,
      debt: debtPercentage,
      others: othersPercentage,
    });
  };

  const chartData = {
    labels: ["Equity", "Debt", "Others"],
    datasets: [
      {
        data: [allocation.equity, allocation.debt, allocation.others],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
      },
    ],
  };

  // Function to provide detailed explanation based on risk profile
  const getProfileExplanation = () => {
    switch (riskProfile) {
      case "conservative":
        return "A conservative profile suggests a higher allocation in debt to minimize risk and ensure steady returns.";
      case "moderate":
        return "A moderate profile balances risk and return by diversifying across equity and debt.";
      case "aggressive":
        return "An aggressive profile aims for higher returns by taking more risk, mainly in equity.";
      default:
        return "";
    }
  };

  return (
    <div className="asset-allocation-advisor-tool">
      <h2>Asset Allocation Advisor Tool</h2>
      <div>
        <label htmlFor="riskProfile">Risk Profile:</label>
        <select
          value={riskProfile}
          onChange={(e) => setRiskProfile(e.target.value)}
        >
          <option value="">Select Risk Profile</option>
          <option value="conservative">Conservative</option>
          <option value="moderate">Moderate</option>
          <option value="aggressive">Aggressive</option>
        </select>
      </div>
      <div>
        <label htmlFor="investmentGoal">Investment Goal:</label>
        <input
          type="text"
          placeholder="Investment Goal"
          value={investmentGoal}
          onChange={(e) => setInvestmentGoal(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="timeHorizon">Time Horizon (years):</label>
        <input
          type="number"
          placeholder="Time Horizon"
          value={timeHorizon}
          onChange={(e) => setTimeHorizon(e.target.value)}
        />
      </div>

      <button onClick={calculateAssetAllocation}>Calculate</button>

      {allocation.equity !== null && (
        <div>
          <h3>Asset Allocation</h3>
          <Pie data={chartData} />
          <div className="allocation-chart-placeholder">
            Chart showing {allocation.equity}% Equity, {allocation.debt}% Debt,{" "}
            {allocation.others}% Others
          </div>
          <p>Equity: {allocation.equity}%</p>
          <p>Debt: {allocation.debt}%</p>
          <p>Others: {allocation.others}%</p>
          <p>{getProfileExplanation()}</p>
        </div>
      )}
    </div>
  );
};

export default AssetAllocationAdvisorTool;
