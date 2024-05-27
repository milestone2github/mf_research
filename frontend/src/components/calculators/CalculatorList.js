import React from "react";
import { Link } from "react-router-dom";
import "./CalculatorList.css";
import RetirementCalculator from '../../assets/RetirementCalculator.png'
import { useSelector } from "react-redux";
import noCalculatorImage from '../../assets/noCalculator.svg'

const calculators = [
  {
    name: 'Retirement Calculator',
    icon: RetirementCalculator,
    title: "Retirement Calculator",
    description: "Calculate the future value of your retirement savings.",
    route: "retirement-calculator",
  },
  // {
  //   name: 'Target Calculator',
  //   icon: "tdfCalculator.png",
  //   title: "Target Date Fund Calculator",
  //   description:
  //     "determine how much they could accumulate by a specified date using target-date mutual funds.",
  //   route: "target-date-calculator",
  // },
  // {
  //   name: 'MF Portfolio Calculator',
  //   icon: "mfpoCalculator.png",
  //   title: "Mutual Fund Portfolio Overlap Calculator",
  //   description:
  //     "Analyzes multiple mutual fund holdings to identify common stocks or securities.",
  //   route: "mf-overlap-tool",
  // },
  // {
  //   name: 'MF to ETF Comparison Calculator',
  //   icon: "mfEtfCalculator.png",
  //   title: "Mutual Fund to ETF Comparison Calculator",
  //   description: "To compare MF performance with ETF.",
  //   route: "mf-vs-etf-calculator",
  // },
  // {
  //   name: 'Asset Allocation Tool',
  //   icon: "assetAllocationTool.png",
  //   title: "Asset Allocation Tool",
  //   description:
  //     "Develop and recommend customized asset allocation strategies for clients based on their risk profiles, investment goals, and time horizons.",
  //   route: "asset-allocation-tool",
  // },
  // {
  //   name: 'MF Cash Flow Planning Calculator',
  //   icon: "mfCfpCalculator.png",
  //   title: "Mutual Fund Cash Flow Planning Calculator",
  //   description:
  //     "Forecast and plan cash flows for clients by calculating expected dividends and capital gains.",
  //   route: "cash-flow-calculator",
  // },
  // {
  //   name: 'Goal Based Investment Calculator',
  //   icon: "GoalBasedInvestCalculator.png",
  //   title: "Goal-Based Investment Calculator",
  //   description:
  //     "Create investment plans for clients' specific financial goals.",
  //   route: "goal-based-investment-calculator",
  // },
  // {
  //   name: 'MF Comparison Tool',
  //   icon: "mfCamparisonTool.png",
  //   title: "Mutual Fund Comparison Tool",
  //   description: "Compare various mutual funds based on multiple criteria.",
  //   route: "mf-comparison",
  // },
  // {
  //   name: 'Education Planning Calculator',
  //   icon: "EduPlanningCalculator.png",
  //   title: "Education Planning Calculator",
  //   description:
  //     "Planning how much needs to be invested in mutual funds to cover future education costs.",
  //   route: "education-planning-calculator",
  // },
  // {
  //   name: 'MF Withdrawal Plan Calculator',
  //   icon: "mfWidthdrawalPlanCalculator.png",
  //   title: "Mutual Fund Withdrawal Plan Calculator",
  //   description:
  //     "Planning systematic withdrawals for clients who need regular income from their mutual fund investments.",
  //   route: "SWP-calculator",
  // },
  // {
  //   name: 'Risk Analyzer',
  //   icon: "RiskAnalyzer.png",
  //   title: "Risk Analyzer",
  //   description: "Analyze the risk associated with your investments.",
  //   route: "risk-analyzer",
  // },
  // {
  //   name: 'MF Performance Attribution Calculator',
  //   icon: "mfPerformanceAttrCalculator.png",
  //   title: "Mutual Fund Performance Attribution Calculator",
  //   description: "Analyze the sources of a mutual fund's performance.",
  //   route: "mf-perfomance-source-calculator",
  // },

  // {
  //   name: 'SIP Calculator',
  //   icon: "SipCalculator.png",
  //   title: "SIP Calculator",
  //   description: "To calculate the SIP required to achieve a certain target.",
  //   route: "sip-calculator",
  // },
  // {
  //   name: 'Lumpsum Calculator',
  //   icon: "LumpsumCalculator.png",
  //   title: "Lumpsum Calculator",
  //   description:
  //     "To calculate the Lumpsum investment required to achieve a certain target.",
  //   route: "lumpsum-calculator",
  // },
];

const CalculatorList = () => {
  const { userData } = useSelector(state => state.user);
  const permissions = userData?.role?.permissions;
  const allowedCalculators = calculators.filter(calculator => (
    permissions.includes(calculator.name)
  ))

  return (
    <div className="calculator-page h-full">
      <h1 className="text-2xl font-bold text-gray-700">Financial Calculators</h1>
      <div className="calculator-list">
        {allowedCalculators.length <= 0 ? <NoCalculatorsAllowed /> 
        : allowedCalculators.map((calc) => (
          <Link to={calc.route} key={calc.route} className="calculator-card">
            <img src={calc.icon} alt={calc.title} className="calculator-icon" />
            <h2>{calc.title}</h2>
            <p>{calc.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

const NoCalculatorsAllowed = () => {
  return (
      <div id="no-calc-card" class="calculator-card">
        <img src={noCalculatorImage} alt="No Calculators" width={'90px'} class="no-calculator-icon" />
        <h2 className="text-red-400">No Calculators Available</h2>
        <p>Currently, there are no calculators available for you. Please check back later or explore other sections of our application.</p>
      </div>
  )
}

export default CalculatorList;
