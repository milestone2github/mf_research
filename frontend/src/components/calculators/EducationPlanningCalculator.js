import React, { useState } from "react";
import "./EducationPlanningCalculator.css";

const EducationFundingCalculator = () => {
  const [currentCost, setCurrentCost] = useState("");
  const [educationInflation, setEducationInflation] = useState("");
  const [yearsUntilEducation, setYearsUntilEducation] = useState("");
  const [investmentReturnRate, setInvestmentReturnRate] = useState("");

  const [results, setResults] = useState({
    futureEducationCost: null,
    totalInvestmentRequired: null,
  });

  const calculateEducationFunding = () => {
    if (
      !currentCost ||
      !educationInflation ||
      !yearsUntilEducation ||
      !investmentReturnRate
    ) {
      alert("Please fill in all fields to calculate.");
      return;
    }

    const futureEducationCost =
      Number(currentCost) *
      Math.pow(
        1 + Number(educationInflation) / 100,
        Number(yearsUntilEducation)
      );
    const totalInvestmentRequired =
      futureEducationCost /
      Math.pow(
        1 + Number(investmentReturnRate) / 100,
        Number(yearsUntilEducation)
      );

    setResults({
      futureEducationCost,
      totalInvestmentRequired,
    });
  };

  return (
    <div className="education-funding-calculator">
      <h2>Education Funding Calculator</h2>
      <div>
        <label htmlFor="currentCost">Current Cost of Education:</label>
        <input
          type="number"
          placeholder="Current Cost"
          value={currentCost}
          onChange={(e) => setCurrentCost(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="educationInflation">Annual Inflation Rate (%):</label>
        <input
          type="number"
          placeholder="Inflation Rate"
          value={educationInflation}
          onChange={(e) => setEducationInflation(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="yearsUntilEducation">Years Until Education:</label>
        <input
          type="number"
          placeholder="Years Until Education"
          value={yearsUntilEducation}
          onChange={(e) => setYearsUntilEducation(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="investmentReturnRate">
          Investment Return Rate (%):
        </label>
        <input
          type="number"
          placeholder="Return Rate"
          value={investmentReturnRate}
          onChange={(e) => setInvestmentReturnRate(e.target.value)}
        />
      </div>

      <button onClick={calculateEducationFunding}>Calculate</button>

      {results.futureEducationCost !== null && (
        <div>
          <h3>
            Future Education Cost: {results.futureEducationCost.toFixed(2)}
          </h3>
          <h3>
            Total Investment Required:{" "}
            {results.totalInvestmentRequired.toFixed(2)}
          </h3>
        </div>
      )}
    </div>
  );
};

export default EducationFundingCalculator;
