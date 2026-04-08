// hooks/useAuth.js
import { useContext } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout, getme } from "../services/auth.services";

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    const { user, setUser, loading, setLoading } = context;
    
    const handlelogin = async (email, password) => {
        setLoading(true);
        try {
            const data = await login(email, password);
            console.log('Login response:', data);
            
            // ✅ Token is already saved in login service
            setUser(data.user);
            console.log('User set:', data.user);
            
            return data;
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };
    
    const handleregister = async (username, email, password) => {
        setLoading(true);
        try {
            const data = await register(username, email, password);
            console.log('Register response:', data);
            
            // ✅ Token is already saved in register service
            setUser(data.user);
            return data;
        } catch (error) {
            console.error("Registration failed:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };
    
    const handlelogout = async () => {
        setLoading(true);
        try {
            await logout();
            // Token is removed in logout service
            setUser(null);
        } catch (error) {
            console.error("Logout failed:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };
    
    const handlegetme = async () => {
        setLoading(true);   
        try {
            const data = await getme();
            setUser(data.user);
            return data;
        } catch (error) {
            console.error("GetMe failed:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };
    
    return { user, loading, handlelogin, handleregister, handlelogout, handlegetme };
};