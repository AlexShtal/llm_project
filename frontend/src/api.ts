export type UserProfile = {
  id: number;
  email: string;
  username?: string | null;
  avatarUrl?: string | null;
  role?: string;
  currentModel?: ModelInfo | null;
};

export type ModelInfo = {
  id: number;
  name: string;
  apiOrIP: string;
  description?: string | null;
  createdAt?: string;
};

export type ModelsResponse = {
  id: number;
  currentModelId: number | null;
  currentModel: ModelInfo | null;
  models: ModelInfo[];
};

export type ApiMessage = {
  id: number;
  role: "USER" | "ASSISTANT" | "SYSTEM" | "TOOL";
  content: string;
  createdAt: string;
  modelVersion?: string | null;
};

export type ApiChat = {
  id: number;
  title?: string | null;
  createdAt: string;
  updatedAt: string;
  messages: ApiMessage[];
};

export type GenerateResponse = {
  chat: ApiChat;
  userMessage: ApiMessage;
  assistantMessage: ApiMessage;
  response: string;
};

const API_URL = "http://localhost:3000";

function authHeaders(token?: string) {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function parseResponse<T>(response: Response): Promise<T> {
  const responseText = await response.text();
  const data = parseJson(responseText);

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "message" in data
        ? String((data as { message: unknown }).message)
        : `Ошибка запроса: ${response.status}`;

    throw new Error(message);
  }

  return data as T;
}

export async function login(email: string, password: string) {
  return parseResponse<{ token: string; existingUser: UserProfile }>(
    await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ email, password }),
    }),
  );
}

export async function register(
  email: string,
  username: string,
  password: string,
) {
  return parseResponse<UserProfile>(
    await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ email, username, password }),
    }),
  );
}

export async function getProfile(token: string) {
  return parseResponse<UserProfile>(
    await fetch(`${API_URL}/user`, {
      headers: authHeaders(token),
    }),
  );
}

export async function getMyModels(token: string) {
  return parseResponse<ModelsResponse>(
    await fetch(`${API_URL}/user/my-models`, {
      headers: authHeaders(token),
    }),
  );
}

export async function addModel(
  token: string,
  model: { name: string; apiOrIP: string; description?: string },
) {
  return parseResponse<ModelInfo>(
    await fetch(`${API_URL}/user/add-model`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(model),
    }),
  );
}

export async function setCurrentModel(token: string, modelId: number) {
  return parseResponse<UserProfile>(
    await fetch(`${API_URL}/user/set-current-model`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ modelId }),
    }),
  );
}

export async function deleteUser(token: string) {
  return parseResponse<string>(
    await fetch(`${API_URL}/user/delete-user`, {
      method: "DELETE",
      headers: authHeaders(token),
    }),
  );
}

export async function deleteModel(token: string, modelId: number) {
  return parseResponse<{ message: string }>(
    await fetch(`${API_URL}/user/delete-model`, {
      method: "DELETE",
      headers: authHeaders(token),
      body: JSON.stringify({ modelId }),
    }),
  );
}

export async function getChats(token: string) {
  return parseResponse<ApiChat[]>(
    await fetch(`${API_URL}/ai/chats`, {
      headers: authHeaders(token),
    }),
  );
}

export async function createChat(token: string, title?: string) {
  return parseResponse<ApiChat>(
    await fetch(`${API_URL}/ai/chats`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ title }),
    }),
  );
}

export async function updateChat(token: string, chatId: number, title: string) {
  return parseResponse<ApiChat>(
    await fetch(`${API_URL}/ai/chats/${chatId}`, {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify({ title }),
    }),
  );
}

export async function deleteChat(token: string, chatId: number) {
  return parseResponse<{ message: string }>(
    await fetch(`${API_URL}/ai/chats/${chatId}`, {
      method: "DELETE",
      headers: authHeaders(token),
    }),
  );
}

export async function generateText(
  prompt: string,
  token: string,
  chatId?: number,
  modelId?: number | null,
) {
  return parseResponse<GenerateResponse>(
    await fetch(`${API_URL}/ai/generate`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ prompt, chatId, modelId: modelId ?? undefined }),
    }),
  );
}

function parseJson(responseText: string): unknown {
  if (!responseText) {
    return "";
  }

  try {
    return JSON.parse(responseText);
  } catch {
    return responseText;
  }
}
