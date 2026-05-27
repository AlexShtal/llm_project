import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";

export function SettingsModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const { user } = useAuth();
  const { loadModels } = useChat();
  const [modelName, setModelName] = useState("");
  const [provider, setProvider] = useState("openai-compatible");
  const [apiOrIP, setApiOrIP] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAddModel = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("llm-token");
      const response = await fetch("http://localhost:3000/user/add-model", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: modelName,
          apiOrIP,
          provider,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add model");
      }

      setModelName("");
      setApiOrIP("");
      setProvider("openai-compatible");
      await loadModels();
      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Настройки</h2>
          <button onClick={onClose} className="settings-close">
            х
          </button>
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <h3>Добавить новую модель</h3>
            <form onSubmit={handleAddModel} className="model-form">
              <div className="form-group">
                <label>Имя модели</label>
                <input
                  type="text"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="e.g., GPT-4, Claude, Mistral"
                  required
                />
              </div>

              <div className="form-group">
                <label>Провайдер</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                >
                  <option value="openai-compatible">OpenAI Compatible</option>
                  <option value="yandex-gpt">Yandex GPT</option>
                  <option value="ollama">Ollama</option>
                  <option value="local">Local LLM</option>
                </select>
              </div>

              <div className="form-group">
                <label>Endpoint / API URL / IP</label>
                <input
                  type="text"
                  value={apiOrIP}
                  onChange={(e) => setApiOrIP(e.target.value)}
                  placeholder="https://api.openai.com/v1 or localhost:11434"
                  required
                />
              </div>

              {error && <div className="form-error">{error}</div>}

              <button type="submit" disabled={loading} className="form-submit">
                {loading ? "Adding..." : "Добавить"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
