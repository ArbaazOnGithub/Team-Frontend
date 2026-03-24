import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("team_user");
        try {
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (e) {
            return null;
        }
    });
    const [token, setToken] = useState(() => localStorage.getItem("team_token") || null);

    const login = (userData, userToken) => {
        setUser(userData);
        setToken(userToken);
        localStorage.setItem("team_user", JSON.stringify(userData));
        localStorage.setItem("team_token", userToken);
    };

    const logout = (message = "Logged out successfully!") => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("team_user");
        localStorage.removeItem("team_token");
        if (message) toast.success(message);
    };

    const updateUserData = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem("team_user", JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, updateUserData }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
