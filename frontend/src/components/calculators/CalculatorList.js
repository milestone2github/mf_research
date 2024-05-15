import React from "react";
import { Link } from "react-router-dom";
import "./CalculatorList.css";
import RetirementCalculator from '../../assets/RetirementCalculator.png'

const calculators = [
  {
    id: 1,
    icon: RetirementCalculator,
    title: "Retirement Calculator",
    description: "Calculate the future value of your retirement savings.",
    route: "retirement-calculator",
  },
  {
    id: 2,
    icon: "tdfCalculator.png",
    title: "Target Date Fund Calculator",
    description:
      "determine how much they could accumulate by a specified date using target-date mutual funds.",
    route: "target-date-calculator",
  },
  {
    id: 3,
    icon: "mfpoCalculator.png",
    title: "Mutual Fund Portfolio Overlap Calculator",
    description:
      "Analyzes multiple mutual fund holdings to identify common stocks or securities.",
    route: "mf-overlap-tool",
  },
  {
    id: 4,
    icon: "mfEtfCalculator.png",
    title: "Mutual Fund to ETF Comparison Calculator",
    description: "To compare MF performance with ETF.",
    route: "mf-vs-etf-calculator",
  },
  {
    id: 5,
    icon: "assetAllocationTool.png",
    title: "Asset Allocation Tool",
    description:
      "Develop and recommend customized asset allocation strategies for clients based on their risk profiles, investment goals, and time horizons.",
    route: "asset-allocation-tool",
  },
  {
    id: 6,
    icon: "mfCfpCalculator.png",
    title: "Mutual Fund Cash Flow Planning Calculator",
    description:
      "Forecast and plan cash flows for clients by calculating expected dividends and capital gains.",
    route: "cash-flow-calculator",
  },
  {
    id: 7,
    icon: "GoalBasedInvestCalculator.png",
    title: "Goal-Based Investment Calculator",
    description:
      "Create investment plans for clients' specific financial goals.",
    route: "goal-based-investment-calculator",
  },
  {
    id: 8,
    icon: "mfCamparisonTool.png",
    title: "Mutual Fund Comparison Tool",
    description: "Compare various mutual funds based on multiple criteria.",
    route: "mf-comparison",
  },
  {
    id: 9,
    icon: "EduPlanningCalculator.png",
    title: "Education Planning Calculator",
    description:
      "Planning how much needs to be invested in mutual funds to cover future education costs.",
    route: "education-planning-calculator",
  },
  {
    id: 10,
    icon: "mfWidthdrawalPlanCalculator.png",
    title: "Mutual Fund Withdrawal Plan Calculator",
    description:
      "Planning systematic withdrawals for clients who need regular income from their mutual fund investments.",
    route: "SWP-calculator",
  },
  {
    id: 11,
    icon: "RiskAnalyzer.png",
    title: "Risk Analyzer",
    description: "Analyze the risk associated with your investments.",
    route: "risk-analyzer",
  },
  {
    id: 12,
    icon: "mfPerformanceAttrCalculator.png",
    title: "Mutual Fund Performance Attribution Calculator",
    description: "Analyze the sources of a mutual fund's performance.",
    route: "mf-perfomance-source-calculator",
  },

  {
    id: 13,
    icon: "SipCalculator.png",
    title: "SIP Calculator",
    description: "To calculate the SIP required to achieve a certain target.",
    route: "sip-calculator",
  },
  {
    id: 14,
    icon: "LumpsumCalculator.png",
    title: "Lumpsum Calculator",
    description:
      "To calculate the Lumpsum investment required to achieve a certain target.",
    route: "lumpsum-calculator",
  },
];

const CalculatorList = () => {
  return (
    <div className="calculator-page">
      <h1>Financial Calculators</h1>
      <div className="calculator-list">
        {calculators.map((calc) => (
          <Link to={calc.route} key={calc.id} className="calculator-card">
            <img src={calc.icon} alt={calc.title} className="calculator-icon" />
            <h2>{calc.title}</h2>
            <p>{calc.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CalculatorList;
