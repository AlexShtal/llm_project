import React, { useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ChatProvider, useChat } from "./context/ChatContext";
import { AuthForm } from "./components/auth/AuthForm";
import { MainLayout } from "./components/layout/MainLayout";
import { getProfile } from "./api";
import "./styles/index.css";

function AppContent() {
  const { token } = useAuth();

  if (!token) {
    return <AuthForm />;
  }

  return (
    <ChatProvider token={token}>
      <AuthenticatedApp />
    </ChatProvider>
  );
}

function AuthenticatedApp() {
  const { token, user, setUser } = useAuth();
  const { setError: setChatError } = useChat();

  useEffect(() => {
    if (token && !user) {
      const fetchUser = async () => {
        try {
          setUser(await getProfile(token));
        } catch (err) {
          setChatError(
            err instanceof Error
              ? err.message
              : "Не удалось загрузить данные пользователя.",
          );
        }
      };
      fetchUser();
    }
  }, [token, user, setUser, setChatError]);

  return <MainLayout />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
