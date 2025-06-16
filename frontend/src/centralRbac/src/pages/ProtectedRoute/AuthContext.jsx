import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setUserRole, clearUserRole } from '../../utils/auth';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/auth/checkLoggedIn`, {
                withCredentials: true // important for sessions
            });

            if (response.data.loggedIn) {
                setUser(response.data.user);
                // setUserRole(response.data.user.internalDashboardRole);
            } else {
                setUser(null);
                // clearUserRole();
            }
        } catch (error) {
            console.error('Session check failed:', error);
            setUser(null);
            // clearUserRole();
        } finally {
            setLoading(false);
        }
    };

    const value = { user, loading, checkSession };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


export const useAuth = () => useContext(AuthContext);