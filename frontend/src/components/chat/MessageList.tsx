import React from "react";
import { useChat, Message } from "../../context/ChatContext";

function renderInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    const match = part.match(/^\*\*(.+)\*\*$/);
    if (match) {
      return <strong key={index}>{match[1]}</strong>;
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

function renderMessageContent(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];
  let listType: "ul" | "ol" | null = null;

  const flushList = () => {
    if (!listType) return;
    const list =
      listType === "ol" ? (
        <ol key={`list-${elements.length}`}>{listItems}</ol>
      ) : (
        <ul key={`list-${elements.length}`}>{listItems}</ul>
      );
    elements.push(list);
    listItems = [];
    listType = null;
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    const unorderedMatch = /^[-*]\s+(.*)$/.exec(trimmed);
    const orderedMatch = /^(\d+)\.\s+(.*)$/.exec(trimmed);

    if (unorderedMatch || orderedMatch) {
      const type = orderedMatch ? "ol" : "ul";
      const text = (orderedMatch?.[2] ?? unorderedMatch?.[1] ?? "").trim();
      if (!listType) {
        listType = type;
      }
      if (listType !== type) {
        flushList();
        listType = type;
      }
      listItems.push(<li key={`li-${index}`}>{renderInlineMarkdown(text)}</li>);
    } else {
      if (trimmed === "" && listType) {
        return;
      }
      flushList();
      if (trimmed === "") {
        elements.push(<br key={`br-${index}`} />);
      } else {
        elements.push(<p key={`p-${index}`}>{renderInlineMarkdown(line)}</p>);
      }
    }
  });

  flushList();
  return <>{elements}</>;
}

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
            <div className="message-content">
              {renderMessageContent(message.content)}
            </div>
          </div>
        ))
      )}

      {isGenerating && (
        <div className="message message-assistant message-pending">
          <div className="message-author">Ассистент</div>
          <div className="message-content pending-response">
            <span>Ожидаем ответ...</span>
            <span className="spinner" aria-label="Загрузка" />
          </div>
        </div>
      )}
    </div>
  );
}
