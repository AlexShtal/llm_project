import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can access stats');
    }

    const [totalUsers, totalModels, totalChats] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.model.count(),
      this.prisma.chatHistory.count(),
    ]);

    return {
      totalUsers,
      totalModels,
      totalChats,
    };
  }
}
