import { CreateChatDto } from './dto/create.chat.dto';
import { GenerateDto } from './dto/generate.dto';
import { NeuralNetworkService } from './neural.network.service';
import { UpdateChatDto } from './dto/update.chat.dto';
export declare class NeuralNetworkController {
    private readonly neuralNetworkService;
    constructor(neuralNetworkService: NeuralNetworkService);
    getChats(req: any): Promise<({
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
    getChat(req: any, id: number): Promise<{
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
    createChat(req: any, dto: CreateChatDto): Promise<{
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
    updateChat(req: any, id: number, dto: UpdateChatDto): Promise<{
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
    deleteChat(req: any, id: number): Promise<{
        message: string;
    }>;
    generateResponse(req: any, generateDto: GenerateDto): Promise<{
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
}
