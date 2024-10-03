// In MutualFundToETFComparisonCalculator.js
import React, { useState } from "react";
import BackButton from "../common/BackButton";
import "./MutualFundToETFComparisonCalculator.css";

const MutualFundToETFComparisonCalculator = () => {
  const [mutualFundReturn, setMutualFundReturn] = useState("");
  const [mutualFundExpenseRatio, setMutualFundExpenseRatio] = useState("");
  const [etfReturn, setEtfReturn] = useState("");
  const [etfExpenseRatio, setEtfExpenseRatio] = useState("");

  const [comparisonResult, setComparisonResult] = useState(null);

  const compareInvestments = () => {
    if (
      !mutualFundReturn ||
      !mutualFundExpenseRatio ||
      !etfReturn ||
      !etfExpenseRatio
    ) {
      alert("Please fill in all fields to perform the comparison.");
      return;
    }

    const mfReturnNum = parseFloat(mutualFundReturn);
    const mfExpenseRatioNum = parseFloat(mutualFundExpenseRatio);
    const etfReturnNum = parseFloat(etfReturn);
    const etfExpenseRatioNum = parseFloat(etfExpenseRatio);

    const mfNetReturn = mfReturnNum - mfExpenseRatioNum;
    const etfNetReturn = etfReturnNum - etfExpenseRatioNum;

    setComparisonResult({
      mutualFundNetReturn: mfNetReturn,
      etfNetReturn: etfNetReturn,
    });
  };

  return (
    <div className="px-3">
      <div className="relative flex">
        <span className="absolute left-0 top-1/2 -translate-y-1/2">
          <BackButton />
        </span>

        <div className="flex flex-col w-fit mx-auto">
          <h2 className="text-2xl text-dark-blue md:text-3xl font-bold mx-auto my-1">
            Mutual Fund to ETF Comparison Calculator
          </h2>
          <span className="w-full bg-yellow-600 h-2 text-start"></span>
        </div>
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-7 mt-6">
        {/* Mutual Fund Return */}
        <div className="border grow shrink basis-72 md:basis-[40%] w-full md:w-1/2 rounded-lg bg-slate-100 p-4 px-6">
          <label htmlFor="mutualFundReturn" className="text-gray-600">
            Mutual Fund Return (%)
          </label>
          <div className="mt-1 bg-primary-white border-2 border-gray-300 rounded-lg relative focus-within:border-2 focus-within:border-blue-500">
            <input
              className="px-3 py-2 w-full text-gray-600 font-bold bg-transparent outline-none focus:outline-none"
              type="number"
              placeholder="Mutual Fund Return"
              value={mutualFundReturn}
              onChange={(e) => setMutualFundReturn(e.target.value)}
            />
            <span className="text-gray-400 font-bold bg-slate-100 text-center h-full w-12 border-s-2 border-s-gray-300 flex items-center justify-center text-sm rounded-e-md absolute right-0 top-1/2 -translate-y-1/2">
              %
            </span>
          </div>
        </div>

        {/* Mutual Fund Expense Ratio */}
        <div className="border grow shrink basis-72 md:basis-[40%] w-full md:w-1/2 rounded-lg bg-slate-100 p-4 px-6">
          <label htmlFor="mutualFundExpenseRatio" className="text-gray-600">
            Mutual Fund Expense Ratio (%)
          </label>
          <div className="mt-1 bg-primary-white border-2 border-gray-300 rounded-lg relative focus-within:border-2 focus-within:border-blue-500">
            <input
              className="px-3 py-2 w-full text-gray-600 font-bold bg-transparent outline-none focus:outline-none"
              type="number"
              placeholder="Mutual Fund Expense Ratio"
              value={mutualFundExpenseRatio}
              onChange={(e) => setMutualFundExpenseRatio(e.target.value)}
            />
            <span className="text-gray-400 font-bold bg-slate-100 text-center h-full w-12 border-s-2 border-s-gray-300 flex items-center justify-center text-sm rounded-e-md absolute right-0 top-1/2 -translate-y-1/2">
              %
            </span>
          </div>
        </div>

        {/* ETF Return */}
        <div className="border grow shrink basis-72 md:basis-[40%] w-full md:w-1/2 rounded-lg bg-slate-100 p-4 px-6">
          <label htmlFor="etfReturn" className="text-gray-600">
            ETF Return (%)
          </label>
          <div className="mt-1 bg-primary-white border-2 border-gray-300 rounded-lg relative focus-within:border-2 focus-within:border-blue-500">
            <input
              className="px-3 py-2 w-full text-gray-600 font-bold bg-transparent outline-none focus:outline-none"
              type="number"
              placeholder="ETF Return"
              value={etfReturn}
              onChange={(e) => setEtfReturn(e.target.value)}
            />
            <span className="text-gray-400 font-bold bg-slate-100 text-center h-full w-12 border-s-2 border-s-gray-300 flex items-center justify-center text-sm rounded-e-md absolute right-0 top-1/2 -translate-y-1/2">
              %
            </span>
          </div>
        </div>

        {/* ETF Expense Ratio */}
        <div className="border grow shrink basis-72 md:basis-[40%] w-full md:w-1/2 rounded-lg bg-slate-100 p-4 px-6">
          <label htmlFor="etfExpenseRatio" className="text-gray-600">
            ETF Expense Ratio (%)
          </label>
          <div className="mt-1 bg-primary-white border-2 border-gray-300 rounded-lg relative focus-within:border-2 focus-within:border-blue-500">
            <input
              className="px-3 py-2 w-full text-gray-600 font-bold bg-transparent outline-none focus:outline-none"
              type="number"
              placeholder="ETF Expense Ratio"
              value={etfExpenseRatio}
              onChange={(e) => setEtfExpenseRatio(e.target.value)}
            />
            <span className="text-gray-400 font-bold bg-slate-100 text-center h-full w-12 border-s-2 border-s-gray-300 flex items-center justify-center text-sm rounded-e-md absolute right-0 top-1/2 -translate-y-1/2">
              %
            </span>
          </div>
        </div>
      </div>

      {/* Compare Button */}
      <div className="flex justify-start my-2 mt-6">
        <button
          onClick={compareInvestments}
          className="bg-yellow-600 rounded-md px-16 py-3 text-slate-100 hover:bg-[#b57b00]"
        >
          Compare
        </button>
      </div>

      {/* Comparison Result */}
      {comparisonResult && (
        <ul className="info grid grid-cols-2 justify-center gap-2 mt-5">
          <li>
            <p>Mutual Fund Net Return</p>
            <span className="values">{comparisonResult.mutualFundNetReturn.toFixed(2)}%</span>
          </li>
          <li>
            <p>ETF Net Return</p>
            <span className="values">{comparisonResult.etfNetReturn.toFixed(2)}%</span>
          </li>
        </ul>
      )}
    </div>
  );
};

export default MutualFundToETFComparisonCalculator;