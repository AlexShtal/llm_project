import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getStats(req: any): Promise<{
        totalUsers: number;
        totalModels: number;
        totalChats: number;
    }>;
}
