import { PrismaService } from '../../prisma/prisma.service';
import { ProviderFactory } from '../providers/factory/provider.factory';
export declare class NeuralNetworkService {
    private readonly prisma;
    private readonly providerFactory;
    constructor(prisma: PrismaService, providerFactory: ProviderFactory);
    getChats(userId: number): Promise<({
        messages: {
            id: number;
            role: import(".prisma/client").$Enums.MessageRole;
            createdAt: Date;
            content: string;
            chatHistoryId: number;
            tokensUsed: number | null;
            modelVersion: string | null;
        }[];
    } & {
        title: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
    })[]>;
    getChat(userId: number, chatId: number): Promise<{
        messages: {
            id: number;
            role: import(".prisma/client").$Enums.MessageRole;
            createdAt: Date;
            content: string;
            chatHistoryId: number;
            tokensUsed: number | null;
            modelVersion: string | null;
        }[];
    } & {
        title: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
    }>;
    createChat(userId: number, title?: string): Promise<{
        messages: {
            id: number;
            role: import(".prisma/client").$Enums.MessageRole;
            createdAt: Date;
            content: string;
            chatHistoryId: number;
            tokensUsed: number | null;
            modelVersion: string | null;
        }[];
    } & {
        title: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
    }>;
    updateChat(userId: number, chatId: number, title: string): Promise<{
        messages: {
            id: number;
            role: import(".prisma/client").$Enums.MessageRole;
            createdAt: Date;
            content: string;
            chatHistoryId: number;
            tokensUsed: number | null;
            modelVersion: string | null;
        }[];
    } & {
        title: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
    }>;
    deleteChat(userId: number, chatId: number): Promise<{
        message: string;
    }>;
    generateResponse(userId: number, prompt: string, chatId?: number, modelId?: number): Promise<{
        chat: {
            messages: {
                id: number;
                role: import(".prisma/client").$Enums.MessageRole;
                createdAt: Date;
                content: string;
                chatHistoryId: number;
                tokensUsed: number | null;
                modelVersion: string | null;
            }[];
        } & {
            title: string | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
        };
        userMessage: {
            id: number;
            role: import(".prisma/client").$Enums.MessageRole;
            createdAt: Date;
            content: string;
            chatHistoryId: number;
            tokensUsed: number | null;
            modelVersion: string | null;
        };
        assistantMessage: {
            id: number;
            role: import(".prisma/client").$Enums.MessageRole;
            createdAt: Date;
            content: string;
            chatHistoryId: number;
            tokensUsed: number | null;
            modelVersion: string | null;
        };
        response: string;
    }>;
    private ensureChatOwner;
    private normalizeTitle;
    private callModel;
    private toProviderRole;
    private parseJson;
    private looksLikeApiKey;
}
