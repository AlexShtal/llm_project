import React, { useEffect, useState } from "react";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { useChat } from "../../context/ChatContext";

export function ChatPanel() {
  const { activeChat, isLoadingChats, updateChatTitle, error } = useChat();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");

  useEffect(() => {
    setDraftTitle(activeChat?.title || "Новый чат");
    setIsEditingTitle(false);
  }, [activeChat?.id, activeChat?.title]);

  if (isLoadingChats) {
    return <div className="chat-panel">Загрузка чатов...</div>;
  }

  const saveTitle = async () => {
    const nextTitle = draftTitle.trim();
    if (!activeChat || !nextTitle || nextTitle === activeChat.title) {
      setDraftTitle(activeChat?.title || "Новый чат");
      setIsEditingTitle(false);
      return;
    }

    await updateChatTitle(activeChat.id, nextTitle);
    setIsEditingTitle(false);
  };

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <div className="chat-title-wrap">
          {isEditingTitle ? (
            <input
              className="chat-title-input"
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  saveTitle();
                }
                if (e.key === "Escape") {
                  setDraftTitle(activeChat?.title || "Новый чат");
                  setIsEditingTitle(false);
                }
              }}
              autoFocus
            />
          ) : (
            <button
              type="button"
              className="chat-title-button"
              onClick={() => activeChat && setIsEditingTitle(true)}
              disabled={!activeChat}
              title="Переименовать чат"
            >
              {activeChat?.title || "Новый чат"}
            </button>
          )}
        </div>
      </div>
      <MessageList />
      {error && <div className="error-message">{error}</div>}
      <MessageInput />
    </div>
  );
}
