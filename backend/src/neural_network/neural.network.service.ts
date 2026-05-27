/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MessageRole, Model } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ProviderFactory } from '../providers/factory/provider.factory';
import { ProviderConfig } from '../providers/interfaces/llm-provider.interface';

@Injectable()
export class NeuralNetworkService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly providerFactory: ProviderFactory,
  ) {}

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
      throw new NotFoundException('Chat not found');
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

    return { message: 'Chat deleted' };
  }

  async generateResponse(
    userId: number,
    prompt: string,
    chatId?: number,
    modelId?: number,
  ) {
    const cleanPrompt = prompt.trim();

    if (!cleanPrompt) {
      throw new BadRequestException('Message cannot be empty');
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
      throw new BadRequestException('Select or add a model in settings');
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
      chat.title === 'New chat';

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
      throw new NotFoundException('Chat not found');
    }

    return chat;
  }

  private normalizeTitle(title?: string) {
    const trimmed = title?.trim();
    return trimmed ? trimmed.slice(0, 120) : 'New chat';
  }

  private async callModel(
    model: Model,
    messages: Array<{ role: MessageRole; content: string }>,
  ) {
    const providerConfig: ProviderConfig = {
      type: (model as any).provider || 'openai-compatible',
      endpoint: model.apiOrIP,
      apiKey: process.env.LLM_API_KEY ?? process.env.OPENAI_API_KEY,
      modelId: model.name,
      ...(model as any).providerConfig,
    };

    const provider = this.providerFactory.getProvider(providerConfig);

    try {
      await provider.validateConfig(providerConfig);
    } catch (error) {
      throw new BadRequestException(
        `Provider configuration error: ${error.message}`,
      );
    }

    const providerMessages = messages.map((message) => ({
      role: this.toProviderRole(message.role) as
        | 'user'
        | 'assistant'
        | 'system'
        | 'developer',
      content: message.content,
    }));

    const requestBody = provider.generateRequest(providerMessages, model.name);
    const headers = provider.getRequestHeaders(providerConfig);
    const endpoint = provider.getEndpoint(providerConfig);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      const responseText = await response.text();
      const data = this.parseJson(responseText);

      if (!response.ok) {
        const parseResult = provider.parseResponse(data);
        const message = parseResult.error ?? response.statusText;
        throw new BadGatewayException(
          `Provider error: ${message || response.status}`,
        );
      }

      const parseResult = provider.parseResponse(data);
      if (!parseResult.success || !parseResult.text) {
        throw new BadGatewayException(
          `Failed to parse response: ${parseResult.error}`,
        );
      }

      return parseResult.text;
    } catch (error) {
      if (error instanceof BadGatewayException) {
        throw error;
      }

      throw new BadGatewayException(
        'Failed to get response from provider. Check endpoint and API key.',
      );
    }
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
}
