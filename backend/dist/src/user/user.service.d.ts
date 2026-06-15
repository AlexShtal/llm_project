import { PrismaService } from '../../prisma/prisma.service';
import { CreateModelDto } from './dto/create.model.dto';
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    addModel(userId: number, dto: CreateModelDto): Promise<{
        description: string | null;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        userId: number;
        apiOrIP: string;
        provider: string;
        providerConfig: import(".prisma/client/runtime/client").JsonValue | null;
    }>;
    getMyModels(userId: number): Promise<{
        id: number;
        currentModelId: number | null;
        models: {
            description: string | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            userId: number;
            apiOrIP: string;
            provider: string;
            providerConfig: import(".prisma/client/runtime/client").JsonValue | null;
        }[];
        currentModel: {
            description: string | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            userId: number;
            apiOrIP: string;
            provider: string;
            providerConfig: import(".prisma/client/runtime/client").JsonValue | null;
        } | null;
    } | null>;
    setCurrentModel(userId: number, modelId: number): Promise<{
        currentModel: {
            description: string | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            userId: number;
            apiOrIP: string;
            provider: string;
            providerConfig: import(".prisma/client/runtime/client").JsonValue | null;
        } | null;
    } & {
        email: string;
        username: string | null;
        id: number;
        passwordHash: string;
        avatarUrl: string | null;
        role: import(".prisma/client").$Enums.Role;
        storageProvider: string;
        createdAt: Date;
        updatedAt: Date;
        currentModelId: number | null;
    }>;
    deleteModel(userId: number, modelId: number): Promise<{
        message: string;
    }>;
    findById(userId: number): Promise<{
        email: string;
        username: string | null;
        id: number;
        avatarUrl: string | null;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        currentModel: {
            description: string | null;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            userId: number;
            apiOrIP: string;
            provider: string;
            providerConfig: import(".prisma/client/runtime/client").JsonValue | null;
        } | null;
    }>;
    deleteUser(userId: number): Promise<string>;
}
