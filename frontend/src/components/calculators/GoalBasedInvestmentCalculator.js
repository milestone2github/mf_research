import React, { useState } from "react";
import BackButton from "../common/BackButton";
import "./GoalBasedInvestmentCalculator.css";

// Function to format the currency to INR
const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
};

const GoalBasedInvestmentCalculator = () => {
  const [goalAmount, setGoalAmount] = useState("");
  const [currentSavings, setCurrentSavings] = useState("");
  const [annualInvestmentReturn, setAnnualInvestmentReturn] = useState("");
  const [timeFrame, setTimeFrame] = useState("");

  const [monthlyInvestment, setMonthlyInvestment] = useState(null);

  const calculateMonthlyInvestment = () => {
    if (!goalAmount || !currentSavings || !annualInvestmentReturn || !timeFrame) {
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
    <div className="goal-based-investment-calculator px-5 py-6">
      {/* Back Button */}
      <div className="relative flex">
        <span className="absolute left-0 top-1/2 -translate-y-1/2">
          <BackButton />
        </span>
        <div className="flex flex-col w-fit mx-auto">
          <h2 className="text-2xl text-dark-blue md:text-3xl font-bold mx-auto my-1">
            Goal-Based Investment Calculator
          </h2>
          <span className="w-full bg-yellow-600 h-2 text-start"></span>
        </div>
      </div>

      {/* Input Fields */}
      <div className="flex flex-wrap items-baseline justify-between gap-7 mt-6">
        <div className="border rounded-lg bg-slate-100 flex flex-wrap gap-x-4 gap-y-7 w-full p-4 px-6">
          {/* Goal Amount */}
          <div className="grow">
            <label htmlFor="goalAmount" className="text-gray-600">
              Goal Amount
            </label>
            <div className="mt-1 bg-primary-white border-2 border-gray-300 rounded-lg relative focus-within:border-2 focus-within:border-blue-500">
              <span className="text-gray-400 text-sm absolute left-3 top-1/2 -translate-y-1/2">
                ₹
              </span>
              <input
                className="px-3 py-2 text-gray-600 font-bold w-full bg-transparent ps-6 outline-none focus:outline-none"
                type="number"
                id="goalAmount"
                placeholder="Goal Amount"
                value={goalAmount}
                onChange={(e) => setGoalAmount(e.target.value)}
              />
            </div>
          </div>

          {/* Current Savings */}
          <div className="grow">
            <label htmlFor="currentSavings" className="text-gray-600">
              Current Savings
            </label>
            <div className="mt-1 bg-primary-white border-2 border-gray-300 rounded-lg relative focus-within:border-2 focus-within:border-blue-500">
              <span className="text-gray-400 text-sm absolute left-3 top-1/2 -translate-y-1/2">
                ₹
              </span>
              <input
                className="px-3 py-2 text-gray-600 font-bold w-full bg-transparent ps-6 outline-none focus:outline-none"
                type="number"
                id="currentSavings"
                placeholder="Current Savings"
                value={currentSavings}
                onChange={(e) => setCurrentSavings(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Annual Investment Return */}
        <div className="border grow shrink basis-72 md:basis-[40%] w-full md:w-1/2 rounded-lg bg-slate-100 p-4 px-6">
          <label htmlFor="annualInvestmentReturn" className="text-gray-600">
            Annual Investment Return (%)
          </label>
          <div className="mt-1 bg-primary-white border-2 border-gray-300 rounded-lg relative focus-within:border-2 focus-within:border-blue-500">
            <input
              className="px-3 py-2 text-gray-600 font-bold w-full bg-transparent outline-none focus:outline-none"
              type="number"
              id="annualInvestmentReturn"
              placeholder="Annual Return Rate"
              value={annualInvestmentReturn}
              onChange={(e) => setAnnualInvestmentReturn(e.target.value)}
            />
            <span className="text-gray-400 font-bold bg-slate-100 text-center h-full w-12 border-s-2 border-s-gray-300 flex items-center justify-center text-sm rounded-e-md absolute right-0 top-1/2 -translate-y-1/2">
              %
            </span>
          </div>
        </div>

        {/* Time Frame */}
        <div className="border grow shrink basis-72 md:basis-[40%] w-full md:w-1/2 rounded-lg bg-slate-100 p-4 px-6">
          <label htmlFor="timeFrame" className="text-gray-600">
            Time Frame (years)
          </label>
          <div className="mt-1 bg-primary-white border-2 border-gray-300 rounded-lg relative focus-within:border-2 focus-within:border-blue-500">
            <input
              className="px-3 py-2 text-gray-600 font-bold w-full bg-transparent outline-none focus:outline-none"
              type="number"
              id="timeFrame"
              placeholder="Time Frame"
              value={timeFrame}
              onChange={(e) => setTimeFrame(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Calculate Button */}
      <div className="flex justify-start my-2 mt-6">
        <button
          onClick={calculateMonthlyInvestment}
          className="bg-yellow-600 rounded-md px-16 py-3 text-slate-100 hover:bg-[#b57b00]"
        >
          Calculate
        </button>
      </div>

      {/* Results Section */}
      {monthlyInvestment !== null && (
        <div className="mt-5 bg-gray-100 p-4 rounded-md">
          <h3 className="text-lg font-bold">Results</h3>
          <p className="text-blue-600">
            Monthly Investment Needed:{" "}
            <span className="font-bold">{formatCurrency(monthlyInvestment)}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default GoalBasedInvestmentCalculator;