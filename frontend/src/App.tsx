import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  addModel,
  deleteUser,
  generateText,
  getMyModels,
  getProfile,
  login,
  ModelInfo,
  register,
  setCurrentModel,
  UserProfile,
} from "./api";

type ChatMessage = {
  id: number;
  role: "assistant" | "user";
  text: string;
};

type Chat = {
  id: number;
  title: string;
  messages: ChatMessage[];
};

const welcomeMessage: ChatMessage = {
  id: 1,
  role: "assistant",
  text: "Привет! Я интерфейс для твоего LLM backend. Выбери модель в настройках и напиши сообщение.",
};

const examplePrompts = [
  "Объясни простыми словами, как работает трансформерная модель.",
  "Составь план дипломной работы про LLM-приложение.",
  "Помоги улучшить промпт для генерации технического текста.",
];

const defaultChat: Chat = {
  id: 1,
  title: "Новый чат",
  messages: [welcomeMessage],
};

export function App() {
  const [token, setToken] = useState(
    () => localStorage.getItem("llm-token") ?? "",
  );
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [currentModelId, setCurrentModelId] = useState<number | null>(null);
  const [chats, setChats] = useState<Chat[]>([defaultChat]);
  const [activeChatId, setActiveChatId] = useState(defaultChat.id);
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState("");
  const [settingsError, setSettingsError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authForm, setAuthForm] = useState({
    email: "",
    username: "",
    password: "",
  });
  const [newModel, setNewModel] = useState({
    name: "",
    apiOrIP: "",
    description: "",
  });

  const activeChat = useMemo(
    () => chats.find((chat) => chat.id === activeChatId) ?? chats[0],
    [activeChatId, chats],
  );
  const canSend = prompt.trim().length > 0 && !isLoading && Boolean(token);
  const selectedModel = models.find((model) => model.id === currentModelId);

  useEffect(() => {
    if (!token) {
      return;
    }

    loadUserData(token).catch((requestError) => {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Не удалось загрузить пользователя",
      );
      handleLogout();
    });
  }, [token]);

  async function loadUserData(activeToken = token) {
    const [profileData, modelsData] = await Promise.all([
      getProfile(activeToken),
      getMyModels(activeToken),
    ]);

    setProfile(profileData);
    setModels(modelsData.models);
    setCurrentModelId(modelsData.currentModelId);
  }

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      if (authMode === "register") {
        await register(authForm.email, authForm.username, authForm.password);
      }

      const authData = await login(authForm.email, authForm.password);
      localStorage.setItem("llm-token", authData.token);
      setToken(authData.token);
      setProfile(authData.existingUser);
      setAuthForm({ email: "", username: "", password: "" });
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : "Ошибка входа",
      );
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = prompt.trim();
    if (!text || isLoading || !token) {
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      text,
    };

    updateActiveChat((chat) => ({
      ...chat,
      title: chat.messages.some((message) => message.role === "user")
        ? chat.title
        : text.slice(0, 42),
      messages: [...chat.messages, userMessage],
    }));
    setPrompt("");
    setError("");
    setIsLoading(true);

    try {
      const answer = await generateText(text, token);
      const assistantMessage: ChatMessage = {
        id: Date.now() + 1,
        role: "assistant",
        text: answer,
      };

      updateActiveChat((chat) => ({
        ...chat,
        messages: [...chat.messages, assistantMessage],
      }));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Не удалось выполнить запрос",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function updateActiveChat(updater: (chat: Chat) => Chat) {
    setChats((currentChats) =>
      currentChats.map((chat) =>
        chat.id === activeChatId ? updater(chat) : chat,
      ),
    );
  }

  function startNewChat() {
    const chat: Chat = {
      id: Date.now(),
      title: "Новый чат",
      messages: [{ ...welcomeMessage, id: Date.now() + 1 }],
    };

    setChats((currentChats) => [chat, ...currentChats]);
    setActiveChatId(chat.id);
    setPrompt("");
    setError("");
  }

  function useExamplePrompt(example: string) {
    setPrompt(example);
    setError("");
  }

  function handleLogout() {
    localStorage.removeItem("llm-token");
    setToken("");
    setProfile(null);
    setModels([]);
    setCurrentModelId(null);
    setIsSettingsOpen(false);
  }

  async function handleModelChange(modelId: number) {
    setSettingsError("");

    try {
      const updatedUser = await setCurrentModel(token, modelId);
      setCurrentModelId(modelId);
      setProfile(updatedUser);
    } catch (requestError) {
      setSettingsError(
        requestError instanceof Error
          ? requestError.message
          : "Не удалось изменить модель",
      );
    }
  }

  async function handleAddModel(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSettingsError("");

    try {
      await addModel(token, {
        name: newModel.name,
        apiOrIP: newModel.apiOrIP,
        description: newModel.description || undefined,
      });
      setNewModel({ name: "", apiOrIP: "", description: "" });
      await loadUserData();
    } catch (requestError) {
      setSettingsError(
        requestError instanceof Error
          ? requestError.message
          : "Не удалось добавить модель",
      );
    }
  }

  async function handleDeleteUser() {
    const confirmed = window.confirm(
      "Удалить пользователя? Это действие нельзя отменить.",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteUser(token);
      handleLogout();
      setChats([defaultChat]);
      setActiveChatId(defaultChat.id);
    } catch (requestError) {
      setSettingsError(
        requestError instanceof Error
          ? requestError.message
          : "Не удалось удалить пользователя",
      );
    }
  }

  if (!token) {
    return (
      <main className="auth-screen">
        <section className="auth-panel" aria-label="Авторизация">
          <div className="auth-brand">
            <span className="brand-mark">AI</span>
            <div>
              <strong>LLM Project</strong>
              <span>Чат-интерфейс для backend</span>
            </div>
          </div>

          <form className="auth-form" onSubmit={handleAuthSubmit}>
            <h1>{authMode === "login" ? "Вход" : "Регистрация"}</h1>
            <label>
              Email
              <input
                type="email"
                value={authForm.email}
                onChange={(event) =>
                  setAuthForm({ ...authForm, email: event.target.value })
                }
                required
              />
            </label>
            {authMode === "register" && (
              <label>
                Имя
                <input
                  value={authForm.username}
                  onChange={(event) =>
                    setAuthForm({ ...authForm, username: event.target.value })
                  }
                  required
                />
              </label>
            )}
            <label>
              Пароль
              <input
                type="password"
                value={authForm.password}
                onChange={(event) =>
                  setAuthForm({ ...authForm, password: event.target.value })
                }
                required
              />
            </label>
            {error && <p className="error-message">{error}</p>}
            <button type="submit">
              {authMode === "login" ? "Войти" : "Создать аккаунт"}
            </button>
          </form>

          <button
            className="link-button"
            type="button"
            onClick={() =>
              setAuthMode(authMode === "login" ? "register" : "login")
            }
          >
            {authMode === "login"
              ? "Создать нового пользователя"
              : "Уже есть аккаунт"}
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Навигация по чатам">
        <div className="brand">
          <span className="brand-mark">AI</span>
          <div>
            <strong>LLM Project</strong>
            <span>{selectedModel?.name ?? "Модель не выбрана"}</span>
          </div>
        </div>

        <button
          className="new-chat-button"
          type="button"
          onClick={startNewChat}
        >
          <span aria-hidden="true">+</span>
          Новый чат
        </button>

        <nav className="chat-list" aria-label="Список чатов">
          {chats.map((chat) => (
            <button
              className={
                chat.id === activeChatId ? "chat-item active" : "chat-item"
              }
              key={chat.id}
              type="button"
              onClick={() => setActiveChatId(chat.id)}
            >
              <span>{chat.title}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          {isSettingsOpen && (
            <section className="settings-panel" aria-label="Настройки">
              <div className="settings-heading">
                <strong>Настройки</strong>
                <button
                  type="button"
                  aria-label="Закрыть настройки"
                  onClick={() => setIsSettingsOpen(false)}
                >
                  ?
                </button>
              </div>

              <label>
                Модель
                <select
                  value={currentModelId ?? ""}
                  onChange={(event) =>
                    handleModelChange(Number(event.target.value))
                  }
                  disabled={models.length === 0}
                >
                  <option value="" disabled>
                    {models.length === 0 ? "Нет моделей" : "Выберите модель"}
                  </option>
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))}
                </select>
              </label>

              <form className="model-form" onSubmit={handleAddModel}>
                <label>
                  Новая модель
                  <input
                    value={newModel.name}
                    onChange={(event) =>
                      setNewModel({ ...newModel, name: event.target.value })
                    }
                    placeholder="Название"
                    required
                  />
                </label>
                <input
                  value={newModel.apiOrIP}
                  onChange={(event) =>
                    setNewModel({ ...newModel, apiOrIP: event.target.value })
                  }
                  placeholder="API или IP"
                  required
                />
                <input
                  value={newModel.description}
                  onChange={(event) =>
                    setNewModel({
                      ...newModel,
                      description: event.target.value,
                    })
                  }
                  placeholder="Описание"
                />
                <button type="submit">Добавить</button>
              </form>

              {settingsError && (
                <p className="settings-error">{settingsError}</p>
              )}

              <button
                className="danger-button"
                type="button"
                onClick={handleDeleteUser}
              >
                Удалить пользователя
              </button>
              <button
                className="secondary-button"
                type="button"
                onClick={handleLogout}
              >
                Выйти
              </button>
            </section>
          )}

          <button
            className="user-button"
            type="button"
            onClick={() => setIsSettingsOpen((isOpen) => !isOpen)}
          >
            <span className="user-avatar" aria-hidden="true">
              {(profile?.username ?? profile?.email ?? "U")
                .slice(0, 1)
                .toUpperCase()}
            </span>
            <span>
              <strong>{profile?.username ?? "Пользователь"}</strong>
              <small>{profile?.email}</small>
            </span>
          </button>
        </div>
      </aside>

      <section className="chat-panel" aria-label="Чат с языковой моделью">
        <header className="chat-header">
          <button
            className="mobile-new-chat"
            type="button"
            onClick={startNewChat}
          >
            +
          </button>
          <div>
            <p className="eyebrow">Текущий чат</p>
            <h1>{activeChat.title}</h1>
          </div>
          <span className={isLoading ? "status loading" : "status"}>
            {isLoading ? "Генерация" : "Готов"}
          </span>
        </header>

        <div className="messages" aria-live="polite">
          {activeChat.messages.map((message) => (
            <article className={`message ${message.role}`} key={message.id}>
              <div className="avatar" aria-hidden="true">
                {message.role === "assistant" ? "AI" : "Вы"}
              </div>
              <div className="message-body">
                <p className="message-author">
                  {message.role === "assistant" ? "Ассистент" : "Вы"}
                </p>
                <p>{message.text}</p>
              </div>
            </article>
          ))}

          {isLoading && (
            <article className="message assistant">
              <div className="avatar" aria-hidden="true">
                AI
              </div>
              <div className="message-body">
                <p className="message-author">Ассистент</p>
                <div className="typing" aria-label="Ассистент печатает">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </article>
          )}
        </div>

        <div className="composer-area">
          {activeChat.messages.length === 1 && (
            <div className="suggestions" aria-label="Примеры запросов">
              {examplePrompts.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => useExamplePrompt(example)}
                >
                  {example}
                </button>
              ))}
            </div>
          )}

          {error && <p className="error-message">{error}</p>}

          <form className="composer" onSubmit={handleSubmit}>
            <label className="visually-hidden" htmlFor="prompt">
              Сообщение для модели
            </label>
            <textarea
              id="prompt"
              name="prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Напишите сообщение..."
              rows={1}
              disabled={isLoading}
            />
            <button type="submit" disabled={!canSend} aria-label="Отправить">
              <span aria-hidden="true">?</span>
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
