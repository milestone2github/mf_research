
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
import { assetRoutes } from './assetRoutes'
import Assets from '../components/pages/Assets'
import OnboardingLayout from '../components/onboarding/OnboardingLayout';
import onboardingRoutes from './onboarding'
import RbacLayout from '../centralRbac/src/pages/RbacLayout'
import { centralRbacRoutes } from './centralRbacRoutes'
import NotFound from '../components/pages/NotFound'

export const appRoutes = [
  { to: '/', label: 'Home', element: <Home />, protected: true, showInSidebar: true },
  { requiredPermission: 'portfolio_analysis', to: '/portfolio-analysis', label: 'Portfolio Analysis', element: <PortfolioReport />, protected: true, showInSidebar: true },
  { requiredPermission: 'existing_portfolio', to: '/existing-portfolio', label: 'Existing Portfolio', element: <ExistingPortfolio />, protected: true, showInSidebar: true },
  { requiredPermission: 'import_cas', to: '/import-cas', label: 'Import CAS', element: <CasImport />, protected: true, showInSidebar: false },
  { requiredPermission: 'model_portfolio', to: '/model-portfolio', label: 'Model Portfolio', element: <ModelPortfolio />, protected: true, showInSidebar: false },
  {
    requiredPermission: 'calculator', to: '/calculator', label: 'Calculator', element: <Calculators />, protected: true, showInSidebar: true,
    nestedRoutes: calculatorRoutes
  },
  { requiredPermission: 'mf_trans_request', to: '/mf-trans-request', label: 'MF Trans Request', element: <MFTransRequest />, protected: true, showInSidebar: true },
  { requiredPermission: 'associate_payout', to: '/associate-payout', label: 'Associate Payout', element: <AssociatePayout />, protected: true, showInSidebar: true },
  { requiredPermission: 'associate_payout_accounts', to: '/associate-payout-accounts', label: 'Associate Payout Accounts', element: <AssociatePayoutAccounts />, protected: true, showInSidebar: true },
  { requiredPermission: 'direct_client_payout', to: '/dir-client-payout', label: 'Direct Client Payout', element: <DirClientPayouts />, protected: true, showInSidebar: true },
  { requiredPermission: 'direct_client_payout_accounts', to: '/dir-client-payout-accounts', label: 'Direct Client Payout Accounts', element: <DirectClientPayouts />, protected: true, showInSidebar: true },
  { requiredPermission: 'mf_transaction', to: '/mf-trans-form', label: 'MF Transaction', element: <MfTransForm />, protected: true, showInSidebar: true },
  { requiredPermission: 'nfo', to: '/nfo-form', label: 'NFO Transaction', element: <NfoForm />, protected: true, showInSidebar: true },
  { requiredPermission: 'operations_dashboard', to: 'https://opss.mnivesh.com', label: 'OPS Dashboard', external: true, showInSidebar: true },
  {
    requiredPermission: 'links', to: '/links', label: 'Links', element: <InternalLink />, protected: true, showInSidebar: true,
    nestedRoutes: internalLinkRoutes
  },
  { requiredPermission: 'marketing_templates', to: '/marketing-templates', label: 'Marketing Templates', element: <MarketingTemplates />, protected: true, showInSidebar: true },
  { requiredPermission: 'mint', to: '/mint', label: 'Mint', element: <Mint />, protected: true, showInSidebar: true },
  { requiredPermission: 'workdrive', to: '/workdrive', label: 'Workdrive Files', element: <Workdrive />, protected: true, showInSidebar: true },
  { requiredPermission: 'login', to: '/login', element: <Loginpage />, protected: false, showInSidebar: false },
  {
    requiredPermission: 'employee_onboarding',
    to: '/onboarding',
    label: 'Employee Onboarding',
    element: <OnboardingLayout />,
    protected: true,
    showInSidebar: true,
    nestedRoutes: onboardingRoutes
  },
  {
    to: '/rbac',
    label: 'RBAC Management',
    element: <RbacLayout />,
    protected: true,
    showInSidebar: true,
    requiredInternalRole: ['Admin', 'Super Admin'], // custom condition
    nestedRoutes: centralRbacRoutes
  },

  {
    requiredPermission: 'mnivesh_admin', to: '/mnivesh-admin', label: 'mNivesh Admin', element: <MniveshAdmin />, protected: true, showInSidebar: true,
    nestedRoutes: mniveshAdminRoutes
  },
  { to: '/assets', label: 'Assets', element: <Assets />, protected: true, showInSidebar: true,
    nestedRoutes: assetRoutes
  },

  // wild card route to catch all other routes
  {
    to: '*',
    element: <NotFound />,
    showInSidebar: false
    }
]