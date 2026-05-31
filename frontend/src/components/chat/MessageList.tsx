import React from "react";
import { useChat, Message } from "../../context/ChatContext";

export function MessageList() {
  const { activeChat } = useChat();

  if (!activeChat) {
    return (
      <div className="message-list-empty">
        <p>Выберите чат или начните новый диалог</p>
      </div>
    );
  }

  return (
    <div className="message-list">
      {activeChat.messages && activeChat.messages.length === 0 ? (
        <div className="message-list-empty">
          <p>Сообщений пока нет. Начните диалог.</p>
        </div>
      ) : (
        activeChat.messages?.map((message: Message) => (
          <div key={message.id} className={`message message-${message.role}`}>
            <div className="message-author">
              {message.role === "user" ? "Вы" : "Ассистент"}
            </div>
            <div className="message-content">{message.content}</div>
          </div>
        ))
      )}
    </div>
  );
}
