import { AuthService } from './auth.service';
import { LoginDto } from './dto/login,dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
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
    login(loginDto: LoginDto): Promise<{
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
