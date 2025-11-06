import { calculatorRoutes } from './calculatorRoutes'
import { internalLinkRoutes } from './internalLinkRoutes'
import Home from '../components/pages/Home'
import AssociatePayout from '../components/pages/associatePayout'
import PortfolioReport from '../components/pages/PortfolioReport'
import ExistingPortfolio from '../components/pages/ExistingPortfolio'
import CasImport from '../components/pages/CasImport'
import ModelPortfolio from '../components/pages/ModelPortfolio'
import Calculators from '../components/pages/Calculators'
import MFTransRequest from '../components/pages/MFTransRequest'
import AssociatePayoutAccounts from '../components/pages/associatePayout-accounts'
import DirClientPayouts from '../components/pages/DirClientPayout'
import DirectClientPayouts from '../components/pages/DirClientPayout-accounts'
import MfTransForm from '../components/pages/MfTransForm'
import NfoForm from '../components/pages/NfoForm'
import InternalLink from '../components/pages/InternalLink'
import Mint from '../components/pages/Mint'
import MarketingTemplates from '../components/pages/MarketingTemplates'
import Loginpage from '../components/pages/Loginpage'
import Workdrive from '../components/pages/workdrive'
import MniveshAdmin from '../components/pages/MniveshAdmin'
import { mniveshAdminRoutes } from './mniveshAdminRoutes'
import Assets from '../components/pages/Assets'
import { assetRoutes } from './assetRoutes'
import OnboardingLayout from '../components/onboarding/OnboardingLayout';
import Leaderboard from '../components/pages/Leaderboard';
import InsuranceLeadUpdate from '../components/pages/InsuranceLeadUpdate';
import onboardingRoutes from './onboarding'
import RbacLayout from '../centralRbac/src/pages/RbacLayout'
import { centralRbacRoutes } from './centralRbacRoutes'
import NotFound from '../components/pages/NotFound'
import { RoutePlanningRoutes } from './RoutePlanningRoutes'
import RouteOptimization from '../components/pages/RouteOptimization'
import ReferralPerformance from '../components/pages/ReferralPerformance'
import InsurancePerformance from '../components/pages/InsurancePerformance'
import LeaderPerformance from '../components/pages/LeaderPerformance '
import LumpsumauditLb from '../components/pages/LumpsumAuditLb'
import MFSIPLeaderboard from '../components/pages/MFSIPLeaderboard'
import UploadMarketingTemplates from '../components/pages/UploadMarketingTemplates'


