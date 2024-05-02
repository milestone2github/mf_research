import React, { useState } from "react";
import "./MutualFundCashFlowPlanningCalculator.css";

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
      alert("Please enter description and amount for the cash flow item.");
      return;
    }
    setCashFlowItems([...cashFlowItems, newCashFlow]);
    setNewCashFlow({ description: "", amount: 0, type: "inflow", year: 0 }); // Reset form
  };

  const removeCashFlowItem = (index) => {
    const newItems = [...cashFlowItems];
    newItems.splice(index, 1);
    setCashFlowItems(newItems);
  };

  const addVariableROI = () => {
    setVariableROI([...variableROI, newROI]);
    setNewROI(0); // Reset ROI input
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

    // Assuming an annual discount rate for simplification
    let annualDiscountRate =
      variableROI.length > 0
        ? variableROI.reduce((a, b) => a + b, 0) / variableROI.length / 100
        : 0.05; // Average ROI if provided, else default to 5%

    // Calculate the present value of future cash flows
    let presentValue = cashFlowItems.reduce((total, item) => {
      let pvFactor = Math.pow(1 + annualDiscountRate, item.year || 0);
      return (
        total + (item.type === "outflow" ? 1 : -1) * item.amount * pvFactor
      );
    }, 0);

    // Total required amount should cover the negative present value if it's negative
    let totalRequired = presentValue < 0 ? -presentValue : 0;

    // Calculate the required SIP and lump sum based on the investment mix
    let requiredSIP = totalRequired * (investmentMix.sip / 100);
    let requiredLumpSum = totalRequired * (investmentMix.lumpSum / 100);

    setRequiredInvestment({
      sip: requiredSIP,
      lumpSum: requiredLumpSum,
    });
  };

  return (
    <div className="mutual-fund-cash-flow-planning-calculator">
      <h2>Mutual Fund Cash Flow Planning Calculator</h2>

      <div>
        {cashFlowItems.map((item, index) => (
          <div key={index}>
            <span>
              {item.description}: ${item.amount} ({item.type}, Year: {item.year}
              )
            </span>
            <button onClick={() => removeCashFlowItem(index)}>Remove</button>
          </div>
        ))}
        <input
          type="text"
          placeholder="Description"
          value={newCashFlow.description}
          onChange={(e) =>
            setNewCashFlow({ ...newCashFlow, description: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Amount"
          value={newCashFlow.amount}
          onChange={(e) =>
            setNewCashFlow({
              ...newCashFlow,
              amount: parseFloat(e.target.value),
            })
          }
        />
        <select
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
          placeholder="Year"
          value={newCashFlow.year}
          onChange={(e) =>
            setNewCashFlow({
              ...newCashFlow,
              year: parseInt(e.target.value, 10),
            })
          }
        />
        <button onClick={addCashFlowItem}>Add Cash Flow Item</button>
      </div>

      <div>
        <label htmlFor="sip">SIP Percentage:</label>
        <input
          type="number"
          id="sip"
          value={investmentMix.sip}
          onChange={(e) =>
            setInvestmentMix({
              ...investmentMix,
              sip: parseFloat(e.target.value),
            })
          }
        />
        <label htmlFor="lumpSum">Lump Sum Percentage:</label>
        <input
          type="number"
          id="lumpSum"
          value={investmentMix.lumpSum}
          onChange={(e) =>
            setInvestmentMix({
              ...investmentMix,
              lumpSum: parseFloat(e.target.value),
            })
          }
        />
      </div>

      <div>
        {variableROI.map((roi, index) => (
          <div key={index}>
            ROI {index + 1}: {roi}%
          </div>
        ))}
        <input
          type="number"
          placeholder="Add ROI %"
          value={newROI}
          onChange={(e) => setNewROI(parseFloat(e.target.value))}
        />
        <button onClick={addVariableROI}>Add ROI</button>
      </div>

      <button onClick={calculateRequiredInvestments}>
        Calculate Required Investments
      </button>

      {requiredInvestment && (
        <div>
          <h3>Required SIP: ${requiredInvestment.sip.toFixed(2)}</h3>
          <h3>Required Lump Sum: ${requiredInvestment.lumpSum.toFixed(2)}</h3>
        </div>
      )}
    </div>
  );
};

export default MutualFundCashFlowPlanningCalculator;
