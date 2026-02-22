import { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is logged in
    useEffect(() => {
        const checkAuth = async () => {
            console.log("AuthContext: Checking authentication...");
            const userInfo = localStorage.getItem('userInfo');

            if (userInfo) {
                console.log("AuthContext: Found userInfo in localStorage");
                try {
                    // Ideally, we should verify the token with the backend here
                    // For now, we'll trust the stored data but also attempt to fetch fresh profile data
                    // to ensure validity if the token is present.
                    // This prevents "flicker" where we show logged in state but token is actually invalid.

                    const parsedUser = JSON.parse(userInfo);
                    if (parsedUser.token) {
                        try {
                            // Verify with backend immediately
                            // We use the 'api' instance which has the interceptor to attach the token
                            // The interceptor retrieves token from localStorage, which we know exists.
                            // However, we need to ensure the interceptor works or we manually attach here.
                            // The 'api' interceptor reads 'userInfo' from localStorage.

                            console.log("AuthContext: Verifying token with backend...");
                            const { data } = await api.get('/auth/profile');
                            console.log("AuthContext: Token verified via profile fetch", data);

                            // If successful, we update the user with fresh data from backend
                            // We keep the token from the storage as the profile might not return it
                            setUser({ ...data, token: parsedUser.token });
                        } catch (err) {
                            console.error("AuthContext: Token verification failed", err);

                            // Only log out if it's an authentication error (401/403)
                            // If it's a network error or server error, keep the local session active for now
                            // to prevent a loop if the server is just temporarily unreachable or CORS is fighting.
                            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                                console.log("AuthContext: Invalid token/session, logging out.");
                                localStorage.removeItem('userInfo');
                                setUser(null);
                            } else {
                                console.warn("AuthContext: Server error or Network issue. Keeping local session.");
                                // We still set the user from local storage so the app doesn't break
                                setUser(parsedUser);
                            }
                        }
                    } else {
                        console.log("AuthContext: No token in userInfo");
                    }
                } catch (error) {
                    console.error('AuthContext: Failed to parse user info', error);
                    localStorage.removeItem('userInfo');
                    setUser(null);
                }
            } else {
                console.log("AuthContext: No userInfo found");
            }
            setLoading(false);
            console.log("AuthContext: Loading set to false");
        };

        checkAuth();
    }, []);

    const login = (userData) => {
        localStorage.setItem('userInfo', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
        // Optional: Call logout endpoint if cookies are used or for server-side cleanup
        // axios.post('/api/auth/logout').catch(err => console.error(err));
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};
