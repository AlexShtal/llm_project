import React, { useState } from "react";
import { useChat } from "../../context/ChatContext";

export function MessageInput() {
  const {
    generateResponse,
    appendUserMessage,
    isGenerating,
    activeChat,
    currentModelId,
    models,
  } = useChat();
  const [prompt, setPrompt] = useState("");
  const hasUsableModel = Boolean(currentModelId ?? models[0]?.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating || !hasUsableModel) return;

    appendUserMessage(prompt, activeChat?.id);
    setPrompt("");
    await generateResponse(prompt, activeChat?.id);
  };

  const isDisabled = isGenerating || !hasUsableModel;

  return (
    <form onSubmit={handleSubmit} className="message-input-form">
      <div className="message-input-container">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={
            hasUsableModel
              ? "Задайте вопрос..."
              : "Сначала добавьте и выберите модель"
          }
          disabled={isDisabled}
          className="message-input"
        />
        <button
          type="submit"
          disabled={isDisabled || !prompt.trim()}
          className="message-send-button"
          aria-label="Отправить сообщение"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M1 8l14-7-7 14-1-8z" />
          </svg>
        </button>
      </div>
    </form>
  );
}
