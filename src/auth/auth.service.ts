import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) {}

    async signup(dto: AuthDto) {
        try {
            // generate the password hash
            const hash = await argon.hash(dto.password);

            const user = await this.prisma.user.create({
              data: {
                email: dto.email,
                hash: hash,
                firstName: "Minh",
                lastName: "Vo"
              },
              select: {
                id: true,
                email: true,
                createdAt: true
              }
            });
      
            return user;
          } catch (error) {
            if (
              error instanceof
              PrismaClientKnownRequestError
            ) {
              if (error.code === 'P2002') {
                throw new ForbiddenException(
                  'Credentials taken',
                );
              }
            }
            throw error;
          }
    }
    async signin(dto: AuthDto) {
      try {
        const user = await this.prisma.user.findUnique({
          where: {
            email: dto.email,
          },
        })
        
        if(!user) throw new ForbiddenException('Credentials Incorrect!');
        
        // compare password
        const pwMatches = await argon.verify(user.hash, dto.password);
        
        if(!pwMatches) throw new ForbiddenException('Credentials Incorrect!');

        const { hash, ...userWithoutHash } = user;

        return userWithoutHash;

      }
      catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new ForbiddenException('Credentials taken');
          }
        }
        throw error;
      }
    }
}
