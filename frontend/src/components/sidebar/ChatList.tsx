import React from "react";
import { useChat, Chat } from "../../context/ChatContext";

export function ChatList() {
  const { chats, activeChat, setActiveChat, deleteChat, createChat } =
    useChat();

  const handleNewChat = async () => {
    const chat = await createChat();
    setActiveChat(chat);
  };

  return (
    <div className="chat-list">
      <button onClick={handleNewChat} className="new-chat-button">
        + Новый чат
      </button>

      <div className="chat-list-items">
        {chats.map((chat: Chat) => (
          <div
            key={chat.id}
            className={`chat-item ${activeChat?.id === chat.id ? "active" : ""}`}
          >
            <button
              onClick={() => setActiveChat(chat)}
              className="chat-item-button"
            >
              {chat.title}
            </button>
            <button
              onClick={() => deleteChat(chat.id)}
              className="chat-item-delete"
              aria-label="Удалить чат"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
