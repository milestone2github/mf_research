import React, { useState } from "react";
import BackButton from "../common/BackButton";
import "./EducationPlanningCalculator.css";

// Function to format currency in INR
const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
};

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
      Math.pow(1 + Number(educationInflation) / 100, Number(yearsUntilEducation));
    const totalInvestmentRequired =
      futureEducationCost /
      Math.pow(1 + Number(investmentReturnRate) / 100, Number(yearsUntilEducation));

    setResults({
      futureEducationCost,
      totalInvestmentRequired,
    });
  };

  return (
    <div className="education-funding-calculator px-5 py-6">
      {/* Back Button */}
      <div className="relative flex">
        <span className="absolute left-0 top-1/2 -translate-y-1/2">
          <BackButton />
        </span>
        <div className="flex flex-col w-fit mx-auto">
          <h2 className="text-2xl text-dark-blue md:text-3xl font-bold mx-auto my-1">
            Education Funding Calculator
          </h2>
          <span className="w-full bg-yellow-600 h-2 text-start"></span>
        </div>
      </div>

      {/* Input Fields */}
      <div className="flex flex-wrap items-baseline justify-between gap-7 mt-6">
        {/* Current Cost of Education */}
        <div className="border grow shrink basis-72 md:basis-[40%] w-full rounded-lg bg-slate-100 p-4 px-6">
          <label htmlFor="currentCost" className="text-gray-600">Current Cost of Education</label>
          <div className="mt-1 bg-primary-white border-2 border-gray-300 rounded-lg relative focus-within:border-2 focus-within:border-blue-500">
            <span className="text-gray-400 text-sm absolute left-3 top-1/2 -translate-y-1/2">₹</span>
            <input
              className="px-3 py-2 text-gray-600 font-bold w-full bg-transparent ps-6 outline-none focus:outline-none"
              type="number"
              id="currentCost"
              placeholder="0"
              value={currentCost}
              onChange={(e) => setCurrentCost(e.target.value)}
            />
          </div>
        </div>

        {/* Education Inflation Rate */}
        <div className="border grow shrink basis-72 md:basis-[40%] w-full rounded-lg bg-slate-100 p-4 px-6">
          <label htmlFor="educationInflation" className="text-gray-600">Annual Inflation Rate (%)</label>
          <div className="mt-1 bg-primary-white border-2 border-gray-300 rounded-lg relative focus-within:border-2 focus-within:border-blue-500">
            <input
              className="px-3 py-2 w-full text-gray-600 font-bold bg-transparent pe-4 outline-none focus:outline-none"
              type="number"
              id="educationInflation"
              placeholder="0"
              value={educationInflation}
              onChange={(e) => setEducationInflation(e.target.value)}
            />
            <span className="text-gray-400 font-bold bg-slate-100 text-center h-full w-12 border-s-2 border-s-gray-300 flex items-center justify-center text-sm rounded-e-md absolute right-0 top-1/2 -translate-y-1/2">
              %
            </span>
          </div>
        </div>

        {/* Years Until Education */}
        <div className="border grow shrink basis-72 md:basis-[40%] w-full rounded-lg bg-slate-100 p-4 px-6">
          <label htmlFor="yearsUntilEducation" className="text-gray-600">Years Until Education</label>
          <div className="mt-1 bg-primary-white border-2 border-gray-300 rounded-lg relative focus-within:border-2 focus-within:border-blue-500">
            <input
              className="px-3 py-2 w-full text-gray-600 font-bold bg-transparent pe-4 outline-none focus:outline-none"
              type="number"
              id="yearsUntilEducation"
              placeholder="0"
              value={yearsUntilEducation}
              onChange={(e) => setYearsUntilEducation(e.target.value)}
            />
          </div>
        </div>

        {/* Investment Return Rate */}
        <div className="border grow shrink basis-72 md:basis-[40%] w-full rounded-lg bg-slate-100 p-4 px-6">
          <label htmlFor="investmentReturnRate" className="text-gray-600">Investment Return Rate (%)</label>
          <div className="mt-1 bg-primary-white border-2 border-gray-300 rounded-lg relative focus-within:border-2 focus-within:border-blue-500">
            <input
              className="px-3 py-2 w-full text-gray-600 font-bold bg-transparent pe-4 outline-none focus:outline-none"
              type="number"
              id="investmentReturnRate"
              placeholder="0"
              value={investmentReturnRate}
              onChange={(e) => setInvestmentReturnRate(e.target.value)}
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
          onClick={calculateEducationFunding}
          className="bg-yellow-600 rounded-md px-16 py-3 text-slate-100 hover:bg-[#b57b00]"
        >
          Calculate
        </button>
      </div>

      {/* Results Section */}
      {results.futureEducationCost !== null && (
        <div className="mt-5 bg-gray-100 p-4 rounded-md">
          <h3 className="text-lg font-bold">Results</h3>
          <p className="text-blue-600">
            Future Education Cost:{" "}
            <span className="font-bold">
              {formatCurrency(results.futureEducationCost)}
            </span>
          </p>
          <p className="text-blue-600">
            Total Investment Required:{" "}
            <span className="font-bold">
              {formatCurrency(results.totalInvestmentRequired)}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default EducationFundingCalculator;