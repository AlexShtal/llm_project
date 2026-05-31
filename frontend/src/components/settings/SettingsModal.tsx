import React, { useState } from "react";
import { addModel } from "../../api";
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
  const { loadModels, setCurrentModel } = useChat();
  const [modelName, setModelName] = useState("");
  const [provider, setProvider] = useState("openai-compatible");
  const [apiOrIP, setApiOrIP] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAddModel = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("llm-token");
      if (!token) {
        throw new Error("Сессия истекла. Войдите снова.");
      }

      const model = await addModel(token, {
        name: modelName.trim(),
        apiOrIP: apiOrIP.trim(),
        provider,
        apiKey: apiKey.trim() || undefined,
      });

      setModelName("");
      setApiOrIP("");
      setApiKey("");
      setProvider("openai-compatible");
      await loadModels();
      await setCurrentModel(model.id);

      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось добавить модель.",
      );
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
            ×
          </button>
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <h3>Добавить новую модель</h3>
            <form onSubmit={handleAddModel} className="model-form">
              <div className="form-group">
                <label>Название модели</label>
                <input
                  type="text"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="Например: gpt-4o-mini, qwen2.5"
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
                  placeholder="https://api.openai.com/v1"
                  required
                />
              </div>

              <div className="form-group">
                <label>API key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  autoComplete="off"
                />
              </div>

              {error && <div className="form-error">{error}</div>}

              <button type="submit" disabled={loading} className="form-submit">
                {loading ? "Добавляем..." : "Добавить"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
