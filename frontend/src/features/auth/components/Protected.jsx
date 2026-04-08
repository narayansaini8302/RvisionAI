// components/Protected.js
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import React, { useEffect } from 'react';
import Loading from "./Loading";

export const Protected = ({ children }) => {
    const { loading, user } = useAuth();
    
    console.log('=== Protected Route ===');
    console.log('Loading:', loading);
    console.log('User:', user);
    
    useEffect(() => {
        console.log('Protected - user changed:', user);
    }, [user]);
    
    if (loading) {
        console.log('Protected - showing loading');
        return <Loading fullScreen size="xl" />;
    }
    
    if (!user) {
        console.log('Protected - no user, redirecting to login');
        return <Navigate to="/login" replace />;
    }
    
    console.log('Protected - user authenticated, rendering children');
    return children;
};