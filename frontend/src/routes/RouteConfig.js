
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






export const appRoutes = [
  { to: '/', label: 'Home', element: <Home />, protected: true, showInSidebar: true },
  { requiredPermission: 'Portfolio Analysis', to: '/portfolio-analysis', label: 'Portfolio Analysis', element: <PortfolioReport />, protected: true, showInSidebar: true },
  { requiredPermission: 'Existing Portfolio', to: '/existing-portfolio', label: 'Existing Portfolio', element: <ExistingPortfolio />, protected: true, showInSidebar: true },
  { requiredPermission: 'Import CAS', to: '/import-cas', label: 'Import CAS', element: <CasImport />, protected: true, showInSidebar: false },
  { requiredPermission: 'Model Portfolio', to: '/model-portfolio', label: 'Model Portfolio', element: <ModelPortfolio />, protected: true, showInSidebar: false },
  { requiredPermission: 'Calculator', to: '/calculator', label: 'Calculator', element: <Calculators />, protected: true, showInSidebar: true,
    nestedRoutes: calculatorRoutes
  },
  { requiredPermission: 'MF Trans Request', to: '/mf-trans-request', label: 'MF Trans Request', element: <MFTransRequest />, protected: true, showInSidebar: true },
  { requiredPermission: 'Associate Payout', to: '/associate-payout', label: 'Associate Payout', element: <AssociatePayout />, protected: true, showInSidebar: true },
  { requiredPermission: 'Associate Payout Accounts', to: '/associate-payout-accounts', label: 'Associate Payout Accounts', element: <AssociatePayoutAccounts />, protected: true, showInSidebar: true },
  { requiredPermission: 'Direct Client Payout', to: '/dir-client-payout', label: 'Direct Client Payout', element: <DirClientPayouts />, protected: true, showInSidebar: true },
  { requiredPermission: 'Direct Client Payout Accounts', to: '/dir-client-payout-accounts', label: 'Direct Client Payout Accounts', element: <DirectClientPayouts />, protected: true, showInSidebar: true },
  { requiredPermission: 'MF Transaction', to: '/mf-trans-form', label: 'MF Transaction', element: <MfTransForm />, protected: true, showInSidebar: true },
  { requiredPermission: 'NFO', to: '/nfo-form', label: 'NFO Transaction', element: <NfoForm />, protected: true, showInSidebar: true },
  { requiredPermission: 'Operations Dashboard', to: 'https://opss.mnivesh.com', label: 'OPS Dashboard', external: true, showInSidebar: true },
  { requiredPermission: 'Links', to: '/links', label: 'Links', element: <InternalLink />, protected: true, showInSidebar: true,
    nestedRoutes: internalLinkRoutes
  },
  { requiredPermission: 'Marketing Templates', to: '/marketing-templates', label: 'Marketing Templates', element: <MarketingTemplates />, protected: true, showInSidebar: true },
  { requiredPermission: 'Mint', to: '/mint', label: 'Mint', element: <Mint />, protected: true, showInSidebar: true },
  { requiredPermission: 'Workdrive', to: '/workdrive', label: 'Workdrive Files', element: <Workdrive />, protected: true, showInSidebar: true },
  { requiredPermission: 'Login', to: '/login', element: <Loginpage />, protected: false, showInSidebar: false },
  // {
  //   requiredPermission: 'Employee Onboarding',
  //   to: '/onboarding',
  //   label: 'Employee Onboarding',
  //   element: <OnboardingLayout />,
  //   protected: true,
  //   showInSidebar: true,
  //   nestedRoutes: onboardingRoutes
  // }
  
  
,

  { requiredPermission: 'Mnivesh Admin', to: '/mnivesh-admin', label: 'mNivesh Admin', element: <MniveshAdmin />, protected: true, showInSidebar: true,
    nestedRoutes: mniveshAdminRoutes
  },
  // { to: '/assets', label: 'Assets', element: <Assets />, protected: true, showInSidebar: true,
  //   nestedRoutes: assetRoutes
  // },
]