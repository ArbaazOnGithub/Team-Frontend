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
    const [activeTeamId, setActiveTeamId] = useState(() => localStorage.getItem("team_active_id") || null);
    const [isAdminMode, setIsAdminMode] = useState(() => localStorage.getItem("team_admin_mode") === "true");

    const login = (userData, userToken) => {
        setUser(userData);
        setToken(userToken);
        setActiveTeamId(userData.team?._id || userData.team); // Default to primary team
        setIsAdminMode(false);
        localStorage.setItem("team_user", JSON.stringify(userData));
        localStorage.setItem("team_token", userToken);
        localStorage.setItem("team_active_id", userData.team?._id || userData.team);
        localStorage.setItem("team_admin_mode", "false");
    };

    const logout = (message = "Logged out successfully!") => {
        setUser(null);
        setToken(null);
        setActiveTeamId(null);
        setIsAdminMode(false);
        localStorage.removeItem("team_user");
        localStorage.removeItem("team_token");
        localStorage.removeItem("team_active_id");
        localStorage.removeItem("team_admin_mode");
        if (message) toast.success(message);
    };

    const switchTeam = (teamId, asAdmin = false) => {
        setActiveTeamId(teamId);
        setIsAdminMode(asAdmin);
        localStorage.setItem("team_active_id", teamId);
        localStorage.setItem("team_admin_mode", String(asAdmin));
        toast.success(`Context switched to ${asAdmin ? 'Admin' : 'Member'} mode`);
    };

    const updateUserData = (updatedUser) => {
        setUser(updatedUser);
        localStorage.setItem("team_user", JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{ user, token, activeTeamId, isAdminMode, login, logout, updateUserData, switchTeam }}>
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
