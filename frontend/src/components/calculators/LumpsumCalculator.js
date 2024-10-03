import React, { useState } from "react";
import BackButton from "../common/BackButton";
import "./LumpsumCalculator.css";

// Function to format currency in INR
const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
};

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
    <div className="lumpsum-calculator px-5 py-6">
      {/* Back Button */}
      <div className="relative flex">
        <span className="absolute left-0 top-1/2 -translate-y-1/2">
          <BackButton />
        </span>
        <div className="flex flex-col w-fit mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mx-auto my-1">
            Lump Sum Investment Calculator
          </h2>
          <span className="w-full bg-black h-2 text-start"></span>
        </div>
      </div>

      {/* Input Fields */}
      <div className="flex flex-wrap items-baseline justify-between gap-7 mt-6">
        {/* Lump Sum Amount */}
        <div className="border grow shrink basis-72 md:basis-[40%] w-full rounded-lg bg-slate-100 p-4 px-6">
          <label htmlFor="lumpSumAmount" className="text-gray-600">Lump Sum Amount</label>
          <div className="mt-1 bg-primary-white border-2 border-gray-300 rounded-lg relative focus-within:border-2 focus-within:border-blue-500">
            <span className="text-gray-400 text-sm absolute left-3 top-1/2 -translate-y-1/2">₹</span>
            <input
              className="px-3 py-2 text-gray-600 font-bold w-full bg-transparent ps-6 outline-none focus:outline-none"
              type="number"
              id="lumpSumAmount"
              placeholder="0"
              value={lumpSumAmount}
              onChange={(e) => setLumpSumAmount(e.target.value)}
            />
          </div>
        </div>

        {/* Annual Return Rate */}
        <div className="border grow shrink basis-72 md:basis-[40%] w-full rounded-lg bg-slate-100 p-4 px-6">
          <label htmlFor="annualReturnRate" className="text-gray-600">Annual Return Rate (%)</label>
          <div className="mt-1 bg-primary-white border-2 border-gray-300 rounded-lg relative focus-within:border-2 focus-within:border-blue-500">
            <input
              className="px-3 py-2 w-full text-gray-600 font-bold bg-transparent pe-4 outline-none focus:outline-none"
              type="number"
              id="annualReturnRate"
              placeholder="0"
              value={annualReturnRate}
              onChange={(e) => setAnnualReturnRate(e.target.value)}
            />
            <span className="text-gray-400 font-bold bg-slate-100 text-center h-full w-12 border-s-2 border-s-gray-300 flex items-center justify-center text-sm rounded-e-md absolute right-0 top-1/2 -translate-y-1/2">
              %
            </span>
          </div>
        </div>

        {/* Investment Duration */}
        <div className="border grow shrink basis-72 md:basis-[40%] w-full rounded-lg bg-slate-100 p-4 px-6">
          <label htmlFor="investmentYears" className="text-gray-600">Investment Duration (Years)</label>
          <div className="mt-1 bg-primary-white border-2 border-gray-300 rounded-lg relative focus-within:border-2 focus-within:border-blue-500">
            <input
              className="px-3 py-2 w-full text-gray-600 font-bold bg-transparent outline-none focus:outline-none"
              type="number"
              id="investmentYears"
              placeholder="0"
              value={investmentYears}
              onChange={(e) => setInvestmentYears(e.target.value)}
            />
            <span className="text-gray-400 font-bold bg-slate-100 text-center h-full w-12 border-s-2 border-s-gray-300 flex items-center justify-center text-sm rounded-e-md absolute right-0 top-1/2 -translate-y-1/2">
              Years
            </span>
          </div>
        </div>
      </div>

      {/* Calculate Button */}
      <div className="flex justify-start my-2 mt-6">
        <button
          onClick={calculateFutureValue}
          className="bg-blue-600 rounded-md px-16 py-3 text-slate-100 hover:bg-blue-700"
        >
          Calculate
        </button>
      </div>

      {/* Results Section */}
      {futureValue !== null && (
        <div className="mt-5 bg-gray-100 p-4 rounded-md">
          <h3 className="text-lg font-bold">Future Value of Investment</h3>
          <p className="text-blue-600">
            {formatCurrency(futureValue)}
          </p>
        </div>
      )}
    </div>
  );
};

export default LumpsumCalculator;