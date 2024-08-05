import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import { setLoading, setLoggedIn, setUser } from '../../reducers/UserSlice';

function Protected({children}) {
  const {isLoggedIn, isLoading} = useSelector(state => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Function to check if the user is already logged in
    const checkLoggedIn = async () => {
      dispatch(setLoading(true));
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/checkLoggedIn`, {
          method: "GET",
          credentials: 'include'
        });
        const data = await response.json();
        dispatch(setLoggedIn(data.loggedIn));
        dispatch(setUser(data.user));
        if (!data.loggedIn) {
          navigate('/login', { replace: true }); // navigate if not logged in
        }
      } catch (error) {
        console.error("Error Checking session", error.message);
        navigate('/login?error=internalServerError', {replace: true})
      } finally {
        dispatch(setLoading(false));
      }
    };

    if (!isLoggedIn) { // Check on initial render and dependency changes
      checkLoggedIn();
    }
  }, [dispatch, navigate, isLoggedIn]);

  if (isLoading) {
    return (
      <div className='h-full w-full flex items-center justify-center'>
        <div className='loader'>
        </div>
      </div>
    );
  }

  return isLoggedIn ? children : null;
}

export default Protected;
