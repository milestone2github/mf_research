import React, { useState, useEffect } from "react";
import "./RetirementCalculator.css";
import TwoThumbRangeSlider from "../common/TwoThumbRangeSlider";
import RangeSlider from "../common/RangeSlider";
import BackButton from "../common/BackButton";

const RetirementCalculator = () => {
  const [currentAge, setCurrentAge] = useState(22);
  const [retirementAge, setRetirementAge] = useState(60);
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

  useEffect(() => {
    if (
      currentAge &&
      retirementAge &&
      monthlyExpenses &&
      annualInflation &&
      accumulationPhaseReturn &&
      withdrawalPhaseReturn
    ) {
      calculateRetirementSavings();
    }
  }, [investmentMix]);

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

  const handleCurrentAge = (e) => {
    let value = e.target.value;
    if (!isNaN(Number(value))) {
      setCurrentAge(value)
    }
  }

  const handleRetirementAge = (e) => {
    let value = e.target.value;
    if (!isNaN(Number(value))) {
      setRetirementAge(value)
    }
  }

  const handleLifeExpectancy = (e) => {
    let value = e.target.value;
    if (!isNaN(Number(value))) {
      setLifeExpectancy(value)
    }
  }

  const handleMonthlyExpences = (e) => {
    let value = Number(e.target.value);
    if (!isNaN(value) && value <= 300000) {
      setMonthlyExpenses(value)
    }
  }

  const handleAnnualInflation = (e) => {
    let value = Number(e.target.value);
    if (!isNaN(value) && value <= 100) {
      setAnnualInflation(value)
    }
  }

  const handleAccumulationPhaseReturn = (e) => {
    let value = Number(e.target.value);
    if (!isNaN(value) && value <= 100) {
      setAccumulationPhaseReturn(value)
    }
  }

  const hanldeWidthdrawalPhaseReturn = (e) => {
    let value = Number(e.target.value);
    if (!isNaN(value) && value <= 100) {
      setWithdrawalPhaseReturn(value)
    }
  }

  const handleExistingInvestments = (e) => {
    let value = Number(e.target.value);
    if (!isNaN(value)) {
      setExistingInvestments(value)
    }
  }

  const handleExistingSip = (e) => {
    let value = Number(e.target.value);
    if (!isNaN(value)) {
      setExistingSIP(value)
    }
  }

  const handlePostRetirementIncome = (e) => {
    let value = Number(e.target.value);
    if (!isNaN(value)) {
      setPostRetirementIncome(value)
    }
  }

  return (
    <div className="retirement-calculator px-3">
      <div className="relative flex">
        <span className="absolute left-0 top-1/2 -translate-y-1/2">
        <BackButton action={() => {window.history.back()}}/>
        </span>

        <div className="flex flex-col w-fit mx-auto">
          <h2 className="text-2xl text-dark-blue md:text-3xl font-bold mx-auto my-1">Retirement Savings Calculator</h2>
          <span className="w-full bg-yellow-600 h-2 text-start"></span>

        </div>
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-7 mt-6">
          <div className="border rounded-lg bg-slate-100 flex flex-wrap gap-x-4 gap-y-7 w-full p-4 px-6">
            <div className="grow">
              <label htmlFor="currentAge" className=" text-gray-600">Current Age</label>
              <div className="mt-1 bg-primary-white border-2 border-gray-300 rounded-lg relative focus-within:border-2 focus-within:border-blue-500">
                <input
                  className="px-3 py-2 text-gray-600 font-bold bg-transparent w-full pe-4 outline-none focus:outline-none"
                  type="text"
                  id="currentAge"
                  placeholder="0"
                  pattern="[0-9]"
                  min={1}
                  maxLength={2}
                  value={currentAge}
                  onChange={handleCurrentAge}
                />
                <span className="text-gray-400 text-sm absolute right-3 top-1/2 -translate-y-1/2">
                  years
                </span>

              </div>
            </div>

            <div className="grow">
              <label htmlFor="retirementAge" className="text-gray-600">Retirement Age</label>
              <div className="mt-1 bg-primary-white border-2 border-gray-300 rounded-lg relative focus-within:border-2 focus-within:border-blue-500">
                <input
                  className="px-3 text-gray-600 font-bold py-2 bg-transparent w-full pe-4 outline-none focus:outline-none"
                  type="text"
                  id="retirementAge"
                  placeholder="0"
                  pattern="[0-9]"
                  min={1}
                  maxLength={2}
                  value={retirementAge}
                  onChange={handleRetirementAge}
                />
                <span className="text-gray-400 text-sm absolute right-3 top-1/2 -translate-y-1/2">
                  years
                </span>

              </div>
            </div>
            <div className="w-full m-0 p-0">
              <TwoThumbRangeSlider
                min={0}
                max={100}
                selectedMin={currentAge}
                selectedMax={retirementAge}
                updateMin={(value) => { setCurrentAge(value) }}
                updateMax={(value) => { setRetirementAge(value) }} />
            </div>

          </div>

          <div className="border grow shrink basis-72 md:basis-[40%] w-full md:w-1/2 rounded-lg bg-slate-100 p-4 px-6">
            <label htmlFor="lifeExpectancy" className="text-gray-600">Life Expectancy</label>
            <div className="mt-1 bg-primary-white border-2 border-gray-300 rounded-lg relative focus-within:border-2 focus-within:border-blue-500">
              <input
                className="px-3 py-2 w-full text-gray-600 font-bold bg-transparent pe-4 outline-none focus:outline-none"
                type="text"
                id="lifeExpectancy"
                placeholder="0"
                pattern="[0-9]"
                min={1}
                maxLength={2}
                value={lifeExpectancy}
                onChange={handleLifeExpectancy}
              />
              <span className="text-gray-400 text-sm absolute right-3 top-1/2 -translate-y-1/2">
                years
              </span>
            </div>

            <div className="mt-4">
              <RangeSlider min={0} max={120} updateValue={(value) => setLifeExpectancy(value)} />
            </div>
          </div>

          <div className="border grow shrink basis-72 md:basis-[40%] w-full md:w-1/2 rounded-lg bg-slate-100 p-4 px-6">
            <label htmlFor="monthlyExpences" className="text-gray-600">Monthly Expenses</label>
            <div className="mt-1 bg-primary-white border-2 border-gray-300 rounded-lg relative focus-within:border-2 focus-within:border-blue-500">
              <span className="text-gray-400 text-sm absolute left-3 top-1/2 -translate-y-1/2">
                ₹
              </span>
              <input
                className="px-3 py-2 text-gray-600 font-bold w-full bg-transparent ps-6 outline-none focus:outline-none"
                type="text"
                id="monthlyExpences"
                placeholder="0"
                pattern="[0-9]"
                min={0}
                maxLength={6}
                value={monthlyExpenses}
                onChange={handleMonthlyExpences}
              />
            </div>
            <div className="mt-4">
              <RangeSlider min={0} max={300000} step={1000} updateValue={(value) => setMonthlyExpenses(value)} />
            </div>
          </div>

          <div className="border grow shrink basis-72 rounded-lg bg-slate-100 p-4 px-6">
            <label htmlFor="annualInflation" className="text-gray-600">Annual Inflation</label>
            <div className="mt-1 border-2 bg-primary-white border-gray-300 rounded-lg relative focus-within:border-2 focus-within:border-blue-500">
              <input
                className="ps-3 py-2 w-full text-gray-600 font-bold bg-transparent pe-4 outline-none focus:outline-none"
                type="text"
                id="annualInflation"
                placeholder="0"
                pattern="[0-9]"
                min={0}
                maxLength={3}
                value={annualInflation}
                onChange={handleAnnualInflation}
              />
              <span className="text-gray-400 font-bold bg-slate-100 text-center h-full w-12 border-s-2 border-s-gray-300 flex items-center justify-center text-sm rounded-e-md absolute right-0 top-1/2 -translate-y-1/2">
                %
              </span>
            </div>
          </div>

          <div className="border grow shrink basis-72 rounded-lg bg-slate-100 p-4 px-6">
            <label htmlFor="accumulationPhaseReturn" className="text-gray-600">Accumulation Phase Return</label>
            <div className="mt-1 bg-primary-white border-2 border-gray-300 rounded-lg relative focus-within:border-2 focus-within:border-blue-500">
              <input
                className="px-3 py-2 w-full text-gray-600 font-bold bg-transparent pe-4 outline-none focus:outline-none"
                type="text"
                id="accumulationPhaseReturn"
                placeholder="0"
                pattern="[0-9]"
                min={0}
                maxLength={3}
                value={accumulationPhaseReturn}
                onChange={handleAccumulationPhaseReturn}
              />
              <span className="text-gray-400 font-bold bg-slate-100 text-center h-full w-12 border-s-2 border-s-gray-300 flex items-center justify-center text-sm rounded-e-md absolute right-0 top-1/2 -translate-y-1/2">
                %
              </span>
            </div>
          </div>

          <div className="border grow shrink basis-72 rounded-lg bg-slate-100 p-4 px-6">
            <label htmlFor="withdrawalPhaseReturn" className="text-gray-600">
              Withdrawal Phase Return
            </label>

            <div className="mt-1 bg-primary-white border-2 border-gray-300 rounded-lg relative focus-within:border-2 focus-within:border-blue-500">
              <input
                className="ps-3 py-2 w-full text-gray-600 font-bold bg-transparent pe-4 outline-none focus:outline-none"
                type="text"
                id="withdrawalPhaseReturn"
                placeholder="0"
                pattern="[0-9]"
                min={0}
                maxLength={3}
                value={withdrawalPhaseReturn}
                onChange={hanldeWidthdrawalPhaseReturn}
              />
              <span className="text-gray-400 font-bold bg-slate-100 text-center h-full w-12 border-s-2 border-s-gray-300 flex items-center justify-center text-sm rounded-e-md absolute right-0 top-1/2 -translate-y-1/2">
                %
              </span>
            </div>
          </div>

          <div className="border grow shrink basis-72 rounded-lg bg-slate-100 p-4 px-6">
            <label htmlFor="existingInvestments" className="text-gray-600">Existing Investments</label>
            <div className="mt-1 bg-primary-white border-2 border-gray-300 rounded-lg relative focus-within:border-2 focus-within:border-blue-500">
              <span className="text-gray-400 bg-slate-100 border-e-2 border-e-gray-300 h-full w-12 font-bold rounded-s-md text-sm absolute flex items-center justify-center left-0 top-1/2 -translate-y-1/2">
                ₹
              </span>
              <input
                className="ps-14 pe-3 py-2 w-full text-gray-600 font-bold bg-transparent outline-none focus:outline-none"
                type="text"
                id="existingInvestments"
                placeholder="0"
                pattern="[0-9]"
                min={0}
                maxLength={7}
                value={existingInvestments}
                onChange={handleExistingInvestments}
              />
            </div>
          </div>

          <div className="border grow shrink basis-72 rounded-lg bg-slate-100 p-4 px-6">
            <label htmlFor="existingSIP" className="text-gray-600">Existing SIP</label>
            <div className="mt-1 bg-primary-white border-2 border-gray-300 rounded-lg relative focus-within:border-2 focus-within:border-blue-500">
              <span className="text-gray-400 bg-slate-100 border-e-2 border-e-gray-300 h-full w-12 font-bold rounded-s-md text-sm absolute flex items-center justify-center left-0 top-1/2 -translate-y-1/2">
                ₹
              </span>
              <input
                className="ps-14 pe-3 py-2 w-full text-gray-600 font-bold bg-transparent outline-none focus:outline-none"
                type="text"
                id="existingSIP"
                placeholder="0"
                pattern="[0-9]"
                min={0}
                maxLength={7}
                value={existingSIP}
                onChange={handleExistingSip}
              />
            </div>
          </div>

          <div className="border grow shrink basis-72 rounded-lg bg-slate-100 p-4 px-6">
            <label htmlFor="postRetirementIncome" className="text-gray-600">Post-Retirement Income</label>
            <div className="mt-1 bg-primary-white border-2 border-gray-300 rounded-lg relative focus-within:border-2 focus-within:border-blue-500">
              <span className="text-gray-400 bg-slate-100 border-e-2 border-e-gray-300 h-full w-12 font-bold rounded-s-md text-sm absolute flex items-center justify-center left-0 top-1/2 -translate-y-1/2">
                ₹
              </span>
              <input
                className="ps-14 pe-3 py-2 text-gray-600 font-bold w-full bg-transparent outline-none focus:outline-none"
                type="text"
                id="postRetirementIncome"
                placeholder="0"
                pattern="[0-9]"
                min={0}
                maxLength={7}
                value={postRetirementIncome}
                onChange={handlePostRetirementIncome}
              />
            </div>
          </div>
        </div>
        <div className="flex justify-start my-2 mt-6">
          <button
            onClick={calculateRetirementSavings}
            className="bg-yellow-600 rounded-md px-16 py-3 text-slate-100 hover:bg-[#b57b00]"
          >Calculate</button>

        </div>
      
      {results.totalCorpusNeeded !== null && (
        <ul className="info grid grid-cols-3 justify-center  gap-2 mt-5">
          <li><p>Years to Retirement</p><span className="values">{yearsToRetirement}</span> </li>
          <li>
            <p>Total Corpus Needed</p> <span className="values">{formatCurrency(results.totalCorpusNeeded)}</span>
          </li>
          <li> <p>Total SIP Required</p> <span className="values">{formatCurrency(results.sipRequired)}</span></li>
          <li>
            <p>Total Lumpsum Required</p> <span className="values">{formatCurrency(results.lumpSumRequired)}</span>
          </li>
          <li>
            <p> Monthly Pension Amount{" "}</p>
            <span className="values">{formatCurrency(results.monthlyPensionAmount)}</span>
          </li>
          <li>
            <p>Monthly Expense at Retirement{" "}</p>
            <span className="values">{formatCurrency(results.monthlyExpenseAtRetirement)}</span>
          </li>
          <li className=" col-span-3 flex justify-center items-center gap-2 border">
            <div className="flex justify-around w-full">
              <div className="flex flex-col">
                <span className="text-3xl font-bold">{investmentMix}
                  <span className="text-sm"> %</span>
                </span>

                <span className="text-sm text-center text-yellow-600">SIP</span>
              </div>

              <div className="flex flex-col">
                <span className="text-3xl font-bold">{100 - investmentMix}
                  <span className="text-sm"> %</span>
                </span>

                <span className="text-sm text-center text-yellow-600">Lumpsum</span>
              </div>
            </div>
            <div className="w-full px-6 relative">
              <RangeSlider 
                min={0} 
                max={100} 
                selectedValue={investmentMix} 
                updateValue={(value) => setInvestmentMix(value)} 
              />

              <label className="absolute text-[#dadada] text-sm bottom-0 left-1/2 -translate-x-1/2">
                Investment Mix
              </label>
            </div>
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
