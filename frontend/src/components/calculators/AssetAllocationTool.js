import React, { useState } from "react";
import { Pie } from "react-chartjs-2";
import "./AssetAllocationTool.css";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import BackButton from "../common/BackButton";

ChartJS.register(ArcElement, Tooltip, Legend);

const AssetAllocationAdvisorTool = () => {
  const [riskProfile, setRiskProfile] = useState("");
  const [investmentGoal, setInvestmentGoal] = useState("");
  const [timeHorizon, setTimeHorizon] = useState("");
  const [allocation, setAllocation] = useState({
    equity: null,
    debt: null,
    others: null,
  });
  const [showChart, setShowChart] = useState(false); // Track if the chart is shown

  const calculateAssetAllocation = () => {
    if (!riskProfile || !investmentGoal || !timeHorizon) {
      alert("Please fill in all fields to calculate asset allocation.");
      return;
    }

    let equityPercentage, debtPercentage, othersPercentage;

    switch (riskProfile) {
      case "conservative":
        equityPercentage = 20;
        debtPercentage = 70;
        othersPercentage = 10;
        break;
      case "moderate":
        equityPercentage = 50;
        debtPercentage = 40;
        othersPercentage = 10;
        break;
      case "aggressive":
        equityPercentage = 70;
        debtPercentage = 20;
        othersPercentage = 10;
        break;
      default:
        equityPercentage = 0;
        debtPercentage = 0;
        othersPercentage = 0;
    }

    setAllocation({
      equity: equityPercentage,
      debt: debtPercentage,
      others: othersPercentage,
    });

    setShowChart(true); // Trigger chart visibility after allocation is calculated
  };

  const chartData = {
    labels: ["Equity", "Debt", "Others"],
    datasets: [
      {
        data: [allocation.equity, allocation.debt, allocation.others],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
        hoverBackgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
      },
    ],
  };

  const getProfileExplanation = () => {
    switch (riskProfile) {
      case "conservative":
        return "A conservative profile suggests a higher allocation in debt to minimize risk and ensure steady returns.";
      case "moderate":
        return "A moderate profile balances risk and return by diversifying across equity and debt.";
      case "aggressive":
        return "An aggressive profile aims for higher returns by taking more risk, mainly in equity.";
      default:
        return "";
    }
  };

  return (
    <div className="px-3">
      <div className="relative flex">
        <span className="absolute left-0 top-1/2 -translate-y-1/2">
          <BackButton />
        </span>

        <div className="flex flex-col w-fit mx-auto">
          <h2 className="text-2xl text-dark-blue md:text-3xl font-bold mx-auto my-1">
            Asset Allocation Advisor Tool
          </h2>
          <span className="w-full bg-yellow-600 h-2 text-start"></span>
        </div>
      </div>

      <div
        className={`form-chart-container flex flex-wrap items-start justify-between gap-7 mt-6 ${
          showChart ? "with-chart" : ""
        }`}
      >
        {/* Form Section */}
        <div
          className={`form-section grow basis-72 md:basis-[40%] w-full md:w-1/2 rounded-lg bg-slate-100 p-4 px-6 ${
            showChart ? "move-left" : ""
          }`}
        >
          <div className="mb-4">
            <label htmlFor="riskProfile" className="text-gray-600">
              Risk Profile
            </label>
            <select
              className="mt-1 block w-full bg-primary-white border-2 border-gray-300 rounded-lg px-3 py-2 text-gray-600 focus:border-blue-500 focus:outline-none"
              value={riskProfile}
              onChange={(e) => setRiskProfile(e.target.value)}
            >
              <option value="">Select Risk Profile</option>
              <option value="conservative">Conservative</option>
              <option value="moderate">Moderate</option>
              <option value="aggressive">Aggressive</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="investmentGoal" className="text-gray-600">
              Investment Goal
            </label>
            <input
              className="mt-1 block w-full bg-primary-white border-2 border-gray-300 rounded-lg px-3 py-2 text-gray-600 focus:border-blue-500 focus:outline-none"
              type="text"
              placeholder="Investment Goal"
              value={investmentGoal}
              onChange={(e) => setInvestmentGoal(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="timeHorizon" className="text-gray-600">
              Time Horizon (years)
            </label>
            <input
              className="mt-1 block w-full bg-primary-white border-2 border-gray-300 rounded-lg px-3 py-2 text-gray-600 focus:border-blue-500 focus:outline-none"
              type="number"
              placeholder="Time Horizon"
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(e.target.value)}
            />
          </div>
          <button
            onClick={calculateAssetAllocation}
            className="w-full bg-yellow-600 text-white font-bold py-2 px-4 rounded hover:bg-[#b57b00] transition-all duration-300"
          >
            Calculate
          </button>
        </div>

        {/* Chart Section */}
        {showChart && (
          <div className="chart-section grow shrink basis-72 md:basis-[40%] w-full md:w-1/2 rounded-lg bg-slate-100 p-4 px-6 slide-in-right">
            <h3 className="text-lg font-bold mb-4">Asset Allocation</h3>
            <div className="chart-container" style={{ maxWidth: "200px", margin: "0 auto" }}>
              <Pie data={chartData} />
            </div>
            <div className="allocation-summary mt-4 text-center text-sm">
              <p className="text-lg font-semibold">Asset Allocation Breakdown</p>
              <p>
                <span className="text-yellow-600 font-bold">{allocation.equity}%</span> Equity,{" "}
                <span className="text-blue-500 font-bold">{allocation.debt}%</span> Debt,{" "}
                <span className="text-green-500 font-bold">{allocation.others}%</span> Others
              </p>
              <p className="mt-2 font-semibold">{getProfileExplanation()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssetAllocationAdvisorTool;