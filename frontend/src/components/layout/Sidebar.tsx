import React, { useState } from "react";
import { ChatList } from "../sidebar/ChatList";
import { ModelSelector } from "../sidebar/ModelSelector";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";
import { SettingsModal } from "../settings/SettingsModal";

export function Sidebar() {
  const { user, logout } = useAuth();
  const { models, loadModels } = useChat();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleAddModelSuccess = async () => {
    await loadModels();
    setSettingsOpen(false);
  };

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>LLM Chat</h1>
        </div>

        <div className="sidebar-content">
          <div className="sidebar-section">
            <h3>Чаты</h3>
            <ChatList />
          </div>

          <div className="sidebar-divider" />

          <div className="sidebar-section">
            <h3>Модель</h3>
            {models.length === 0 ? (
              <div className="model-notice">Нет добавленных моделей</div>
            ) : (
              <ModelSelector />
            )}
            <button
              onClick={() => setSettingsOpen(true)}
              className="settings-button"
            >
              + Добавить модель
            </button>
          </div>

          <div className="sidebar-divider" />

          <div className="sidebar-footer">
            <div className="user-info">
              <div className="user-avatar">
                {user?.username?.[0].toUpperCase() || "U"}
              </div>
              <div className="user-details">
                <p className="user-name">{user?.username || user?.email}</p>
                <p className="user-email">{user?.email}</p>
              </div>
            </div>
            <button onClick={logout} className="logout-button">
              Выйти из аккаунта
            </button>
          </div>
        </div>
      </aside>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSuccess={handleAddModelSuccess}
      />
    </>
  );
}
