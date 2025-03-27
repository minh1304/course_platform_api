import { ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from '@nestjs/config';
import { UserService } from "src/user/user.service";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private userService: UserService
  ) {}

  async signup(dto: AuthDto) {
    try {
      // generate the password hash
      const hash = await argon.hash(dto.password);

      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash: hash,
          firstName: 'Minh',
          lastName: 'Vo',
        },
        select: {
          id: true,
          email: true,
          createdAt: true,
        },
      });

      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error;
    }
  }
  async signin(dto: AuthDto): Promise<{ access_token: string }> {
    try {
      // const user = await this.prisma.user.findUnique({
      //   where: {
      //     email: dto.email,
      //   },
      // });

      const user = await this.userService.getUserByEmail(dto.email);
      if (!user) throw new ForbiddenException('Credentials Incorrect!');

      // compare password
      const pwMatches = await argon.verify(user.hash, dto.password);

      if (!pwMatches) throw new UnauthorizedException('Credentials Incorrect!');

      const payload = { sub: user.id, username: user.email };
      return {
        access_token: await this.jwtService.signAsync(payload),
      };
      
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error;
    }
  }
}
