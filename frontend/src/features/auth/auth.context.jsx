// auth.context.js
import { createContext, useState, useEffect } from "react";
import { getme } from "./services/auth.services";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const restoreSession = async () => {
            const token = localStorage.getItem('token');
            console.log('=== AuthProvider: Restoring session ===');
            console.log('Token exists?', !!token);
            console.log('Token:', token);
            
            if (!token) {
                console.log('No token found, user not logged in');
                setLoading(false);
                setUser(null);
                return;
            }
            
            try {
                console.log('Calling getme to fetch user data...');
                const data = await getme();
                console.log('Getme response:', data);
                
                if (data && data.user && data.user.id) {
                    console.log('User restored successfully:', data.user);
                    setUser(data.user);
                } else {
                    console.error('Invalid user data received:', data);
                    // Token might be invalid, clear it
                    localStorage.removeItem('token');
                    setUser(null);
                }
            } catch (error) {
                console.error('Session restoration failed:', error);
                console.error('Error details:', error.response?.data);
                // Clear invalid token
                localStorage.removeItem('token');
                setUser(null);
            } finally {
                setLoading(false);
                console.log('Loading set to false, user:', user);
            }
        };
        
        restoreSession();
    }, []);

    console.log('AuthProvider render - loading:', loading, 'user:', user);

    return (
        <AuthContext.Provider value={{ user, setUser, loading, setLoading }}>
            {children}
        </AuthContext.Provider>
    );
};