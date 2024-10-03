// In TargetDateFundCalculator.js
import React, { useState } from "react";
import BackButton from "../common/BackButton";
import RangeSlider from "../common/RangeSlider";
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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="px-3">
      <div className="relative flex">
        <span className="absolute left-0 top-1/2 -translate-y-1/2">
          <BackButton />
        </span>

        <div className="flex flex-col w-fit mx-auto">
          <h2 className="text-2xl text-dark-blue md:text-3xl font-bold mx-auto my-1">Target Date Fund Calculator</h2>
          <span className="w-full bg-yellow-600 h-2 text-start"></span>
        </div>
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-7 mt-6">
        {/* Initial Investment */}
        <div className="border grow shrink basis-72 md:basis-[40%] w-full md:w-1/2 rounded-lg bg-slate-100 p-4 px-6">
          <label htmlFor="initialInvestment" className="text-gray-600">Initial Investment</label>
          <div className="mt-1 bg-primary-white border-2 border-gray-300 rounded-lg relative focus-within:border-2 focus-within:border-blue-500">
            <span className="text-gray-400 text-sm absolute left-3 top-1/2 -translate-y-1/2">₹</span>
            <input
              className="px-3 py-2 text-gray-600 font-bold w-full bg-transparent ps-6 outline-none focus:outline-none"
              type="number"
              placeholder="Initial Investment Amount"
              value={initialInvestment}
              onChange={(e) => setInitialInvestment(e.target.value)}
            />
          </div>
        </div>

        {/* Monthly Contribution */}
        <div className="border grow shrink basis-72 md:basis-[40%] w-full md:w-1/2 rounded-lg bg-slate-100 p-4 px-6">
          <label htmlFor="monthlyContribution" className="text-gray-600">Monthly Contribution</label>
          <div className="mt-1 bg-primary-white border-2 border-gray-300 rounded-lg relative focus-within:border-2 focus-within:border-blue-500">
            <span className="text-gray-400 text-sm absolute left-3 top-1/2 -translate-y-1/2">₹</span>
            <input
              className="px-3 py-2 text-gray-600 font-bold w-full bg-transparent ps-6 outline-none focus:outline-none"
              type="number"
              placeholder="Monthly Contribution"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(e.target.value)}
            />
          </div>
        </div>

        {/* Annual Return Rate */}
        <div className="border grow shrink basis-72 md:basis-[40%] w-full md:w-1/2 rounded-lg bg-slate-100 p-4 px-6">
          <label htmlFor="annualReturnRate" className="text-gray-600">Annual Return Rate (%)</label>
          <div className="mt-1 bg-primary-white border-2 border-gray-300 rounded-lg relative focus-within:border-2 focus-within:border-blue-500">
            <input
              className="px-3 py-2 w-full text-gray-600 font-bold bg-transparent pe-4 outline-none focus:outline-none"
              type="number"
              placeholder="Annual Return Rate"
              value={annualReturnRate}
              onChange={(e) => setAnnualReturnRate(e.target.value)}
            />
            <span className="text-gray-400 font-bold bg-slate-100 text-center h-full w-12 border-s-2 border-s-gray-300 flex items-center justify-center text-sm rounded-e-md absolute right-0 top-1/2 -translate-y-1/2">
              %
            </span>
          </div>
        </div>

        {/* Years to Target */}
        <div className="border grow shrink basis-72 md:basis-[40%] w-full md:w-1/2 rounded-lg bg-slate-100 p-4 px-6">
          <label htmlFor="yearsToTarget" className="text-gray-600">Years to Target Date</label>
          <div className="mt-1 bg-primary-white border-2 border-gray-300 rounded-lg relative focus-within:border-2 focus-within:border-blue-500">
            <input
              className="px-3 py-2 w-full text-gray-600 font-bold bg-transparent pe-4 outline-none focus:outline-none"
              type="number"
              placeholder="Years to Target"
              value={yearsToTarget}
              onChange={(e) => setYearsToTarget(e.target.value)}
            />
            <span className="text-gray-400 text-sm absolute right-3 top-1/2 -translate-y-1/2">
              years
            </span>
          </div>
        </div>
      </div>

      {/* Calculate button */}
      <div className="flex justify-start my-2 mt-6">
        <button
          onClick={calculateAccumulatedAmount}
          className="bg-yellow-600 rounded-md px-16 py-3 text-slate-100 hover:bg-[#b57b00]"
        >
          Calculate
        </button>
      </div>

      {/* Results Section */}
      {accumulatedAmount !== null && (
        <ul className="info grid grid-cols-3 justify-center gap-2 mt-5">
          <li>
            <p>Accumulated Amount by Target Date</p>
            <span className="values">{formatCurrency(accumulatedAmount)}</span>
          </li>
        </ul>
      )}
    </div>
  );
};

export default TargetDateFundCalculator;