import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

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
  description?: string;
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
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [currentModelId, setCurrentModelId] = useState<number | null>(null);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const loadChats = useCallback(async () => {
    if (!token) return;
    setIsLoadingChats(true);
    try {
      const response = await fetch("http://localhost:3000/ai/chats", {
        headers,
      });
      if (response.ok) {
        const data = await response.json();
        setChats(data);
      }
    } catch (err) {
      setError("Failed to load chats");
    } finally {
      setIsLoadingChats(false);
    }
  }, [token]);

  const loadModels = useCallback(async () => {
    if (!token) return;
    setIsLoadingModels(true);
    try {
      const response = await fetch("http://localhost:3000/user/my-models", {
        headers,
      });
      if (response.ok) {
        const data = await response.json();
        setModels(data.models || []);
        if (data.currentModelId) {
          setCurrentModelId(data.currentModelId);
        }
      }
    } catch (err) {
      setError("Failed to load models");
    } finally {
      setIsLoadingModels(false);
    }
  }, [token]);

  useEffect(() => {
    loadModels();
  }, [token, loadModels]);

  const createChat = useCallback(
    async (title?: string): Promise<Chat> => {
      if (!token) throw new Error("Not authenticated");
      const response = await fetch("http://localhost:3000/ai/chats", {
        method: "POST",
        headers,
        body: JSON.stringify({ title }),
      });
      if (!response.ok) throw new Error("Failed to create chat");
      const chat = await response.json();
      setChats((prev) => [chat, ...prev]);
      return chat;
    },
    [token],
  );

  const deleteChat = useCallback(
    async (chatId: number) => {
      if (!token) throw new Error("Not authenticated");
      const response = await fetch(`http://localhost:3000/ai/chats/${chatId}`, {
        method: "DELETE",
        headers,
      });
      if (!response.ok) throw new Error("Failed to delete chat");
      setChats((prev) => prev.filter((c) => c.id !== chatId));
      if (activeChat?.id === chatId) {
        setActiveChat(null);
      }
    },
    [token, activeChat],
  );

  const updateChatTitle = useCallback(
    async (chatId: number, title: string) => {
      if (!token) throw new Error("Not authenticated");
      const response = await fetch(`http://localhost:3000/ai/chats/${chatId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ title }),
      });
      if (!response.ok) throw new Error("Failed to update chat");
      const updated = await response.json();
      setChats((prev) =>
        prev.map((c) => (c.id === chatId ? { ...c, title: updated.title } : c)),
      );
      if (activeChat?.id === chatId) {
        setActiveChat({ ...activeChat, title: updated.title });
      }
    },
    [token, activeChat],
  );

  const generateResponse = useCallback(
    async (prompt: string, chatId?: number) => {
      if (!token || !currentModelId) return;
      setIsGenerating(true);
      setError(null);
      try {
        const response = await fetch("http://localhost:3000/ai/generate", {
          method: "POST",
          headers,
          body: JSON.stringify({
            prompt,
            chatId,
            modelId: currentModelId,
          }),
        });
        if (!response.ok) throw new Error("Failed to generate response");
        const data = await response.json();
        setActiveChat(data.chat);
        setChats((prev) =>
          prev.map((c) => (c.id === data.chat.id ? data.chat : c)),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsGenerating(false);
      }
    },
    [token, currentModelId],
  );

  const setCurrentModel = useCallback(
    async (modelId: number) => {
      if (!token) return;
      setCurrentModelId(modelId);
      try {
        await fetch("http://localhost:3000/user/set-current-model", {
          method: "POST",
          headers,
          body: JSON.stringify({ modelId }),
        });
      } catch (err) {
        setError("Failed to set current model");
      }
    },
    [token],
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
        setCurrentModel,
        setError,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
}