export const appRoutes = [
	// Home
	{
		to: "/",
		label: "Home",
		element: <Home />,
		protected: true,
		showInSidebar: true,
	},

	// Portfolio Analysis
	{
		requiredPermission: "portfolio_analysis",
		to: "/portfolio-analysis",
		label: "Portfolio Analysis",
		element: <PortfolioReport />,
		protected: true,
		showInSidebar: true,
	},

	// Existing Portfolio
	{
		requiredPermission: "existing_portfolio",
		to: "/existing-portfolio",
		label: "Existing Portfolio",
		element: <ExistingPortfolio />,
		protected: true,
		showInSidebar: true,
	},

	// Import CAS
	{
		requiredPermission: "import_cas",
		to: "/import-cas",
		label: "Import CAS",
		element: <CasImport />,
		protected: true,
		showInSidebar: false,
	},

	// Model Portfolio
	{
		requiredPermission: "model_portfolio",
		to: "/model-portfolio",
		label: "Model Portfolio",
		element: <ModelPortfolio />,
		protected: true,
		showInSidebar: false,
	},

	// Calculator
	{
		requiredPermission: "calculator",
		to: "/calculator",
		label: "Calculator",
		element: <Calculators />,
		protected: true,
		showInSidebar: true,
		nestedRoutes: calculatorRoutes,
	},

	// MF Trans Request
	{
		requiredPermission: "mf_trans_request",
		to: "/mf-trans-request",
		label: "MF Trans Request",
		element: <MFTransRequest />,
		protected: true,
		showInSidebar: true,
	},

	// Associate Payout
	{
		requiredPermission: "associate_payout",
		to: "/associate-payout",
		label: "Associate Payout",
		element: <AssociatePayout />,
		protected: true,
		showInSidebar: true,
	},

	// Associate Payout Accounts
	{
		requiredPermission: "associate_payout_accounts",
		to: "/associate-payout-accounts",
		label: "Associate Payout Accounts",
		element: <AssociatePayoutAccounts />,
		protected: true,
		showInSidebar: true,
	},

	// Direct Client Payout
	{
		requiredPermission: "direct_client_payout",
		to: "/dir-client-payout",
		label: "Direct Client Payout",
		element: <DirClientPayouts />,
		protected: true,
		showInSidebar: true,
	},

	// Direct Client Payout Accounts
	{
		requiredPermission: "direct_client_payout_accounts",
		to: "/dir-client-payout-accounts",
		label: "Direct Client Payout Accounts",
		element: <DirectClientPayouts />,
		protected: true,
		showInSidebar: true,
	},

	// MF Transaction
	{
		requiredPermission: "mf_transaction",
		to: "/mf-trans-form",
		label: "MF Transaction",
		element: <MfTransForm />,
		protected: true,
		showInSidebar: true,
	},

	// NFO Transaction
	{
		requiredPermission: "nfo",
		to: "/nfo-form",
		label: "NFO Transaction",
		element: <NfoForm />,
		protected: true,
		showInSidebar: true,
	},

	// OPS Dashboard
	{
		requiredPermission: "operations_dashboard",
		to: "https://ops.mnivesh.com",
		label: "OPS Dashboard",
		external: true,
		showInSidebar: true,
	},

	// Links
	{
		requiredPermission: "links",
		to: "/links",
		label: "Links",
		element: <InternalLink />,
		protected: true,
		showInSidebar: true,
		nestedRoutes: internalLinkRoutes,
	},

	// Marketing Templates
	{
		requiredPermission: "marketing_templates",
		to: "/marketing-templates",
		label: "Marketing Templates",
		element: <MarketingTemplates />,
		protected: true,
		showInSidebar: true,
	},

	// Upload Marketing Templates for Admin
	{
		requiredPermission: "upload_marketing_templates",
		to: "/upload-marketing-templates",
		label: "Upload Marketing Templates",
		element: <UploadMarketingTemplates />,
		protected: true,
		showInSidebar: true,
	},

	// Mint
	{
		requiredPermission: "mint",
		to: "/mint",
		label: "Mint",
		element: <Mint />,
		protected: true,
		showInSidebar: true,
	},

	// Workdrive Files
	{
		requiredPermission: "workdrive",
		to: "/workdrive",
		label: "Workdrive Files",
		element: <Workdrive />,
		protected: true,
		showInSidebar: true,
	},

	// Login
	{
		to: "/login",
		element: <Loginpage />,
		protected: false,
		showInSidebar: false,
	},

	// Employee Onboarding
	{
		requiredPermission: "employee_onboarding",
		to: "/onboarding",
		label: "Employee Onboarding",
		element: <OnboardingLayout />,
		protected: true,
		showInSidebar: true,
		nestedRoutes: onboardingRoutes,
	},

	// RBAC
	{
		to: "/rbac",
		label: "RBAC Management",
		element: <RbacLayout />,
		protected: true,
		showInSidebar: true,
		requiredInternalRole: ["Admin", "Super Admin"], // custom condition
		nestedRoutes: centralRbacRoutes,
	},

	// mNivesh Admin
	{
		requiredPermission: "mnivesh_admin",
		to: "/mnivesh-admin",
		label: "mNivesh Admin",
		element: <MniveshAdmin />,
		protected: true,
		showInSidebar: true,
		nestedRoutes: mniveshAdminRoutes,
	},

	// Assets
	{
		requiredPermission: "assets",
		to: "/assets",
		label: "Assets",
		element: <Assets />,
		protected: true,
		showInSidebar: true,
		nestedRoutes: assetRoutes,
	},

	// Leaderboard
	{
		requiredPermission: "leaderboard",
		to: "/leaderboard",
		label: "Leaderboard",
		element: <Leaderboard />,
		protected: true,
		showInSidebar: true,
	},
	
	// insurance lead update
	{ 
		requiredPermission: "insurance_lead_update",
		to: '/insurance-lead-update',
		label: 'Insurance Lead Update',
		element: <InsuranceLeadUpdate />,
		protected: true,
		showInSidebar: true
  },

	// Route Optimization
	{
		requiredPermission: "route_optimization",
		to: "/route-plan",
		label: "Route Optimization",
		element: <RouteOptimization />,
		protected: true,
		showInSidebar: true,
		nestedRoutes: RoutePlanningRoutes,
	},

	// Referral Performance
	{
		requiredPermission: "referral_performance",
		to: "/referral-performance",
		label: "Referral Performance",
		element: <ReferralPerformance />,
		protected: true,
		showInSidebar: true,
	},

	// Insurance Performance
	{
		requiredPermission: "insurance_performance",
		to: "/insurance-performance",
		label: "Insurance Performance",
		element: <InsurancePerformance />,
		protected: true,
		showInSidebar: true,
	},

	// Leader Performance
	{
		requiredPermission: "leader_performance",
		to: "/leader-performance",
		label: "Leader Performance",
		element: <LeaderPerformance />,
		protected: true,
		showInSidebar: true,
	},

	// Lumpsum Audit Leaderboard
	{
		requiredPermission: "lumpsum_performance",
		to: "/lumpsum-performance",
		label: "Lumpsum Performance",
		element: <LumpsumauditLb />,
		protected: true,
		showInSidebar: true,
	},

   	// MF SIP Leaderboard
	{
		requiredPermission: "sip_performance",
		to: "/sip-performance",
		label: "SIP Performance",
		element: <MFSIPLeaderboard />,
		protected: true,
		showInSidebar: true,
	},  

	// Wild Card to catch all other routes
	{
		to: "*",
		element: <NotFound />,
		showInSidebar: false,
	},
];