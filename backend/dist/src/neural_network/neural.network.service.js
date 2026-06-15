"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NeuralNetworkService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const provider_factory_1 = require("../providers/factory/provider.factory");
let NeuralNetworkService = class NeuralNetworkService {
    prisma;
    providerFactory;
    constructor(prisma, providerFactory) {
        this.prisma = prisma;
        this.providerFactory = providerFactory;
    }
    async getChats(userId) {
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
    async getChat(userId, chatId) {
        const chat = await this.prisma.chatHistory.findFirst({
            where: { id: chatId, userId },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
        if (!chat) {
            throw new common_1.NotFoundException('Chat not found');
        }
        return chat;
    }
    async createChat(userId, title) {
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
    async updateChat(userId, chatId, title) {
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
    async deleteChat(userId, chatId) {
        await this.ensureChatOwner(userId, chatId);
        await this.prisma.chatHistory.delete({
            where: { id: chatId },
        });
        return { message: 'Chat deleted' };
    }
    async generateResponse(userId, prompt, chatId, modelId) {
        const cleanPrompt = prompt.trim();
        if (!cleanPrompt) {
            throw new common_1.BadRequestException('Message cannot be empty');
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
            throw new common_1.BadRequestException('Select or add a model in settings');
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
                role: client_1.MessageRole.USER,
                content: cleanPrompt,
            },
        });
        const answer = await this.callModel(model, [
            ...messages.map((message) => ({
                role: message.role,
                content: message.content,
            })),
            { role: client_1.MessageRole.USER, content: cleanPrompt },
        ]);
        const assistantMessage = await this.prisma.message.create({
            data: {
                chatHistoryId: chat.id,
                role: client_1.MessageRole.ASSISTANT,
                content: answer,
                modelVersion: model.name,
            },
        });
        const shouldAutotitle = !messages.some((message) => message.role === client_1.MessageRole.USER) ||
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
    async ensureChatOwner(userId, chatId) {
        const chat = await this.prisma.chatHistory.findFirst({
            where: { id: chatId, userId },
        });
        if (!chat) {
            throw new common_1.NotFoundException('Chat not found');
        }
        return chat;
    }
    normalizeTitle(title) {
        const trimmed = title?.trim();
        return trimmed ? trimmed.slice(0, 120) : 'New chat';
    }
    async callModel(model, messages) {
        const providerConfigFromDb = typeof model.providerConfig === 'object' &&
            model.providerConfig !== null
            ? model.providerConfig
            : {};
        const endpointOrKey = model.apiOrIP.trim();
        const apiKeyFromEndpoint = this.looksLikeApiKey(endpointOrKey)
            ? endpointOrKey
            : undefined;
        const configuredEndpoint = apiKeyFromEndpoint
            ? 'https://api.openai.com/v1'
            : endpointOrKey;
        const providerConfig = {
            type: model.provider || 'openai-compatible',
            endpoint: configuredEndpoint,
            apiKey: providerConfigFromDb.apiKey ??
                apiKeyFromEndpoint,
            modelId: model.name,
            ...providerConfigFromDb,
        };
        const provider = this.providerFactory.getProvider(providerConfig);
        try {
            await provider.validateConfig(providerConfig);
        }
        catch (error) {
            throw new common_1.BadRequestException(`Provider configuration error: ${error.message}`);
        }
        const providerMessages = messages.map((message) => ({
            role: this.toProviderRole(message.role),
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
                throw new common_1.BadGatewayException(`Provider error: ${message || response.status}`);
            }
            const parseResult = provider.parseResponse(data);
            if (!parseResult.success || !parseResult.text) {
                throw new common_1.BadGatewayException(`Failed to parse response: ${parseResult.error}`);
            }
            return parseResult.text;
        }
        catch (error) {
            if (error instanceof common_1.BadGatewayException) {
                throw error;
            }
            throw new common_1.BadGatewayException('Failed to get response from provider. Check endpoint and API key.');
        }
    }
    toProviderRole(role) {
        if (role === client_1.MessageRole.ASSISTANT)
            return 'assistant';
        if (role === client_1.MessageRole.SYSTEM)
            return 'system';
        if (role === client_1.MessageRole.TOOL)
            return 'tool';
        return 'user';
    }
    parseJson(responseText) {
        if (!responseText) {
            return '';
        }
        try {
            return JSON.parse(responseText);
        }
        catch {
            return responseText;
        }
    }
    looksLikeApiKey(value) {
        return /^(sk-|sk-proj-)/.test(value);
    }
};
exports.NeuralNetworkService = NeuralNetworkService;
exports.NeuralNetworkService = NeuralNetworkService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        provider_factory_1.ProviderFactory])
], NeuralNetworkService);
//# sourceMappingURL=neural.network.service.js.map