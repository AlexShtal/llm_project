import React, { useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { ChatPanel } from "../chat/ChatPanel";
import { AdminPanel } from "../admin/AdminPanel";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";

export function MainLayout() {
  const { token, user } = useAuth();
  const { loadChats, loadModels } = useChat();

  useEffect(() => {
    if (token) {
      loadChats();
      loadModels();
    }
  }, [token, loadChats, loadModels]);

  return (
    <div className="main-layout">
      <Sidebar />
      <div className="main-content">
        {user?.role === "ADMIN" ? <AdminPanel /> : <ChatPanel />}
      </div>
    </div>
  );
}
