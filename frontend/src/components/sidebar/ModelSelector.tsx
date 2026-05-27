import React from "react";
import { useChat, Model } from "../../context/ChatContext";

export function ModelSelector() {
  const { models, currentModelId, setCurrentModel, isLoadingModels } =
    useChat();

  if (isLoadingModels) {
    return <div className="model-selector">Loading models...</div>;
  }

  if (models.length === 0) {
    return (
      <div className="model-selector">
        <label>Model:</label>
        <select disabled className="model-select">
          <option>No models available</option>
        </select>
      </div>
    );
  }

  return (
    <div className="model-selector">
      <label htmlFor="model-select">Model:</label>
      <select
        id="model-select"
        value={currentModelId || ""}
        onChange={(e) => setCurrentModel(Number(e.target.value))}
        className="model-select"
      >
        {models.map((model: Model) => (
          <option key={model.id} value={model.id}>
            {model.name} ({model.provider})
          </option>
        ))}
      </select>
    </div>
  );
}
