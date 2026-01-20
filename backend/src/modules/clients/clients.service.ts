import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/services/prisma.service';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async findAllWithCategories(limit: number = 50, offset: number = 0) {
    const [clients, total] = await Promise.all([
      this.prisma.client.findMany({
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          categorization: true,
          upload: {
            select: {
              filename: true,
              createdAt: true,
            },
          },
        },
      }),
      this.prisma.client.count(),
    ]);

    return {
      clients,
      total,
      limit,
      offset,
    };
  }
}
