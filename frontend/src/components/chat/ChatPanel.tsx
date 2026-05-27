import React from "react";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { useChat } from "../../context/ChatContext";

export function ChatPanel() {
  const { activeChat, isLoadingChats } = useChat();

  if (isLoadingChats) {
    return <div className="chat-panel">Загрузка чатов...</div>;
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <h2>{activeChat?.title || "New Chat"}</h2>
      </div>
      <MessageList />
      <MessageInput />
    </div>
  );
}
