// In MutualFundPerformanceAttributionCalculator.js
import React, { useState } from "react";
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
    <div className="mutual-fund-performance-attribution-calculator">
      <h2>Mutual Fund Performance Attribution Calculator</h2>
      <div>
        <label htmlFor="totalReturn">Total Return (%):</label>
        <input
          type="number"
          placeholder="Total Return"
          value={totalReturn}
          onChange={(e) => setTotalReturn(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="marketTiming">Market Timing (%):</label>
        <input
          type="number"
          placeholder="Market Timing"
          value={marketTiming}
          onChange={(e) => setMarketTiming(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="stockSelection">Stock Selection (%):</label>
        <input
          type="number"
          placeholder="Stock Selection"
          value={stockSelection}
          onChange={(e) => setStockSelection(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="sectorAllocation">Sector Allocation (%):</label>
        <input
          type="number"
          placeholder="Sector Allocation"
          value={sectorAllocation}
          onChange={(e) => setSectorAllocation(e.target.value)}
        />
      </div>

      <button onClick={calculatePerformanceAttribution}>
        Calculate Attribution
      </button>

      {performanceAttribution && (
        <div>
          <h3>Attributed Performance</h3>
          <p>
            Total Attributed:{" "}
            {performanceAttribution.totalCalculated.toFixed(2)}%
          </p>
          <p>
            Unexplained Performance:{" "}
            {performanceAttribution.unexplained.toFixed(2)}%
          </p>
        </div>
      )}
    </div>
  );
};

export default MutualFundPerformanceAttributionCalculator;
