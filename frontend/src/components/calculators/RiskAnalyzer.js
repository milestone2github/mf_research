import React, { useState } from "react";
import BackButton from "../common/BackButton";
import "./RiskAnalyzer.css";

// Function to format currency in INR
const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
};

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
    <div className="risk-analyzer px-5 py-6">
      {/* Back Button */}
      <div className="relative flex">
        <span className="absolute left-0 top-1/2 -translate-y-1/2">
          <BackButton />
        </span>
        <div className="flex flex-col w-fit mx-auto">
          <h2 className="text-2xl text-dark-blue md:text-3xl font-bold mx-auto my-1">
            Risk Analyzer
          </h2>
          <span className="w-full bg-yellow-600 h-2 text-start"></span>
        </div>
      </div>

      {/* Input Fields */}
      <div className="flex flex-wrap items-baseline justify-between gap-7 mt-6">
        {/* Investment Amount */}
        <div className="border grow shrink basis-72 md:basis-[40%] w-full rounded-lg bg-slate-100 p-4 px-6">
          <label htmlFor="investmentAmount" className="text-gray-600">Investment Amount</label>
          <div className="mt-1 bg-primary-white border-2 border-gray-300 rounded-lg relative focus-within:border-2 focus-within:border-blue-500">
            <span className="text-gray-400 text-sm absolute left-3 top-1/2 -translate-y-1/2">₹</span>
            <input
              className="px-3 py-2 text-gray-600 font-bold w-full bg-transparent ps-6 outline-none focus:outline-none"
              type="number"
              id="investmentAmount"
              placeholder="0"
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(e.target.value)}
            />
          </div>
        </div>

        {/* Expected Return Rate */}
        <div className="border grow shrink basis-72 md:basis-[40%] w-full rounded-lg bg-slate-100 p-4 px-6">
          <label htmlFor="expectedReturnRate" className="text-gray-600">Expected Return Rate (%)</label>
          <div className="mt-1 bg-primary-white border-2 border-gray-300 rounded-lg relative focus-within:border-2 focus-within:border-blue-500">
            <input
              className="px-3 py-2 w-full text-gray-600 font-bold bg-transparent pe-4 outline-none focus:outline-none"
              type="number"
              id="expectedReturnRate"
              placeholder="0"
              value={expectedReturnRate}
              onChange={(e) => setExpectedReturnRate(e.target.value)}
            />
            <span className="text-gray-400 font-bold bg-slate-100 text-center h-full w-12 border-s-2 border-s-gray-300 flex items-center justify-center text-sm rounded-e-md absolute right-0 top-1/2 -translate-y-1/2">
              %
            </span>
          </div>
        </div>

        {/* Volatility Rate */}
        <div className="border grow shrink basis-72 md:basis-[40%] w-full rounded-lg bg-slate-100 p-4 px-6">
          <label htmlFor="volatilityRate" className="text-gray-600">Volatility Rate (%)</label>
          <div className="mt-1 bg-primary-white border-2 border-gray-300 rounded-lg relative focus-within:border-2 focus-within:border-blue-500">
            <input
              className="px-3 py-2 w-full text-gray-600 font-bold bg-transparent pe-4 outline-none focus:outline-none"
              type="number"
              id="volatilityRate"
              placeholder="0"
              value={volatilityRate}
              onChange={(e) => setVolatilityRate(e.target.value)}
            />
            <span className="text-gray-400 font-bold bg-slate-100 text-center h-full w-12 border-s-2 border-s-gray-300 flex items-center justify-center text-sm rounded-e-md absolute right-0 top-1/2 -translate-y-1/2">
              %
            </span>
          </div>
        </div>
      </div>

      {/* Calculate Button */}
      <div className="flex justify-start my-2 mt-6">
        <button
          onClick={analyzeRisk}
          className="bg-yellow-600 rounded-md px-16 py-3 text-slate-100 hover:bg-[#b57b00]"
        >
          Analyze Risk
        </button>
      </div>

      {/* Results Section */}
      {riskAnalysis && (
        <div className="mt-5 bg-gray-100 p-4 rounded-md">
          <h3 className="text-lg font-bold">Results</h3>
          <p className="text-blue-600">
            <strong>Potential Loss: </strong>{formatCurrency(riskAnalysis.potentialLoss)}
          </p>
          <p className="text-blue-600">
            <strong>Risk-Adjusted Return: </strong>{formatCurrency(riskAnalysis.riskAdjustedReturn)}
          </p>
        </div>
      )}
    </div>
  );
};

export default RiskAnalyzer;