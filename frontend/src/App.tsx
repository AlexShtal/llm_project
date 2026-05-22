import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, FormEvent, PointerEvent } from "react";
import {
  addModel,
  ApiChat,
  createChat,
  deleteChat,
  deleteModel,
  deleteUser,
  generateText,
  getChats,
  getMyModels,
  getProfile,
  login,
  ModelInfo,
  register,
  setCurrentModel,
  updateChat,
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
  updatedAt?: string;
};

const welcomeMessage: ChatMessage = {
  id: 0,
  role: "assistant",
  text: "Привет! Выбери модель в настройках и напиши сообщение. Чаты теперь сохраняются на сервере.",
};

const examplePrompts = [
  "Объясни простыми словами, как работает трансформерная модель.",
  "Составь план дипломной работы про LLM-приложение.",
  "Помоги улучшить промпт для генерации технического текста.",
];

export function App() {
  const [token, setToken] = useState(
    () => localStorage.getItem("llm-token") ?? "",
  );
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [currentModelId, setCurrentModelId] = useState<number | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState("");
  const [settingsError, setSettingsError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(300);
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
    () => chats.find((chat) => chat.id === activeChatId) ?? chats[0] ?? null,
    [activeChatId, chats],
  );
  const activeMessages =
    activeChat && activeChat.messages.length > 0
      ? activeChat.messages
      : [welcomeMessage];
  const canSend =
    prompt.trim().length > 0 &&
    !isLoading &&
    Boolean(token) &&
    Boolean(activeChat);
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
    const [profileData, modelsData, chatData] = await Promise.all([
      getProfile(activeToken),
      getMyModels(activeToken),
      getChats(activeToken),
    ]);

    const mappedChats = chatData.map(mapApiChat);
    setProfile(profileData);
    setModels(modelsData.models);
    setCurrentModelId(modelsData.currentModelId);

    if (mappedChats.length > 0) {
      setChats(mappedChats);
      setActiveChatId((currentId) =>
        currentId && mappedChats.some((chat) => chat.id === currentId)
          ? currentId
          : mappedChats[0].id,
      );
      return;
    }

    const firstChat = mapApiChat(await createChat(activeToken));
    setChats([firstChat]);
    setActiveChatId(firstChat.id);
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
    if (!text || isLoading || !token || !activeChat) {
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      text,
    };

    updateActiveChat((chat) => ({
      ...chat,
      title: hasUserMessages(chat) ? chat.title : makeTitle(text),
      messages: [...chat.messages, userMessage],
    }));
    setPrompt("");
    setError("");
    setIsLoading(true);

    try {
      const result = await generateText(
        text,
        token,
        activeChat.id,
        currentModelId,
      );
      upsertChat(mapApiChat(result.chat));
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

  function upsertChat(chat: Chat) {
    setChats((currentChats) => {
      const exists = currentChats.some(
        (currentChat) => currentChat.id === chat.id,
      );
      const nextChats = exists
        ? currentChats.map((currentChat) =>
            currentChat.id === chat.id ? chat : currentChat,
          )
        : [chat, ...currentChats];

      return nextChats.sort((a, b) =>
        String(b.updatedAt ?? "").localeCompare(String(a.updatedAt ?? "")),
      );
    });
    setActiveChatId(chat.id);
  }

  async function startNewChat() {
    if (!token || isCreatingChat) {
      return;
    }

    setIsCreatingChat(true);
    setError("");

    try {
      const chat = mapApiChat(await createChat(token));
      setChats((currentChats) => [chat, ...currentChats]);
      setActiveChatId(chat.id);
      setPrompt("");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Не удалось создать чат",
      );
    } finally {
      setIsCreatingChat(false);
    }
  }

  async function handleDeleteChat(chatId: number) {
    if (!token) {
      return;
    }

    try {
      await deleteChat(token, chatId);
      const remainingChats = chats.filter((chat) => chat.id !== chatId);

      if (remainingChats.length === 0) {
        const nextChat = mapApiChat(await createChat(token));
        setChats([nextChat]);
        setActiveChatId(nextChat.id);
        return;
      }

      setChats(remainingChats);
      if (activeChatId === chatId) {
        setActiveChatId(remainingChats[0].id);
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Не удалось удалить чат",
      );
    }
  }

  async function handleRenameChat() {
    if (!token || !activeChat) {
      return;
    }

    const title = window
      .prompt("Новое название чата", activeChat.title)
      ?.trim();
    if (!title || title === activeChat.title) {
      return;
    }

    try {
      const updated = mapApiChat(await updateChat(token, activeChat.id, title));
      upsertChat(updated);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Не удалось переименовать чат",
      );
    }
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
    setChats([]);
    setActiveChatId(null);
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
        name: newModel.name.trim(),
        apiOrIP: newModel.apiOrIP.trim(),
        description: newModel.description.trim() || undefined,
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

  async function handleDeleteModel(modelId: number) {
    setSettingsError("");

    try {
      await deleteModel(token, modelId);
      await loadUserData();
    } catch (requestError) {
      setSettingsError(
        requestError instanceof Error
          ? requestError.message
          : "Не удалось удалить модель",
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
    } catch (requestError) {
      setSettingsError(
        requestError instanceof Error
          ? requestError.message
          : "Не удалось удалить пользователя",
      );
    }
  }

  function handleSidebarResizeStart(event: PointerEvent<HTMLDivElement>) {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = sidebarWidth;

    function handlePointerMove(moveEvent: globalThis.PointerEvent) {
      const nextWidth = Math.min(
        460,
        Math.max(220, startWidth + moveEvent.clientX - startX),
      );
      setSidebarWidth(nextWidth);
    }

    function handlePointerUp() {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
    }

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("pointerup", handlePointerUp);
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
    <main
      className="app-shell"
      style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}
    >
      <aside className="sidebar" aria-label="Навигация по чатам">
        <div className="brand">
          <span className="brand-mark">AI</span>
          <div>
            <strong>LLM Project</strong>
            <span title={selectedModel?.name ?? "Модель не выбрана"}>
              {selectedModel?.name ?? "Модель не выбрана"}
            </span>
          </div>
        </div>

        <button
          className="new-chat-button"
          type="button"
          onClick={startNewChat}
          disabled={isCreatingChat}
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
              title={chat.title}
            >
              <span>{chat.title}</span>
              <span
                className="chat-delete"
                role="button"
                tabIndex={0}
                aria-label="Удалить чат"
                onClick={(event) => {
                  event.stopPropagation();
                  void handleDeleteChat(chat.id);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    event.stopPropagation();
                    void handleDeleteChat(chat.id);
                  }
                }}
              >
                x
              </span>
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
                  x
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

              {models.length > 0 && (
                <div className="model-list" aria-label="Добавленные модели">
                  {models.map((model) => (
                    <div className="model-item" key={model.id}>
                      <span title={model.name}>{model.name}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteModel(model.id)}
                        aria-label={`Удалить модель ${model.name}`}
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <form className="model-form" onSubmit={handleAddModel}>
                <label>
                  Новая модель
                  <input
                    value={newModel.name}
                    onChange={(event) =>
                      setNewModel({ ...newModel, name: event.target.value })
                    }
                    placeholder="Название модели, например llama3"
                    required
                  />
                </label>
                <input
                  value={newModel.apiOrIP}
                  onChange={(event) =>
                    setNewModel({ ...newModel, apiOrIP: event.target.value })
                  }
                  placeholder="http://localhost:11434 или /v1/chat/completions"
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
        <div
          className="sidebar-resizer"
          role="separator"
          aria-orientation="vertical"
          aria-label="Изменить ширину списка чатов"
          onPointerDown={handleSidebarResizeStart}
        />
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
          <div className="chat-title-wrap">
            <p className="eyebrow">Текущий чат</p>
            <h1 title={activeChat?.title}>
              {activeChat?.title ?? "Новый чат"}
            </h1>
          </div>
          <div className="chat-actions">
            <button
              className="secondary-light-button"
              type="button"
              onClick={handleRenameChat}
              disabled={!activeChat}
            >
              Переименовать
            </button>
            <span className={isLoading ? "status loading" : "status"}>
              {isLoading ? "Генерация" : "Готов"}
            </span>
          </div>
        </header>

        <div className="messages" aria-live="polite">
          {activeMessages.map((message) => (
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
          {activeMessages.length === 1 && (
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
              placeholder={
                selectedModel
                  ? "Напишите сообщение..."
                  : "Сначала добавьте и выберите модель в настройках"
              }
              rows={1}
              disabled={isLoading || !activeChat}
            />
            <button type="submit" disabled={!canSend} aria-label="Отправить">
              <span aria-hidden="true">-&gt;</span>
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

function mapApiChat(chat: ApiChat): Chat {
  return {
    id: chat.id,
    title: chat.title?.trim() || "Новый чат",
    updatedAt: chat.updatedAt,
    messages: chat.messages
      .filter(
        (message) => message.role === "USER" || message.role === "ASSISTANT",
      )
      .map((message) => ({
        id: message.id,
        role: message.role === "ASSISTANT" ? "assistant" : "user",
        text: message.content,
      })),
  };
}

function hasUserMessages(chat: Chat) {
  return chat.messages.some((message) => message.role === "user");
}

function makeTitle(text: string) {
  return text.length > 42 ? `${text.slice(0, 42)}...` : text;
}
