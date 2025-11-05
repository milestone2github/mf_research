//function in this are entirly set for Debug purpose Internal Role based Protected Route access

export const setUserRole = (role) => {
    localStorage.setItem('internalDashboardRole', role);
  };
  
  export const getUserRole = () => {
    const role = localStorage.getItem('internalDashboardRole');
    return role;
  };
  
  export const clearUserRole = () => {
    localStorage.removeItem('internalDashboardRole');
  };
  
  export const isSuperAdmin = () => {
    const result = getUserRole() === 'Super Admin';
    return result;
  };
  
  export const isAdmin = () => {
    const role = getUserRole();
    const result = role === 'Admin' || role === 'Super Admin';
    return result;
  };