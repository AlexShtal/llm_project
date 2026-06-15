import { UserService } from './user.service';
import { CreateModelDto } from './dto/create.model.dto';
import { SetCurrentModelDto } from './dto/set.current.model.dto';
import { DeleteModelDto } from './dto/delete.model.dto';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    getProfile(req: any): Promise<{
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
    deleteUser(req: any): Promise<string>;
    addModel(req: any, dto: CreateModelDto): Promise<{
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
    getMyModels(req: any): Promise<{
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
    setCurrentModel(req: any, body: SetCurrentModelDto): Promise<{
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
    deleteModel(req: any, body: DeleteModelDto): Promise<{
        message: string;
    }>;
}
