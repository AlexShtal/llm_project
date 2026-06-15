import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login,dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register({ email, username, password }: RegisterDto): Promise<{
        user: {
            email: string;
            username: string | null;
            id: number;
            avatarUrl: string | null;
            role: import(".prisma/client").$Enums.Role;
            storageProvider: string;
            createdAt: Date;
            updatedAt: Date;
            currentModelId: number | null;
        };
        access_token: string;
    }>;
    login({ email, password }: LoginDto): Promise<{
        user: {
            email: string;
            username: string | null;
            id: number;
            avatarUrl: string | null;
            role: import(".prisma/client").$Enums.Role;
            storageProvider: string;
            createdAt: Date;
            updatedAt: Date;
            currentModelId: number | null;
        };
        access_token: string;
    }>;
}
