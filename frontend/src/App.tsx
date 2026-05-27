import React, { useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ChatProvider, useChat } from "./context/ChatContext";
import { AuthForm } from "./components/auth/AuthForm";
import { MainLayout } from "./components/layout/MainLayout";
import "./styles/index.css";

function AppContent() {
  const { token, user, setUser } = useAuth();
  const { setError: setChatError } = useChat();

  useEffect(() => {
    if (token && !user) {
      const fetchUser = async () => {
        try {
          const response = await fetch("http://localhost:3000/user", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          }
        } catch (err) {
          setChatError("Failed to load user data");
        }
      };
      fetchUser();
    }
  }, [token, user, setUser, setChatError]);

  if (!token) {
    return <AuthForm />;
  }

  return <MainLayout />;
}

export default function App() {
  return (
    <AuthProvider>
      <ChatProvider token={localStorage.getItem("llm-token")}>
        <AppContent />
      </ChatProvider>
    </AuthProvider>
  );
}
