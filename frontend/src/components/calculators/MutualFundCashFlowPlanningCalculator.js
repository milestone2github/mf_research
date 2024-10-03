import React, { useState } from "react";
import BackButton from "../common/BackButton";
import "./MutualFundCashFlowPlanningCalculator.css";

// Formatting INR currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
};

const MutualFundCashFlowPlanningCalculator = () => {
  const [cashFlowItems, setCashFlowItems] = useState([]);
  const [newCashFlow, setNewCashFlow] = useState({
    description: "",
    amount: 0,
    type: "inflow",
    year: 0,
  });
  const [investmentMix, setInvestmentMix] = useState({ sip: 50, lumpSum: 50 });
  const [variableROI, setVariableROI] = useState([]);
  const [newROI, setNewROI] = useState(0);
  const [requiredInvestment, setRequiredInvestment] = useState(null);

  const addCashFlowItem = () => {
    if (!newCashFlow.description || !newCashFlow.amount) {
      alert("Please enter a description and amount for the cash flow item.");
      return;
    }
    setCashFlowItems([...cashFlowItems, newCashFlow]);
    setNewCashFlow({ description: "", amount: 0, type: "inflow", year: 0 });
  };

  const removeCashFlowItem = (index) => {
    const newItems = [...cashFlowItems];
    newItems.splice(index, 1);
    setCashFlowItems(newItems);
  };

  const addVariableROI = () => {
    setVariableROI([...variableROI, newROI]);
    setNewROI(0);
  };

  const calculateRequiredInvestments = () => {
    if (
      cashFlowItems.length === 0 ||
      investmentMix.sip + investmentMix.lumpSum !== 100
    ) {
      alert(
        "Please add cash flow items and ensure the investment mix totals 100%."
      );
      return;
    }

    let annualDiscountRate =
      variableROI.length > 0
        ? variableROI.reduce((a, b) => a + b, 0) / variableROI.length / 100
        : 0.05;

    let presentValue = cashFlowItems.reduce((total, item) => {
      let pvFactor = Math.pow(1 + annualDiscountRate, item.year || 0);
      return (
        total + (item.type === "outflow" ? 1 : -1) * item.amount * pvFactor
      );
    }, 0);

    let totalRequired = presentValue < 0 ? -presentValue : 0;

    let requiredSIP = totalRequired * (investmentMix.sip / 100);
    let requiredLumpSum = totalRequired * (investmentMix.lumpSum / 100);

    setRequiredInvestment({
      sip: requiredSIP,
      lumpSum: requiredLumpSum,
    });
  };

  return (
    <div className="mutual-fund-cash-flow-planning-calculator px-5 py-6">
      {/* Back Button */}
      <div className="relative flex">
        <span className="absolute left-0 top-1/2 -translate-y-1/2">
          <BackButton />
        </span>
        <div className="flex flex-col w-fit mx-auto">
          <h2 className="text-2xl text-dark-blue md:text-3xl font-bold mx-auto my-1">
            Mutual Fund Cash Flow Planning Calculator
          </h2>
          <span className="w-full bg-yellow-600 h-2 text-start"></span>
        </div>
      </div>

      {/* Cash Flow Items Section */}
      <div className="mb-5">
        <h3 className="text-lg font-semibold mb-3">Cash Flow Items</h3>
        {cashFlowItems.map((item, index) => (
          <div
            key={index}
            className="flex justify-between items-center p-2 bg-gray-100 rounded-md mb-2"
          >
            <span>
              {item.description}: {formatCurrency(item.amount)} ({item.type},{" "}
              Year: {item.year})
            </span>
            <button
              className="text-red-500 hover:text-red-700"
              onClick={() => removeCashFlowItem(index)}
            >
              Remove
            </button>
          </div>
        ))}

        {/* Add New Cash Flow */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <input
            type="text"
            className="border-2 p-2 rounded-md"
            placeholder="Description"
            value={newCashFlow.description}
            onChange={(e) =>
              setNewCashFlow({ ...newCashFlow, description: e.target.value })
            }
          />
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              ₹
            </span>
            <input
              type="number"
              className="ps-6 border-2 p-2 rounded-md w-full"
              placeholder="Amount"
              value={newCashFlow.amount}
              onChange={(e) =>
                setNewCashFlow({
                  ...newCashFlow,
                  amount: parseFloat(e.target.value),
                })
              }
            />
          </div>
          <select
            className="border-2 p-2 rounded-md"
            value={newCashFlow.type}
            onChange={(e) =>
              setNewCashFlow({ ...newCashFlow, type: e.target.value })
            }
          >
            <option value="inflow">Inflow</option>
            <option value="outflow">Outflow</option>
          </select>
          <input
            type="number"
            className="border-2 p-2 rounded-md"
            placeholder="Year"
            value={newCashFlow.year}
            onChange={(e) =>
              setNewCashFlow({
                ...newCashFlow,
                year: parseInt(e.target.value, 10),
              })
            }
          />
        </div>
        <button
          className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-500"
          onClick={addCashFlowItem}
        >
          Add Cash Flow Item
        </button>
      </div>

      {/* Investment Mix Section */}
      <div className="mb-5">
        <h3 className="text-lg font-semibold mb-3">Investment Mix</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="sip" className="block mb-2">
              SIP Percentage:
            </label>
            <input
              type="number"
              id="sip"
              className="border-2 p-2 rounded-md w-full"
              value={investmentMix.sip}
              onChange={(e) =>
                setInvestmentMix({
                  ...investmentMix,
                  sip: parseFloat(e.target.value),
                })
              }
            />
          </div>
          <div>
            <label htmlFor="lumpSum" className="block mb-2">
              Lump Sum Percentage:
            </label>
            <input
              type="number"
              id="lumpSum"
              className="border-2 p-2 rounded-md w-full"
              value={investmentMix.lumpSum}
              onChange={(e) =>
                setInvestmentMix({
                  ...investmentMix,
                  lumpSum: parseFloat(e.target.value),
                })
              }
            />
          </div>
        </div>
      </div>

      {/* Add ROI Section */}
      <div className="mb-5">
        <h3 className="text-lg font-semibold mb-3">Add ROI</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {variableROI.map((roi, index) => (
            <div key={index} className="p-2 bg-gray-100 rounded-md">
              ROI {index + 1}: {roi}%
            </div>
          ))}
          <input
            type="number"
            className="border-2 p-2 rounded-md"
            placeholder="Add ROI %"
            value={newROI}
            onChange={(e) => setNewROI(parseFloat(e.target.value))}
          />
        </div>
        <button
          className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-500"
          onClick={addVariableROI}
        >
          Add ROI
        </button>
      </div>

      {/* Calculate Button */}
      <button
        className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-500"
        onClick={calculateRequiredInvestments}
      >
        Calculate Required Investments
      </button>

      {/* Results Section */}
      {requiredInvestment && (
        <div className="mt-5 bg-gray-100 p-4 rounded-md">
          <h3 className="text-lg font-bold">Results</h3>
          <p className="text-blue-600">
            Required SIP:{" "}
            <span className="font-bold">
              {formatCurrency(requiredInvestment.sip)}
            </span>
          </p>
          <p className="text-blue-600">
            Required Lump Sum:{" "}
            <span className="font-bold">
              {formatCurrency(requiredInvestment.lumpSum)}
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default MutualFundCashFlowPlanningCalculator;