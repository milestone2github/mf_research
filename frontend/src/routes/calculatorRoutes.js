import AssetAllocationAdvisorTool from '../components/calculators/AssetAllocationTool'
import CalculatorList from '../components/calculators/CalculatorList'
import EducationPlanningCalculator from '../components/calculators/EducationPlanningCalculator'
import GoalBasedInvestmentCalculator from '../components/calculators/GoalBasedInvestmentCalculator'
import LumpsumCalculator from '../components/calculators/LumpsumCalculator'
import MutualFundCashFlowPlanningCalculator from '../components/calculators/MutualFundCashFlowPlanningCalculator'
import MutualFundComparisonTool from '../components/calculators/MutualFundComparisonTool'
import MutualFundPerformanceAttributionCalculator from '../components/calculators/MutualFundPerformanceAttributionCalculator'
import MutualFundPortfolioOverlapCalculator from '../components/calculators/MutualFundPortfolioOverlapCalculator'
import MutualFundToETFComparisonCalculator from '../components/calculators/MutualFundToETFComparisonCalculator'
import MutualFundWithdrawalPlanCalculator from '../components/calculators/MutualFundWithdrawalPlanCalculator'
import RetirementCalculator from '../components/calculators/RetirementCalculator'
import RiskAnalyzer from '../components/calculators/RiskAnalyzer'
import SIPCalculator from '../components/calculators/SIPCalculator'
import TargetDateFundCalculator from '../components/calculators/TargetDateFundCalculator'

export const calculatorRoutes = [
  { to: '', element: <CalculatorList /> },
  { to: 'retirement-calculator', element: <RetirementCalculator /> },
  { to: 'target-date-calculator', element: <TargetDateFundCalculator /> },
  { to: 'mf-overlap-tool', element: <MutualFundPortfolioOverlapCalculator /> },
  { to: 'mf-vs-etf-calculator', element: <MutualFundToETFComparisonCalculator /> },
  { to: 'asset-allocation-tool', element: <AssetAllocationAdvisorTool /> },
  { to: 'cash-flow-calculator', element: <MutualFundCashFlowPlanningCalculator /> },
  { to: 'goal-based-investment-calculator', element: <GoalBasedInvestmentCalculator /> },
  { to: 'mf-comparison', element: <MutualFundComparisonTool /> },
  { to: 'education-planning-calculator', element: <EducationPlanningCalculator /> },
  { to: 'SWP-calculator', element: <MutualFundWithdrawalPlanCalculator /> },
  { to: 'risk-analyzer', element: <RiskAnalyzer /> },
  { to: 'mf-performance-attribution-calculator', element: <MutualFundPerformanceAttributionCalculator /> },
  { to: 'sip-calculator', element: <SIPCalculator /> },
  { to: 'lumpsum-calculator', element: <LumpsumCalculator /> },
]