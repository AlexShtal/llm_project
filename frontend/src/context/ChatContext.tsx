import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  ApiChat,
  ApiMessage,
  ModelInfo,
  createChat as createChatRequest,
  deleteChat as deleteChatRequest,
  generateText,
  getChats,
  getMyModels,
  setCurrentModel as setCurrentModelRequest,
  updateChat as updateChatRequest,
} from "../api";

export interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface Chat {
  id: number;
  title: string;
  createdAt: string;
  messages: Message[];
}

export interface Model {
  id: number;
  name: string;
  description?: string | null;
  provider: string;
  apiOrIP: string;
}

interface ChatContextType {
  chats: Chat[];
  activeChat: Chat | null;
  models: Model[];
  currentModelId: number | null;
  isLoadingChats: boolean;
  isLoadingModels: boolean;
  isGenerating: boolean;
  error: string | null;
  loadChats: () => Promise<void>;
  loadModels: () => Promise<void>;
  createChat: (title?: string) => Promise<Chat>;
  deleteChat: (chatId: number) => Promise<void>;
  updateChatTitle: (chatId: number, title: string) => Promise<void>;
  setActiveChat: (chat: Chat | null) => void;
  generateResponse: (prompt: string, chatId?: number) => Promise<void>;
  appendUserMessage: (content: string, chatId?: number) => void;
  setCurrentModel: (modelId: number) => Promise<void>;
  setError: (error: string | null) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({
  children,
  token,
}: {
  children: React.ReactNode;
  token: string | null;
}) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChatState] = useState<Chat | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [currentModelId, setCurrentModelId] = useState<number | null>(null);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setActiveChat = useCallback((chat: Chat | null) => {
    setActiveChatState(chat);
    setError(null);
  }, []);

  const appendUserMessage = useCallback(
    (content: string, chatId?: number) => {
      const tempId = -Date.now();
      const tempMessage: Message = {
        id: tempId,
        role: "user",
        content,
        createdAt: new Date().toISOString(),
      };

      setActiveChatState((chat) => {
        if (chat && chat.id === chatId) {
          const updated = {
            ...chat,
            messages: [...chat.messages, tempMessage],
          };
          setChats((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
          return updated;
        }

        if (!chat && !chatId) {
          const tempChat: Chat = {
            id: tempId,
            title: "Новый чат",
            createdAt: new Date().toISOString(),
            messages: [tempMessage],
          };
          setChats((prev) => [tempChat, ...prev]);
          return tempChat;
        }

        return chat;
      });
    },
    [],
  );

  const persistCurrentModel = useCallback(
    async (modelId: number) => {
      if (!token) return;
      setCurrentModelId(modelId);
      try {
        await setCurrentModelRequest(token, modelId);
      } catch {
        // The UI can still use the model id for this session.
      }
    },
    [token],
  );

  const loadChats = useCallback(async () => {
    if (!token) return;
    setIsLoadingChats(true);
    try {
      const data = await getChats(token);
      setChats(data.map(mapChat));
    } catch (err) {
      setError(getErrorMessage(err, "Не удалось загрузить чаты."));
    } finally {
      setIsLoadingChats(false);
    }
  }, [token]);

  const loadModels = useCallback(async () => {
    if (!token) return;
    setIsLoadingModels(true);
    try {
      const data = await getMyModels(token);
      const nextModels = (data.models || []).map(mapModel);
      const nextCurrentModelId =
        data.currentModelId ?? data.currentModel?.id ?? nextModels[0]?.id ?? null;

      setModels(nextModels);
      setCurrentModelId(nextCurrentModelId);

      if (!data.currentModelId && nextCurrentModelId) {
        await persistCurrentModel(nextCurrentModelId);
      }
    } catch (err) {
      setError(getErrorMessage(err, "Не удалось загрузить модели."));
    } finally {
      setIsLoadingModels(false);
    }
  }, [token, persistCurrentModel]);

  useEffect(() => {
    if (!token) {
      setChats([]);
      setActiveChatState(null);
      setModels([]);
      setCurrentModelId(null);
      return;
    }

    loadModels();
  }, [token, loadModels]);

  const createChat = useCallback(
    async (title?: string): Promise<Chat> => {
      if (!token) throw new Error("Нужно войти в аккаунт.");
      const chat = mapChat(await createChatRequest(token, title));
      setChats((prev) => [chat, ...prev]);
      return chat;
    },
    [token],
  );

  const deleteChat = useCallback(
    async (chatId: number) => {
      if (!token) throw new Error("Нужно войти в аккаунт.");
      await deleteChatRequest(token, chatId);
      setChats((prev) => prev.filter((chat) => chat.id !== chatId));
      setActiveChatState((chat) => (chat?.id === chatId ? null : chat));
    },
    [token],
  );

  const updateChatTitle = useCallback(
    async (chatId: number, title: string) => {
      const cleanTitle = title.trim();
      if (!token || !cleanTitle) return;

      const updated = mapChat(await updateChatRequest(token, chatId, cleanTitle));
      setChats((prev) =>
        prev.map((chat) => (chat.id === chatId ? updated : chat)),
      );
      setActiveChatState((chat) => (chat?.id === chatId ? updated : chat));
    },
    [token],
  );

  const generateResponse = useCallback(
    async (prompt: string, chatId?: number) => {
      if (!token) return;

      const modelId = currentModelId ?? models[0]?.id ?? null;
      if (!modelId) {
        setError("Сначала добавьте и выберите модель.");
        return;
      }

      if (!currentModelId) {
        persistCurrentModel(modelId);
      }

      setIsGenerating(true);
      setError(null);
      try {
        const data = await generateText(prompt, token, chatId, modelId);
        const chat = mapChat(data.chat);
        setActiveChatState(chat);
        setChats((prev) => {
          const exists = prev.some((item) => item.id === chat.id);
          return exists
            ? prev.map((item) => (item.id === chat.id ? chat : item))
            : [chat, ...prev];
        });
      } catch (err) {
        setError(getErrorMessage(err, "Не удалось получить ответ от модели."));
      } finally {
        setIsGenerating(false);
      }
    },
    [token, currentModelId, models, persistCurrentModel],
  );

  const setCurrentModel = useCallback(
    async (modelId: number) => {
      if (!token) return;

      const previousModelId = currentModelId;
      setCurrentModelId(modelId);
      setError(null);

      try {
        await setCurrentModelRequest(token, modelId);
      } catch (err) {
        setCurrentModelId(previousModelId);
        setError(getErrorMessage(err, "Не удалось выбрать модель."));
      }
    },
    [token, currentModelId],
  );

  return (
    <ChatContext.Provider
      value={{
        chats,
        activeChat,
        models,
        currentModelId,
        isLoadingChats,
        isLoadingModels,
        isGenerating,
        error,
        loadChats,
        loadModels,
        createChat,
        deleteChat,
        updateChatTitle,
        setActiveChat,
        generateResponse,
        appendUserMessage,
        setCurrentModel,
        setError,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

function mapChat(chat: ApiChat): Chat {
  return {
    id: chat.id,
    title: chat.title?.trim() || "Новый чат",
    createdAt: chat.createdAt,
    messages: (chat.messages || []).map(mapMessage),
  };
}

function mapMessage(message: ApiMessage): Message {
  return {
    id: message.id,
    role: message.role === "USER" ? "user" : "assistant",
    content: message.content,
    createdAt: message.createdAt,
  };
}

function mapModel(model: ModelInfo): Model {
  return {
    id: model.id,
    name: model.name,
    description: model.description,
    provider: model.provider,
    apiOrIP: model.apiOrIP,
  };
}

function getErrorMessage(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
}
