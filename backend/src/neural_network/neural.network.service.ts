import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MessageRole, Model } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NeuralNetworkService {
  constructor(private readonly prisma: PrismaService) {}

  async getChats(userId: number) {
    return this.prisma.chatHistory.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async getChat(userId: number, chatId: number) {
    const chat = await this.prisma.chatHistory.findFirst({
      where: { id: chatId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!chat) {
      throw new NotFoundException('Чат не найден');
    }

    return chat;
  }

  async createChat(userId: number, title?: string) {
    return this.prisma.chatHistory.create({
      data: {
        userId,
        title: this.normalizeTitle(title),
      },
      include: {
        messages: true,
      },
    });
  }

  async updateChat(userId: number, chatId: number, title: string) {
    await this.ensureChatOwner(userId, chatId);

    return this.prisma.chatHistory.update({
      where: { id: chatId },
      data: { title: this.normalizeTitle(title) },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async deleteChat(userId: number, chatId: number) {
    await this.ensureChatOwner(userId, chatId);

    await this.prisma.chatHistory.delete({
      where: { id: chatId },
    });

    return { message: 'Чат удален' };
  }

  async generateResponse(
    userId: number,
    prompt: string,
    chatId?: number,
    modelId?: number,
  ) {
    const cleanPrompt = prompt.trim();

    if (!cleanPrompt) {
      throw new BadRequestException('Сообщение не может быть пустым');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { currentModel: true },
    });

    const model = modelId
      ? await this.prisma.model.findFirst({
          where: { id: modelId, userId },
        })
      : user?.currentModel;

    if (!model) {
      throw new BadRequestException(
        'Выберите или добавьте модель в настройках',
      );
    }

    const chat = chatId
      ? await this.ensureChatOwner(userId, chatId)
      : await this.prisma.chatHistory.create({
          data: {
            userId,
            title: this.normalizeTitle(cleanPrompt),
          },
        });

    const messages = await this.prisma.message.findMany({
      where: { chatHistoryId: chat.id },
      orderBy: { createdAt: 'asc' },
    });

    const userMessage = await this.prisma.message.create({
      data: {
        chatHistoryId: chat.id,
        role: MessageRole.USER,
        content: cleanPrompt,
      },
    });

    const answer = await this.callModel(model, [
      ...messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      { role: MessageRole.USER, content: cleanPrompt },
    ]);

    const assistantMessage = await this.prisma.message.create({
      data: {
        chatHistoryId: chat.id,
        role: MessageRole.ASSISTANT,
        content: answer,
        modelVersion: model.name,
      },
    });

    const shouldAutotitle =
      !messages.some((message) => message.role === MessageRole.USER) ||
      !chat.title ||
      chat.title === 'Новый чат';

    const updatedChat = await this.prisma.chatHistory.update({
      where: { id: chat.id },
      data: {
        title: shouldAutotitle ? this.normalizeTitle(cleanPrompt) : chat.title,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return {
      chat: updatedChat,
      userMessage,
      assistantMessage,
      response: answer,
    };
  }

  private async ensureChatOwner(userId: number, chatId: number) {
    const chat = await this.prisma.chatHistory.findFirst({
      where: { id: chatId, userId },
    });

    if (!chat) {
      throw new NotFoundException('Чат не найден');
    }

    return chat;
  }

  private normalizeTitle(title?: string) {
    const trimmed = title?.trim();
    return trimmed ? trimmed.slice(0, 120) : 'Новый чат';
  }

  private async callModel(
    model: Model,
    messages: Array<{ role: MessageRole; content: string }>,
  ) {
    const endpoint = this.resolveEndpoint(model.apiOrIP);
    const chatMessages = messages.map((message) => ({
      role: this.toProviderRole(message.role),
      content: message.content,
    }));

    const body = this.createRequestBody(endpoint, model.name, chatMessages);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const apiKey = process.env.LLM_API_KEY ?? process.env.OPENAI_API_KEY;
    if (apiKey && endpoint.kind === 'openai-compatible') {
      headers.Authorization = `Bearer ${apiKey}`;
    }

    try {
      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      const responseText = await response.text();
      const data = this.parseJson(responseText);

      if (!response.ok) {
        const message = this.extractErrorMessage(data) ?? response.statusText;
        throw new BadGatewayException(
          `Модель вернула ошибку: ${message || response.status}`,
        );
      }

      return this.extractText(data);
    } catch (error) {
      if (error instanceof BadGatewayException) {
        throw error;
      }

      throw new BadGatewayException(
        'Не удалось получить ответ от модели. Проверьте адрес API/IP.',
      );
    }
  }

  private resolveEndpoint(apiOrIP: string) {
    const rawValue = apiOrIP.trim();
    const withProtocol = /^https?:\/\//i.test(rawValue)
      ? rawValue
      : `http://${rawValue}`;
    const url = new URL(withProtocol);
    const path = url.pathname.replace(/\/$/, '');

    if (!path || path === '' || path === '/') {
      url.pathname =
        url.port === '11434' ? '/api/chat' : '/v1/chat/completions';
    }

    const normalizedPath = url.pathname.toLowerCase();
    const kind = normalizedPath.includes('/api/chat')
      ? 'ollama-chat'
      : normalizedPath.includes('/api/generate')
        ? 'ollama-generate'
        : normalizedPath.includes('/v1/chat/completions')
          ? 'openai-compatible'
          : 'generic';

    return {
      url: url.toString(),
      kind,
    };
  }

  private createRequestBody(
    endpoint: { kind: string },
    modelName: string,
    messages: Array<{ role: string; content: string }>,
  ) {
    const lastMessage = messages[messages.length - 1]?.content ?? '';

    if (endpoint.kind === 'ollama-chat') {
      return { model: modelName, messages, stream: false };
    }

    if (endpoint.kind === 'ollama-generate') {
      return { model: modelName, prompt: lastMessage, stream: false };
    }

    if (endpoint.kind === 'openai-compatible') {
      return { model: modelName, messages, stream: false };
    }

    return { model: modelName, prompt: lastMessage, messages };
  }

  private toProviderRole(role: MessageRole) {
    if (role === MessageRole.ASSISTANT) return 'assistant';
    if (role === MessageRole.SYSTEM) return 'system';
    if (role === MessageRole.TOOL) return 'tool';
    return 'user';
  }

  private parseJson(responseText: string): unknown {
    if (!responseText) {
      return '';
    }

    try {
      return JSON.parse(responseText);
    } catch {
      return responseText;
    }
  }

  private extractText(data: unknown): string {
    if (typeof data === 'string') {
      return data;
    }

    if (!data || typeof data !== 'object') {
      return String(data ?? '');
    }

    const result = data as {
      response?: string;
      text?: string;
      message?: { content?: string } | string;
      choices?: Array<{ message?: { content?: string }; text?: string }>;
    };

    const content =
      result.response ??
      result.text ??
      (typeof result.message === 'string'
        ? result.message
        : result.message?.content) ??
      result.choices?.[0]?.message?.content ??
      result.choices?.[0]?.text;

    if (!content) {
      throw new BadGatewayException('Модель вернула ответ без текста');
    }

    return content;
  }

  private extractErrorMessage(data: unknown) {
    if (typeof data === 'string') {
      return data;
    }

    if (!data || typeof data !== 'object') {
      return undefined;
    }

    const result = data as {
      error?: string | { message?: string };
      message?: string | string[];
    };

    if (typeof result.error === 'string') return result.error;
    if (typeof result.error?.message === 'string') return result.error.message;
    if (typeof result.message === 'string') return result.message;
    if (Array.isArray(result.message)) return result.message.join(', ');
    return undefined;
  }
}
