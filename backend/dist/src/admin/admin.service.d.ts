import { PrismaService } from '../../prisma/prisma.service';
export declare class AdminService {
    private prisma;
    constructor(prisma: PrismaService);
    getStats(userId: number): Promise<{
        totalUsers: number;
        totalModels: number;
        totalChats: number;
    }>;
}
