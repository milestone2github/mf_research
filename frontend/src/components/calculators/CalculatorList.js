import React from "react";
import { Link } from "react-router-dom";
import "./CalculatorList.css";

const calculators = [
  {
    id: 1,
    icon: "path/to/icon1.png",
    title: "Retirement Calculator",
    description: "Calculate the future value of your retirement savings.",
    route: "retirement-calculator",
  },
  {
    id: 2,
    icon: "path/to/icon2.png",
    title: "Target Date Fund Calculator",
    description:
      "determine how much they could accumulate by a specified date using target-date mutual funds.",
    route: "target-date-calculator",
  },
  {
    id: 3,
    icon: "path/to/icon3.png",
    title: "Mutual Fund Portfolio Overlap Calculator",
    description:
      "Analyzes multiple mutual fund holdings to identify common stocks or securities.",
    route: "mf-overlap-tool",
  },
  {
    id: 4,
    icon: "path/to/icon4.png",
    title: "Mutual Fund to ETF Comparison Calculator",
    description: "To compare MF performance with ETF.",
    route: "mf-vs-etf-calculator",
  },
  {
    id: 5,
    icon: "path/to/icon5.png",
    title: "Asset Allocation Tool",
    description:
      "Develop and recommend customized asset allocation strategies for clients based on their risk profiles, investment goals, and time horizons.",
    route: "asset-allocation-tool",
  },
  {
    id: 6,
    icon: "path/to/icon6.png",
    title: "Mutual Fund Cash Flow Planning Calculator",
    description:
      "Forecast and plan cash flows for clients by calculating expected dividends and capital gains.",
    route: "cash-flow-calculator",
  },
  {
    id: 7,
    icon: "path/to/icon7.png",
    title: "Goal-Based Investment Calculator",
    description:
      "Create investment plans for clients' specific financial goals.",
    route: "goal-based-investment-calculator",
  },
  {
    id: 8,
    icon: "path/to/icon8.png",
    title: "Mutual Fund Comparison Tool",
    description: "Compare various mutual funds based on multiple criteria.",
    route: "mf-comparison",
  },
  {
    id: 9,
    icon: "path/to/icon9.png",
    title: "Education Planning Calculator",
    description:
      "Planning how much needs to be invested in mutual funds to cover future education costs.",
    route: "education-planning-calculator",
  },
  {
    id: 10,
    icon: "path/to/icon10.png",
    title: "Mutual Fund Withdrawal Plan Calculator",
    description:
      "Planning systematic withdrawals for clients who need regular income from their mutual fund investments.",
    route: "SWP-calculator",
  },
  {
    id: 11,
    icon: "path/to/icon11.png",
    title: "Risk Analyzer",
    description: "Analyze the risk associated with your investments.",
    route: "risk-analyzer",
  },
  {
    id: 12,
    icon: "path/to/icon12.png",
    title: "Mutual Fund Performance Attribution Calculator",
    description: "Analyze the sources of a mutual fund's performance.",
    route: "mf-perfomance-source-calculator",
  },

  {
    id: 13,
    icon: "path/to/icon11.png",
    title: "SIP Calculator",
    description: "To calculate the SIP required to achieve a certain target.",
    route: "sip-calculator",
  },
  {
    id: 14,
    icon: "path/to/icon12.png",
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
