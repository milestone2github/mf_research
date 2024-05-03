import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  useNavigate,
} from "react-router-dom";
import mNiveshLogo from "./img/mNiveshLogo.png";
import PortfolioReport from "./PortfolioReport";
import ExistingPortfolio from "./ExistingPortfolio";
import CasImport from "./CasImport";
import ModelPortfolio from "./ModelPortfolio";
import Calculator from "./Calculator";
import MFTransRequest from "./MFTransRequest";
import Home from "./Home";
import "./App.css";
import RetirementCalculator from "./calculators/RetirementCalculator";
import TargetDateFundCalculator from "./calculators/TargetDateFundCalculator";
import MutualFundPortfolioOverlapCalculator from "./calculators/MutualFundPortfolioOverlapCalculator";
import MutualFundToETFComparisonCalculator from "./calculators/MutualFundToETFComparisonCalculator";
import AssetAllocationTool from "./calculators/AssetAllocationTool";
import MutualFundCashFlowPlanningCalculator from "./calculators/MutualFundCashFlowPlanningCalculator";
import GoalBasedInvestmentCalculator from "./calculators/GoalBasedInvestmentCalculator";
import MutualFundComparisonTool from "./calculators/MutualFundComparisonTool";
import EducationPlanningCalculator from "./calculators/EducationPlanningCalculator";
import MutualFundWithdrawalPlanCalculator from "./calculators/MutualFundWithdrawalPlanCalculator";
import RiskAnalyzer from "./calculators/RiskAnalyzer";
import MutualFundPerformanceAttributionCalculator from "./calculators/MutualFundPerformanceAttributionCalculator";
import SIPCalculator from "./calculators/SIPCalculator";
import LumpsumCalculator from "./calculators/LumpsumCalculator";
import AssociatePayout from "./associatePayout";
import AssociatePayoutAccounts from "./associatePayout-accounts";
import DirClientPayouts from "./DirClientPayout";
import DirectClientPayouts from "./DirClientPayout-accounts";
import Loginpage from "./Loginpage";
import axios from 'axios';
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import Header from "./Header";

function App() {
  const dispatch = useDispatch()
  const { userstate } = useSelector((state) => state.user)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const checkuserlogin = async () => {
    try {
      setLoading(true)
      const data = await fetch(`http://localhost:5000/api/user/checkLoggedIn`, {
        method: "GET",
        credentials: 'include',
      });
      const res = await data.json()
      console.log(res);
      if (res.loggedIn) {
        console.log(res.user);
        setLoading(false)
        dispatch({
          type: "checkuserloggedin",
          payload: res.user.name
        })
      }
      else {
        setLoading(false)
        dispatch({
          type: "checkuserloggedin",
          payload: null
        })
        navigate('/login' , {replace:true})
      }
    } catch (error) {
      setLoading(false)
      console.error("Error occured while checking user Logged in or not ", error)
    }

  }

  useEffect(() => {
    checkuserlogin()
  }, [])

  if (loading) {
    return <h1>Loading...</h1>
  }
  if (userstate) {
    return (
      <>
        <div className="App">
          <Header />
          <div className="app-body">
            <Sidebar />
            <main className="app-content">
              <Routes>
                <Route path="/" element={<Home />} end />
                <Route path="/portfolio-analysis" element={<PortfolioReport />} />
                <Route
                  path="/existing-portfolio"
                  element={<ExistingPortfolio />}
                />
                <Route path="/import-cas" element={<CasImport />} />
                <Route path="/model-portfolio" element={<ModelPortfolio />} />
                <Route path="/calculator" element={<Calculator />} />
                <Route path="/mf-trans-request" element={<MFTransRequest />} />
                <Route path="/associate-payout" element={<AssociatePayout />} />
                <Route path="/associate-payout-accounts" element={<AssociatePayoutAccounts />} />
                <Route path="/dir-client-payout" element={<DirClientPayouts />} />
                <Route path="/dir-clientPayout-accounts" element={<DirectClientPayouts />} />
                <Route path="/login" element={<Loginpage />} />

                <Route
                  path="/retirement-calculator"
                  element={<RetirementCalculator />}
                />
                <Route
                  path="/retirement-calculator"
                  element={<RetirementCalculator />}
                />
                <Route
                  path="/target-date-calculator"
                  element={<TargetDateFundCalculator />}
                />
                <Route
                  path="/mf-overlap-tool"
                  element={<MutualFundPortfolioOverlapCalculator />}
                />
                <Route
                  path="/mf-vs-etf-calculator"
                  element={<MutualFundToETFComparisonCalculator />}
                />
                <Route
                  path="/asset-allocation-tool"
                  element={<AssetAllocationTool />}
                />
                <Route
                  path="/cash-flow-calculator"
                  element={<MutualFundCashFlowPlanningCalculator />}
                />
                <Route
                  path="/goal-based-investment-calculator"
                  element={<GoalBasedInvestmentCalculator />}
                />
                <Route
                  path="/mf-comparison"
                  element={<MutualFundComparisonTool />}
                />
                <Route
                  path="/education-planning-calculator"
                  element={<EducationPlanningCalculator />}
                />
                <Route
                  path="/SWP-calculator"
                  element={<MutualFundWithdrawalPlanCalculator />}
                />
                <Route path="/risk-analyzer" element={<RiskAnalyzer />} />
                <Route
                  path="/mf-performance-source-calculator"
                  element={<MutualFundPerformanceAttributionCalculator />}
                />
                <Route path="/sip-calculator" element={<SIPCalculator />} />
                <Route
                  path="/lumpsum-calculator"
                  element={<LumpsumCalculator />}
                />
              </Routes>
            </main>
          </div>
        </div>
      </>
    );
  }
  else {
    return (
      <Loginpage />

    )
  }
}

export default App;
