// frontend/src/routes/onboarding.js

import EmployeeOnboardingHome from '../components/onboarding/EmployeeOnboardingHome';
import EmployeeOnboardingForm from '../components/onboarding/EmployeeOnboardingForm';
import AssetAllocationPage from '../components/onboarding/AssetAllocationPage';

const onboardingRoutes = [
  {
    to: '/onboarding',
    element: <EmployeeOnboardingHome />
  },
  {
    to: '/onboarding/add',
    element: <EmployeeOnboardingForm />
  },
  {
    to: '/onboarding/allocate/:userId',
    element: <AssetAllocationPage />
  }
];

export default onboardingRoutes;
