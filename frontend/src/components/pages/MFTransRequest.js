// In Calculator.js
import React from "react";
import { useSelector } from "react-redux";
import AccessDenied from "./AccessDenied";

const MFTransRequest = () => {
  const { userData } = useSelector(state => state.user);
  const permissions = userData?.role?.permissions;

  // Component code here
  if(!permissions.find(perm => perm === 'MF Transaction')) 
    return (<AccessDenied />)

  return <div>MF Trans Request Page</div>;
};

export default MFTransRequest;
