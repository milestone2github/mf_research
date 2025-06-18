//function in this are entirly set for Debug purpose Internal Role based Protected Route access

export const setUserRole = (role) => {
    console.log('[auth.js] Setting role in localStorage:', role);
    localStorage.setItem('internalDashboardRole', role);
  };
  
  export const getUserRole = () => {
    const role = localStorage.getItem('internalDashboardRole');
    console.log('[auth.js] Getting role from localStorage:', role);
    return role;
  };
  
  export const clearUserRole = () => {
    // console.log('[auth.js] Clearing role from localStorage');
    localStorage.removeItem('internalDashboardRole');
  };
  
  export const isSuperAdmin = () => {
    const result = getUserRole() === 'Super Admin';
    console.log('[auth.js] isSuperAdmin check:', result);
    return result;
  };
  
  export const isAdmin = () => {
    const role = getUserRole();
    const result = role === 'Admin' || role === 'Super Admin';
    console.log('[auth.js] isAdmin check:', result);
    return result;
  };