import { Injectable } from '@nestjs/common';
import { AppUser } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
    constructor(
        private prisma: PrismaService,
    ){}
    async getUserByEmail(email: string): Promise<any> {
        return await this.prisma.appUser.findUnique({
          where: {
            email: email,
          },
        });
    }
    async getAllUsers() : Promise<AppUser[]> {
        return await this.prisma.appUser.findMany();
    }
    async getUserById(id: string) : Promise<any> {
      return await this.prisma.appUser.findUnique({
        where: {
          userId : id,
        }
      })
    }
}
