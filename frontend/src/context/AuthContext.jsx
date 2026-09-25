import { createContext, useContext, useEffect, useState } from "react";
import client from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("user");

        if (!storedUser) {
            return null;
        }

        try {
            return JSON.parse(storedUser);
        } catch {
            localStorage.removeItem("user");
            return null;
        }
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            setLoading(false);
            return;
        }

        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const response = await client.post("/auth/login", {
            email,
            password,
        });

        const { token, user: loggedInUser } = response.data;

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(loggedInUser));

        setUser(loggedInUser);

        return response.data;
    };

    const register = async (name, email, password) => {
        const response = await client.post("/auth/register", {
            name,
            email,
            password,
        });

        return response.data;
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    };

    const value = {
        user,
        loading,
        isAuthenticated: Boolean(user && localStorage.getItem("token")),
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}