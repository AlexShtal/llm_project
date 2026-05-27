import React, { useState } from "react";
import { useChat } from "../../context/ChatContext";

export function MessageInput() {
  const { generateResponse, isGenerating, activeChat, currentModelId, models } =
    useChat();
  const [prompt, setPrompt] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating || !currentModelId) return;

    await generateResponse(prompt, activeChat?.id);
    setPrompt("");
  };

  const isDisabled = isGenerating || !currentModelId || models.length === 0;

  return (
    <form onSubmit={handleSubmit} className="message-input-form">
      <div className="message-input-container">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={
            isDisabled ? "Сначала добавьте модель..." : "Задайте вопрос..."
          }
          disabled={isDisabled}
          className="message-input"
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e as any);
            }
          }}
        />
        <button
          type="submit"
          disabled={isDisabled || !prompt.trim()}
          className="message-send-button"
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
