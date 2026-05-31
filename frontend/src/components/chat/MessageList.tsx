import React from "react";
import { useChat, Message } from "../../context/ChatContext";

export function MessageList() {
  const { activeChat, isGenerating } = useChat();

  if (!activeChat) {
    return (
      <div className="message-list-empty">
        <p>Выберите чат или начните новый диалог</p>
      </div>
    );
  }

  const hasMessages = activeChat.messages && activeChat.messages.length > 0;

  return (
    <div className="message-list">
      {!hasMessages && !isGenerating ? (
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

      {isGenerating && (
        <div className="message message-assistant message-pending">
          <div className="message-author">АсѨистент</div>
          <div className="message-content pending-response">
            <span>Ожидаем ответ...</span>
            <span className="spinner" aria-label="Загрузка" />
          </div>
        </div>
      )}
    </div>
  );
}
