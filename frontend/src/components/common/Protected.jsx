import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom';
import { setLoading, setLoggedIn, setUser } from '../../Reducers/UserSlice';

function Protected({children}) {
  const {isLoggedIn, isLoading} = useSelector(state => state.user);
  const dispatch = useDispatch();
  console.log('location: ', window.location.href) //test
  useEffect(() => {
    // Function to check if the user is already logged in
      dispatch(setLoading(true));
      const checkLoggedIn = async () => {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/user/checkLoggedIn`, {
            method: "GET",
            credentials: 'include'
          });
          const data = await response.json();
          dispatch(setLoggedIn(data.loggedIn));
          dispatch(setUser(data.user));
        } catch (error) {
          console.error("Error Checking session", error)
        }
        finally{
          dispatch(setLoading(false));
        }
      }
  
      checkLoggedIn();
   
  }, [isLoggedIn])

  if(isLoading) return <h1>Loading...</h1>

  return (
    !isLoading && isLoggedIn ? children : <Navigate to={'/login'} replace/>
  )
}

export default Protected