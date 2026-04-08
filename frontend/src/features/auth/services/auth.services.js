// services/auth.services.js
import  api from '../api/api'

export const login = async (email, password) => {
    try {
        const response = await api.post('/login', { email, password });
        
        console.log('=== RAW LOGIN RESPONSE ===');
        console.log('Full response:', response);
        console.log('Response data:', response.data);
        console.log('Response data keys:', Object.keys(response.data));
        console.log('User object:', response.data.user);
        console.log('===========================');
        
        // ✅ Extract from response.data.user (not directly from response.data)
        const { token, message, user } = response.data;
        
        // Validate user data
        if (!user || !user.id) {
            console.error('Invalid user data:', user);
            throw new Error('No user data received');
        }
        
        // Save token
        if (token) {
            localStorage.setItem('token', token);
            console.log('Token saved to localStorage');
        }
        
        return {
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            },
            token: token,
            message: message
        };
        
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

export const register = async (username, email, password) => {
    try {
        const response = await api.post('/register', { username, email, password });
        console.log('Register response:', response.data);
        
        const { token, message, user } = response.data;
        
        if (!user || !user.id) {
            throw new Error('No user data received');
        }
        
        if (token) {
            localStorage.setItem('token', token);
        }
        
        return {
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            },
            token: token,
            message: message
        };
    } catch (error) {
        console.error('Register error:', error);
        throw error;
    }
};

export const logout = async () => {
    try {
        await api.post('/logout');
        localStorage.removeItem('token');
        console.log('Token removed from localStorage');
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
};

// services/auth.services.js
export const getme = async () => {
    try {
        console.log('=== getme service called ===');
        const token = localStorage.getItem('token');
        console.log('Token in getme:', token ? 'exists' : 'missing');
        
        const response = await api.get('/get-me');
        console.log('GetMe response status:', response.status);
        console.log('GetMe response data:', response.data);
        
        // Handle different response formats
        let userData;
        if (response.data.user) {
            userData = response.data.user;
        } else if (response.data.id) {
            userData = {
                id: response.data.id,
                username: response.data.username,
                email: response.data.email
            };
        } else {
            console.error('Unexpected response format:', response.data);
            throw new Error('Invalid response format');
        }
        
        console.log('Extracted user data:', userData);
        
        return { user: userData };
    } catch (error) {
        console.error('GetMe error:', error);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        throw error;
    }
};