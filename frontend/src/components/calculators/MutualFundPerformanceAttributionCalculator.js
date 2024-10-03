import React, { useState } from "react";
import BackButton from "../common/BackButton";
import "./MutualFundPerformanceAttributionCalculator.css";

const MutualFundPerformanceAttributionCalculator = () => {
  const [totalReturn, setTotalReturn] = useState("");
  const [marketTiming, setMarketTiming] = useState("");
  const [stockSelection, setStockSelection] = useState("");
  const [sectorAllocation, setSectorAllocation] = useState("");

  const [performanceAttribution, setPerformanceAttribution] = useState(null);

  const calculatePerformanceAttribution = () => {
    if (!totalReturn || !marketTiming || !stockSelection || !sectorAllocation) {
      alert(
        "Please fill in all fields to calculate the performance attribution."
      );
      return;
    }

    const totalReturnNum = parseFloat(totalReturn);
    const marketTimingNum = parseFloat(marketTiming);
    const stockSelectionNum = parseFloat(stockSelection);
    const sectorAllocationNum = parseFloat(sectorAllocation);

    const calculatedTotal =
      marketTimingNum + stockSelectionNum + sectorAllocationNum;

    setPerformanceAttribution({
      totalCalculated: calculatedTotal,
      unexplained: totalReturnNum - calculatedTotal,
    });
  };

  return (
    <div className="mutual-fund-performance-attribution-calculator px-5 py-6">
      {/* Back Button */}
      <div className="relative flex">
        <span className="absolute left-0 top-1/2 -translate-y-1/2">
          <BackButton />
        </span>
        <div className="flex flex-col w-fit mx-auto">
          <h2 className="text-2xl text-dark-blue md:text-3xl font-bold mx-auto my-1">
            Mutual Fund Performance Attribution Calculator
          </h2>
          <span className="w-full bg-yellow-600 h-2 text-start"></span>
        </div>
      </div>

      {/* Input Fields */}
      <div className="flex flex-wrap items-baseline justify-between gap-7 mt-6">
        {/* Total Return */}
        <div className="border grow shrink basis-72 md:basis-[40%] w-full rounded-lg bg-slate-100 p-4 px-6">
          <label htmlFor="totalReturn" className="text-gray-600">
            Total Return (%)
          </label>
          <div className="mt-1 bg-primary-white border-2 border-gray-300 rounded-lg relative focus-within:border-2 focus-within:border-blue-500">
            <input
              className="px-3 py-2 w-full text-gray-600 font-bold bg-transparent pe-4 outline-none focus:outline-none"
              type="number"
              id="totalReturn"
              placeholder="0"
              value={totalReturn}
              onChange={(e) => setTotalReturn(e.target.value)}
            />
            <span className="text-gray-400 font-bold bg-slate-100 text-center h-full w-12 border-s-2 border-s-gray-300 flex items-center justify-center text-sm rounded-e-md absolute right-0 top-1/2 -translate-y-1/2">
              %
            </span>
          </div>
        </div>

        {/* Market Timing */}
        <div className="border grow shrink basis-72 md:basis-[40%] w-full rounded-lg bg-slate-100 p-4 px-6">
          <label htmlFor="marketTiming" className="text-gray-600">
            Market Timing (%)
          </label>
          <div className="mt-1 bg-primary-white border-2 border-gray-300 rounded-lg relative focus-within:border-2 focus-within:border-blue-500">
            <input
              className="px-3 py-2 w-full text-gray-600 font-bold bg-transparent pe-4 outline-none focus:outline-none"
              type="number"
              id="marketTiming"
              placeholder="0"
              value={marketTiming}
              onChange={(e) => setMarketTiming(e.target.value)}
            />
            <span className="text-gray-400 font-bold bg-slate-100 text-center h-full w-12 border-s-2 border-s-gray-300 flex items-center justify-center text-sm rounded-e-md absolute right-0 top-1/2 -translate-y-1/2">
              %
            </span>
          </div>
        </div>

        {/* Stock Selection */}
        <div className="border grow shrink basis-72 md:basis-[40%] w-full rounded-lg bg-slate-100 p-4 px-6">
          <label htmlFor="stockSelection" className="text-gray-600">
            Stock Selection (%)
          </label>
          <div className="mt-1 bg-primary-white border-2 border-gray-300 rounded-lg relative focus-within:border-2 focus-within:border-blue-500">
            <input
              className="px-3 py-2 w-full text-gray-600 font-bold bg-transparent pe-4 outline-none focus:outline-none"
              type="number"
              id="stockSelection"
              placeholder="0"
              value={stockSelection}
              onChange={(e) => setStockSelection(e.target.value)}
            />
            <span className="text-gray-400 font-bold bg-slate-100 text-center h-full w-12 border-s-2 border-s-gray-300 flex items-center justify-center text-sm rounded-e-md absolute right-0 top-1/2 -translate-y-1/2">
              %
            </span>
          </div>
        </div>

        {/* Sector Allocation */}
        <div className="border grow shrink basis-72 md:basis-[40%] w-full rounded-lg bg-slate-100 p-4 px-6">
          <label htmlFor="sectorAllocation" className="text-gray-600">
            Sector Allocation (%)
          </label>
          <div className="mt-1 bg-primary-white border-2 border-gray-300 rounded-lg relative focus-within:border-2 focus-within:border-blue-500">
            <input
              className="px-3 py-2 w-full text-gray-600 font-bold bg-transparent pe-4 outline-none focus:outline-none"
              type="number"
              id="sectorAllocation"
              placeholder="0"
              value={sectorAllocation}
              onChange={(e) => setSectorAllocation(e.target.value)}
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
          onClick={calculatePerformanceAttribution}
          className="bg-yellow-600 rounded-md px-16 py-3 text-slate-100 hover:bg-[#b57b00]"
        >
          Calculate Attribution
        </button>
      </div>

      {/* Results Section */}
      {performanceAttribution && (
        <div className="mt-5 bg-gray-100 p-4 rounded-md">
          <h3 className="text-lg font-bold">Attributed Performance</h3>
          <p className="text-blue-600">
            <strong>Total Attributed: </strong>
            {performanceAttribution.totalCalculated.toFixed(2)}%
          </p>
          <p className="text-blue-600">
            <strong>Unexplained Performance: </strong>
            {performanceAttribution.unexplained.toFixed(2)}%
          </p>
        </div>
      )}
    </div>
  );
};

export default MutualFundPerformanceAttributionCalculator;