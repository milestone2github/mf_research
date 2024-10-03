// In MutualFundPortfolioOverlapCalculator.js
import React, { useState } from "react";
import BackButton from "../common/BackButton";
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
    <div className="px-3">
      <div className="relative flex">
        <span className="absolute left-0 top-1/2 -translate-y-1/2">
          <BackButton />
        </span>

        <div className="flex flex-col w-fit mx-auto">
          <h2 className="text-2xl text-dark-blue md:text-3xl font-bold mx-auto my-1">
            Mutual Fund Portfolio Overlap Calculator
          </h2>
          <span className="w-full bg-yellow-600 h-2 text-start"></span>
        </div>
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-7 mt-6">
        {/* Fund 1 Input */}
        <div className="border grow shrink basis-72 md:basis-[40%] w-full md:w-1/2 rounded-lg bg-slate-100 p-4 px-6">
          <label htmlFor="fund1" className="text-gray-600">
            Fund 1 Name
          </label>
          <div className="mt-1 bg-primary-white border-2 border-gray-300 rounded-lg relative focus-within:border-2 focus-within:border-blue-500">
            <input
              className="px-3 py-2 text-gray-600 font-bold w-full bg-transparent outline-none focus:outline-none"
              type="text"
              placeholder="Enter Fund 1 Name"
              value={fund1}
              onChange={(e) => setFund1(e.target.value)}
            />
          </div>
        </div>

        {/* Fund 2 Input */}
        <div className="border grow shrink basis-72 md:basis-[40%] w-full md:w-1/2 rounded-lg bg-slate-100 p-4 px-6">
          <label htmlFor="fund2" className="text-gray-600">
            Fund 2 Name
          </label>
          <div className="mt-1 bg-primary-white border-2 border-gray-300 rounded-lg relative focus-within:border-2 focus-within:border-blue-500">
            <input
              className="px-3 py-2 text-gray-600 font-bold w-full bg-transparent outline-none focus:outline-none"
              type="text"
              placeholder="Enter Fund 2 Name"
              value={fund2}
              onChange={(e) => setFund2(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Calculate Button */}
      <div className="flex justify-start my-2 mt-6">
        <button
          onClick={calculateOverlap}
          className="bg-yellow-600 rounded-md px-16 py-3 text-slate-100 hover:bg-[#b57b00]"
        >
          Calculate Overlap
        </button>
      </div>

      {/* Overlap Result */}
      {overlap !== null && (
        <ul className="info grid grid-cols-3 justify-center gap-2 mt-5">
          <li>
            <p>Portfolio Overlap Percentage</p>
            <span className="values">{overlap.toFixed(2)}%</span>
          </li>
        </ul>
      )}
    </div>
  );
};

export default MutualFundPortfolioOverlapCalculator;