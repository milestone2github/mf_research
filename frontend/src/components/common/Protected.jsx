import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setLoading, setLoggedIn, setUser } from '../../reducers/UserSlice';
import AccessDenied from '../pages/AccessDenied';

function Protected({ children, requiredPermission, requiredInternalRole }) {
  const { isLoggedIn, isLoading, userData } = useSelector(state => state.user);
  const permissions = userData?.permissions || [];
  const internalRole = userData?.internalDashboardRole;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoggedIn = async () => {
      dispatch(setLoading(true));
      try {
        const response = await fetch(`${process.env.REACT_APP_AUTH_BASE_URL}/auth/checkLoggedIn`, {
          method: "GET",
          credentials: 'include'
        });
        const data = await response.json();
        dispatch(setLoggedIn(data.loggedIn));
        dispatch(setUser(data.user));
        if (!data.loggedIn) {
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error("Error Checking session", error.message);
        navigate('/login?error=internalServerError', { replace: true });
      } finally {
        dispatch(setLoading(false));
      }
    };

    if (!isLoggedIn) {
      checkLoggedIn();
    }
  }, [dispatch, navigate, isLoggedIn]);

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="loader"></div>
      </div>
    );
  }

  if (!isLoggedIn) return null;

// 🔐 Permission check
  if (requiredPermission && !permissions.includes(requiredPermission)) {
    return <AccessDenied />;
  }
console.log(requiredInternalRole,internalRole);

  // 🔐 Internal Dashboard Role check
  if (requiredInternalRole && !requiredInternalRole.includes(internalRole)) {
    return <AccessDenied />;
  }
  return children;
}

export default Protected;