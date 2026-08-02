/* eslint-disable react-refresh/only-export-components */
import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkSession = async () => {
        try {
            const token = localStorage.getItem("token");

            if (token) {
                try {
                    const me = await axios.get("http://192.168.0.114:5000/api/auth/me", {
                        headers: {
                            authorization: `Bearer ${token}`,
                        }
                    });

                    setUser(me.data.user);
                    setLoading(false);
                    return;
                } catch {
                    localStorage.removeItem("token");
                }
            }

            const res = await axios.get(
                "http://192.168.0.114:5000/api/auth/refresh-token",
                {
                    withCredentials: true
                }
            );

            localStorage.setItem("token", res.data.accessToken);
            setUser(res.data.user);

        } catch (error) {
            localStorage.removeItem("token");
            setUser(null);
            console.error("Session check failed:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        Promise.resolve().then(() => checkSession());
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                loading,
                checkSession
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;