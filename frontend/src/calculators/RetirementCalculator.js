import React, { useState, useEffect } from "react";
import "./RetirementCalculator.css";

const RetirementCalculator = () => {
  const [currentAge, setCurrentAge] = useState("");
  const [retirementAge, setRetirementAge] = useState("");
  const [lifeExpectancy, setLifeExpectancy] = useState("");
  const [monthlyExpenses, setMonthlyExpenses] = useState("");
  const [annualInflation, setAnnualInflation] = useState("");
  const [accumulationPhaseReturn, setAccumulationPhaseReturn] = useState("");
  const [withdrawalPhaseReturn, setWithdrawalPhaseReturn] = useState("");
  const [existingInvestments, setExistingInvestments] = useState("");
  const [existingSIP, setExistingSIP] = useState("");
  const [postRetirementIncome, setPostRetirementIncome] = useState("");
  const [investmentMix, setInvestmentMix] = useState(50);
  const [publicLink, setPublicLink] = useState("");

  const generatePublicLink = () => {
    console.log("generatePublicLink function called");
    const formData = {
      currentAge,
      retirementAge,
      lifeExpectancy,
      monthlyExpenses,
      annualInflation,
      accumulationPhaseReturn,
      withdrawalPhaseReturn,
      existingInvestments,
      existingSIP,
      postRetirementIncome,
    };

    fetch("https://mniveshcalc.azurewebsites.net/api/Retirement", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.link) {
          setPublicLink(data.link);
          console.log(`Your public link is: ${data.link}`);
        } else {
          alert("Error generating link. Please try again.");
        }
      })
      .catch((error) => {
        console.error("Error generating public link:", error);
        alert(`Error generating link: ${error.message}`);
      });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value);
  };

  const [results, setResults] = useState({
    totalCorpusNeeded: null,
    totalSipRequired: null,
    monthlyPensionAmount: null,
    monthlyExpenseAtRetirement: null,
  });

  // useEffect(() => {
  //   if (
  //     !currentAge ||
  //     !retirementAge ||
  //     !monthlyExpenses ||
  //     !annualInflation ||
  //     !accumulationPhaseReturn ||
  //     !withdrawalPhaseReturn
  //   ) {
  //     calculateRetirementSavings();
  //   }
  // }, [investmentMix]);

  const yearsToRetirement =
    retirementAge && currentAge ? retirementAge - currentAge : 0;

  const calculateRetirementSavings = () => {
    if (
      !currentAge ||
      !retirementAge ||
      !monthlyExpenses ||
      !annualInflation ||
      !accumulationPhaseReturn ||
      !withdrawalPhaseReturn
    ) {
      alert("Please fill in all mandatory fields.");
    }

    const yearsToRetirement = Number(retirementAge) - Number(currentAge);
    const inflationRate = Number(annualInflation) / 100;
    const accumulationRate = Number(accumulationPhaseReturn) / 100;
    const withdrawalRate = Number(withdrawalPhaseReturn) / 100;
    const postRetirementIncomeAnnual = Number(postRetirementIncome) * 12;

    const monthlyExpenseAtRetirement =
      Number(monthlyExpenses) * Math.pow(1 + inflationRate, yearsToRetirement);

    // Set the monthly pension amount equal to the monthly expense at retirement
    let monthlyPensionAmount;
    let totalCorpusNeeded;

    monthlyPensionAmount =
      (monthlyExpenseAtRetirement * 12 - postRetirementIncomeAnnual) / 12;
    totalCorpusNeeded = (monthlyPensionAmount * 12) / withdrawalRate;

    // Calculate the total corpus needed to ensure the monthly pension equals the monthly expense at retirement
    const futureValueOfExistingInvestments =
      Number(existingInvestments) *
      Math.pow(1 + accumulationRate, yearsToRetirement);

    // Calculate the future value of existing SIPs
    const futureValueOfSIP =
      (Number(existingSIP) *
        (Math.pow(1 + accumulationRate / 12, yearsToRetirement * 12) - 1)) /
      (accumulationRate / 12);

    // Calculate the additional SIP or lump sum required
    const additionalFundsRequired =
      totalCorpusNeeded - futureValueOfExistingInvestments - futureValueOfSIP;

    const sipRequired =
      (additionalFundsRequired * investmentMix) / 100 > 0
        ? (additionalFundsRequired * investmentMix) /
        100 /
        ((Math.pow(1 + accumulationRate / 12, yearsToRetirement * 12) - 1) /
          (accumulationRate / 12))
        : 0;

    const lumpSumRequired =
      (additionalFundsRequired * (100 - investmentMix)) / 100 > 0
        ? (additionalFundsRequired * (100 - investmentMix)) /
        100 /
        Math.pow(1 + accumulationRate, yearsToRetirement)
        : 0;

    // // Calculate the lump sum required based on the investment mix
    // const lumpSumRequired = (additionalFundsRequired * investmentMix) / 100;

    // // Calculate the SIP required based on the investment mix
    // const sipRequired = (additionalFundsRequired * (100 - investmentMix)) / 100;

    console.log(`lumpSumRequired ${lumpSumRequired}`);
    setResults({
      totalCorpusNeeded,
      lumpSumRequired,
      sipRequired,
      monthlyPensionAmount,
      monthlyExpenseAtRetirement,
    });
  };

  const handleSliderChange = (e) => {
    setInvestmentMix(parseInt(e.target.value));
  };

  return (
    <div className="retirement-calculator">
      <div className=" flex flex-col">
        <h2>Retirement Savings Calculator</h2>'
        <div className="form-cal flex flex-wrap justify-between gap-7 ">
          <div >
            <label htmlFor="currentAge">Current Age:</label>
            <input
              type="number"
              placeholder="Current Age"
              value={currentAge}
              onChange={(e) => setCurrentAge(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="retirementAge">Retirement Age:</label>
            <input
              type="number"
              placeholder="Retirement Age"
              value={retirementAge}
              onChange={(e) => setRetirementAge(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="lifeExpectancy">Life Expectancy:</label>
            <input
              type="number"
              placeholder="Life Expectancy"
              value={lifeExpectancy}
              onChange={(e) => setLifeExpectancy(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="monthlyExpenses">Monthly Expenses:</label>
            <input
              type="number"
              placeholder="Monthly Expenses"
              value={monthlyExpenses}
              onChange={(e) => setMonthlyExpenses(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="annualInflation">Annual Inflation (%):</label>
            <input
              type="number"
              placeholder="Annual Inflation (%)"
              value={annualInflation}
              onChange={(e) => setAnnualInflation(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="accumulationPhaseReturn">
              Accumulation Phase Return (%):
            </label>
            <input
              type="number"
              placeholder="Accumulation Phase Return (%)"
              value={accumulationPhaseReturn}
              onChange={(e) => setAccumulationPhaseReturn(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="withdrawalPhaseReturn">
              Withdrawal Phase Return (%):
            </label>
            <input
              type="number"
              placeholder="Withdrawal Phase Return (%)"
              value={withdrawalPhaseReturn}
              onChange={(e) => setWithdrawalPhaseReturn(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="existingInvestments">Existing Investments:</label>
            <input
              type="number"
              placeholder="Existing Investments"
              value={existingInvestments}
              onChange={(e) => setExistingInvestments(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="existingSIP">Existing SIP:</label>
            <input
              type="number"
              placeholder="Existing SIP"
              value={existingSIP}
              onChange={(e) => setExistingSIP(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="postRetirementIncome">Post-Retirement Income:</label>
            <input
              type="number"
              placeholder="Post-Retirement Income"
              value={postRetirementIncome}
              onChange={(e) => setPostRetirementIncome(e.target.value)}
            />
          </div>
        </div>
        <div className=" flex justify-start">
          <button onClick={calculateRetirementSavings}>Calculate</button>

        </div>
      </div>
      {results.totalCorpusNeeded !== null && (
        <ul className="info grid grid-cols-3 justify-center  gap-2 mt-5">
          <li><p>Years to Retirement</p><span>{yearsToRetirement}</span> </li>
          <li>
            <p>Total Corpus Needed</p> <span>{formatCurrency(results.totalCorpusNeeded)}</span>
          </li>
          <li> <p>Total SIP Required</p> <span>{formatCurrency(results.sipRequired)}</span></li>
          <li>
            <p>Total Lumpsum Required</p> <span>{formatCurrency(results.lumpSumRequired)}</span>
          </li>
          <li>
           <p> Monthly Pension Amount{" "}</p>
            <span>{formatCurrency(results.monthlyPensionAmount)}</span>
          </li>
          <li>
           <p>Monthly Expense at Retirement{" "}</p> 
            <span>{formatCurrency(results.monthlyExpenseAtRetirement)}</span>
          </li>
          <li className=" col-span-3  flex justify-center  items-center gap-2">
            <input
            style={{marginBottom: 0}}
            className="mb-0 m-0 outline-none border-0"
              type="range"
              min="0"
              max="100"
              value={investmentMix}
              onChange={handleSliderChange}
            />
            <label className=" ">
              Investment Mix: {investmentMix}% SIP, {100 - investmentMix}% Lump
              Sum
            </label>
            {/* <button type="button" onClick={generatePublicLink}>
              Generate Public Link
            </button> */}
          </li>
          {publicLink && (
            <div>
              <p>Your public link is:</p>
              <a href={publicLink} target="_blank" rel="noopener noreferrer">
                {publicLink}
              </a>
            </div>
          )}
        </ul>
        )} 
    </div> // This closes the main container div
  );
};

export default RetirementCalculator;
