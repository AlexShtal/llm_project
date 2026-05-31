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
  provider: string;
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
    throw new Error(getFriendlyError(response, data));
  }

  return data as T;
}

function getFriendlyError(response: Response, data: unknown) {
  const rawMessage = getRawErrorMessage(data);
  const url = response.url;

  if (url.includes("/auth/login")) {
    return "Неверный логин или пароль.";
  }

  if (url.includes("/auth/register")) {
    if (response.status === 409 || response.status === 400) {
      return "Не удалось зарегистрироваться. Проверьте email, имя пользователя и пароль.";
    }
    return "Не удалось создать аккаунт. Попробуйте ещё раз.";
  }

  if (url.includes("/user/add-model")) {
    if (response.status === 409 || /exist|already|существ/i.test(rawMessage)) {
      return "Модель с таким названием уже добавлена.";
    }
    return "Не удалось добавить модель. Проверьте название и endpoint.";
  }

  if (url.includes("/user/set-current-model")) {
    return "Не удалось выбрать модель. Обновите список моделей и попробуйте снова.";
  }

  if (url.includes("/ai/generate")) {
    if (/model|модель/i.test(rawMessage)) {
      return "Сначала добавьте и выберите модель.";
    }
    if (/provider|endpoint|api key|configuration/i.test(rawMessage)) {
      return "Модель не отвечает. Проверьте endpoint и API-ключ.";
    }
    return "Не удалось получить ответ от модели. Попробуйте ещё раз.";
  }

  if (response.status === 401) {
    return "Сессия истекла. Войдите снова.";
  }

  return rawMessage || `Ошибка запроса: ${response.status}`;
}

function getRawErrorMessage(data: unknown) {
  if (typeof data === "string") {
    return data;
  }

  if (typeof data === "object" && data !== null && "message" in data) {
    const message = (data as { message: unknown }).message;
    return Array.isArray(message) ? message.join(". ") : String(message);
  }

  return "";
}

export async function login(email: string, password: string) {
  return parseResponse<{ access_token: string; user: UserProfile }>(
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
  return parseResponse<{ access_token: string; user: UserProfile }>(
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
  model: {
    name: string;
    apiOrIP: string;
    provider: string;
    description?: string;
    apiKey?: string;
  },
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
