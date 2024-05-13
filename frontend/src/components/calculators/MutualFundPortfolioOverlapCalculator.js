// In MutualFundPortfolioOverlapCalculator.js
import React, { useState } from "react";
import "./MutualFundPortfolioOverlapCalculator.css";

const MutualFundPortfolioOverlapCalculator = () => {
  const [fund1, setFund1] = useState("");
  const [fund2, setFund2] = useState("");
  const [overlap, setOverlap] = useState(null);

  // Dummy function to calculate overlap
  // In real applications, this would involve more complex logic and possibly fetching data from an API
  const calculateOverlap = () => {
    if (!fund1 || !fund2) {
      alert("Please enter the names of both funds to calculate the overlap.");
      return;
    }

    // Simulating overlap calculation by generating a random percentage for demo purposes
    const overlapPercentage = Math.random() * 100;
    setOverlap(overlapPercentage);
  };

  return (
    <div className="mutual-fund-portfolio-overlap-calculator">
      <h2>Mutual Fund Portfolio Overlap Calculator</h2>
      <div>
        <label htmlFor="fund1">Fund 1 Name:</label>
        <input
          type="text"
          placeholder="Enter Fund 1 Name"
          value={fund1}
          onChange={(e) => setFund1(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="fund2">Fund 2 Name:</label>
        <input
          type="text"
          placeholder="Enter Fund 2 Name"
          value={fund2}
          onChange={(e) => setFund2(e.target.value)}
        />
      </div>

      <button onClick={calculateOverlap}>Calculate Overlap</button>

      {overlap !== null && (
        <div>
          <h3>Portfolio Overlap Percentage: {overlap.toFixed(2)}%</h3>
        </div>
      )}
    </div>
  );
};

export default MutualFundPortfolioOverlapCalculator;
