import api from './axios';

export const login = async (email, password) => {
    try {
        console.log('🔐 Attempting login for:', email);
        
        const response = await api.post('/auth/login', { email, password });
        
        console.log('✅ Login response:', response.data);
        
        const { token, user } = response.data;
        
        if (!token) {
            console.error('❌ No token in login response');
            throw new Error('No token received from server');
        }
        
        if (!user) {
            console.error('❌ No user data in login response');
            throw new Error('No user data received from server');
        }
        
        // Save token to localStorage
        localStorage.setItem('token', token);
        console.log('✅ Token saved to localStorage');
        
        // Save user to localStorage (optional)
        localStorage.setItem('user', JSON.stringify(user));
        
        return { user, token };
        
    } catch (error) {
        console.error('❌ Login error:', error.response?.data || error.message);
        throw error;
    }
};

export const register = async (username, email, password) => {
    try {
        console.log('📝 Attempting registration for:', email);
        
        const response = await api.post('/auth/register', { username, email, password });
        
        console.log('✅ Register response:', response.data);
        
        const { token, user } = response.data;
        
        if (token) {
            localStorage.setItem('token', token);
            console.log('✅ Token saved to localStorage');
        }
        
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        }
        
        return { user, token };
        
    } catch (error) {
        console.error('❌ Register error:', error.response?.data || error.message);
        throw error;
    }
};

export const logout = async () => {
    try {
        console.log('🚪 Attempting logout');
        
        await api.post('/auth/logout');
        
        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        console.log('✅ Logout successful, token cleared');
        
    } catch (error) {
        console.error('❌ Logout error:', error);
        // Still clear local storage even if API call fails
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        throw error;
    }
};

export const getme = async () => {
    try {
        console.log('👤 Fetching current user');
        
        const token = localStorage.getItem('token');
        
        if (!token) {
            console.warn('⚠️ No token found, skipping getme');
            return { user: null };
        }
        
        const response = await api.get('/auth/get-me');
        
        console.log('✅ GetMe response:', response.data);
        
        const userData = response.data.user || response.data;
        
        // Update stored user
        localStorage.setItem('user', JSON.stringify(userData));
        
        return { user: userData };
        
    } catch (error) {
        console.error('❌ GetMe error:', error.response?.data || error.message);
        
        // If unauthorized, clear token
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        
        throw error;
    }
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return !!token;
};

// Helper function to get current user from localStorage
export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
        return JSON.parse(userStr);
    } catch {
        return null;
    }
};