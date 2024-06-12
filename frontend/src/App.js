import React, { useState } from "react";
import {
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import PortfolioReport from "./components/pages/PortfolioReport";
import ExistingPortfolio from "./components/pages/ExistingPortfolio";
import CasImport from "./components/pages/CasImport";
import ModelPortfolio from "./components/pages/ModelPortfolio";
import Calculators from "./components/pages/Calculators";
import MFTransRequest from "./components/pages/MFTransRequest";
import Home from "./components/pages/Home";
import "./App.css";
import RetirementCalculator from "./components/calculators/RetirementCalculator";
import TargetDateFundCalculator from "./components/calculators/TargetDateFundCalculator";
import MutualFundPortfolioOverlapCalculator from "./components/calculators/MutualFundPortfolioOverlapCalculator";
import MutualFundToETFComparisonCalculator from "./components/calculators/MutualFundToETFComparisonCalculator";
import AssetAllocationTool from "./components/calculators/AssetAllocationTool";
import MutualFundCashFlowPlanningCalculator from "./components/calculators/MutualFundCashFlowPlanningCalculator";
import GoalBasedInvestmentCalculator from "./components/calculators/GoalBasedInvestmentCalculator";
import MutualFundComparisonTool from "./components/calculators/MutualFundComparisonTool";
import EducationPlanningCalculator from "./components/calculators/EducationPlanningCalculator";
import MutualFundWithdrawalPlanCalculator from "./components/calculators/MutualFundWithdrawalPlanCalculator";
import RiskAnalyzer from "./components/calculators/RiskAnalyzer";
import MutualFundPerformanceAttributionCalculator from "./components/calculators/MutualFundPerformanceAttributionCalculator";
import SIPCalculator from "./components/calculators/SIPCalculator";
import LumpsumCalculator from "./components/calculators/LumpsumCalculator";
import AssociatePayout from "./components/pages/associatePayout";
import AssociatePayoutAccounts from "./components/pages/associatePayout-accounts";
import DirClientPayouts from "./components/pages/DirClientPayout";
import DirectClientPayouts from "./components/pages/DirClientPayout-accounts";
import Loginpage from "./components/pages/Loginpage";
import Sidebar from "./components/common/Sidebar";
import Header from "./components/common/Header";
import CalculatorList from "./components/calculators/CalculatorList";
import MfTransForm from "./components/pages/MfTransForm";
import Protected from "./components/common/Protected";
import NfoForm from "./components/pages/NfoForm";

function App() {
  const [loading, setLoading] = useState(false)// test

  if (loading) {
    return <h1>Loading...</h1>
  }

    return (
      <>
        <div className="App">
          <Header />
          <div className="app-body">
            <Sidebar />
            <main className="app-content">
              <Routes>
                <Route path="/" element={<Protected><Home /></Protected>} />
                <Route path="/portfolio-analysis" element={<Protected><PortfolioReport /></Protected>} />
                <Route
                  path="/existing-portfolio"
                  element={<Protected><ExistingPortfolio /></Protected>}
                />
                <Route path="/import-cas" element={<Protected><CasImport /></Protected>} />
                <Route path="/model-portfolio" element={<Protected><ModelPortfolio /></Protected>} />
                <Route path="/mf-trans-request" element={<Protected><MFTransRequest /></Protected>} />
                <Route path="/associate-payout" element={<Protected><AssociatePayout /></Protected>} />
                <Route path="/associate-payout-accounts" element={<Protected><AssociatePayoutAccounts /></Protected>} />
                <Route path="/dir-client-payout" element={<Protected><DirClientPayouts /></Protected>} />
                <Route path="/dir-client-payout-accounts" element={<Protected><DirectClientPayouts /></Protected>} />
                <Route path="/mf-trans-form" element={<Protected><MfTransForm /></Protected>} />
                <Route path="/nfo-form" element={<Protected><NfoForm /></Protected>} />
                <Route path="/login" element={<Loginpage />} />

                <Route path="/calculator" element={<Protected><Calculators /></Protected>} >
                  <Route
                    path=""
                    element={<CalculatorList />}
                  />
                  <Route
                    path="retirement-calculator"
                    element={<RetirementCalculator />}
                  />
                  {/* <Route
                    path="target-date-calculator"
                    element={<TargetDateFundCalculator />}
                  />
                  <Route
                    path="mf-overlap-tool"
                    element={<MutualFundPortfolioOverlapCalculator />}
                  />
                  <Route
                    path="mf-vs-etf-calculator"
                    element={<MutualFundToETFComparisonCalculator />}
                  />
                  <Route
                    path="asset-allocation-tool"
                    element={<AssetAllocationTool />}
                  />
                  <Route
                    path="cash-flow-calculator"
                    element={<MutualFundCashFlowPlanningCalculator />}
                  />
                  <Route
                    path="goal-based-investment-calculator"
                    element={<GoalBasedInvestmentCalculator />}
                  />
                  <Route
                    path="mf-comparison"
                    element={<MutualFundComparisonTool />}
                  />
                  <Route
                    path="education-planning-calculator"
                    element={<EducationPlanningCalculator />}
                  />
                  <Route
                    path="SWP-calculator"
                    element={<MutualFundWithdrawalPlanCalculator />}
                  />
                  <Route path="risk-analyzer" element={<RiskAnalyzer />} />
                  <Route
                    path="mf-performance-source-calculator"
                    element={<MutualFundPerformanceAttributionCalculator />}
                  />
                  <Route path="sip-calculator" element={<SIPCalculator />} />
                  <Route
                    path="lumpsum-calculator"
                    element={<LumpsumCalculator />}
                  /> */}
                </Route>
              </Routes>
            </main>
          </div>
        </div>
      </>
    );
}

export default App;
