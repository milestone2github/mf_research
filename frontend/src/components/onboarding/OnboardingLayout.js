import React from 'react';
import EmployeeOnboardingHome from '../onboarding/EmployeeOnboardingHome';
import { Outlet } from 'react-router-dom';

const OnboardingLayout = () => {
  return (
    <div className="p-4">
      {/* This is where nested routes render */}
      <Outlet />
    </div>
  );
};

export default OnboardingLayout;
