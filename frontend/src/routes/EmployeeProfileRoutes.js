
import AllEmployeesOnboarding from '../components/existingEmployeeOnboarding/AllEmployeesOnboarding';
import ExistingEmployeeOnboarding from '../components/existingEmployeeOnboarding/ExistingEmployeeOnboarding';

export const employeeProfileRoutes = [
    { to: '', element: <AllEmployeesOnboarding /> },
    { to: 'edit/:userId', element: <ExistingEmployeeOnboarding /> },
]