import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
    constructor(
        private prisma: PrismaService,
    ){}
    async getUserByEmail(email: string): Promise<any> {
        return await this.prisma.user.findUnique({
          where: {
            email: email,
          },
        });
    }
}
