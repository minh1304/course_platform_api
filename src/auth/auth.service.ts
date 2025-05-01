import { ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from '@nestjs/config';
import { UserService } from "src/user/user.service";
import { AuthCreateDto } from "./dto/authCreate.dto";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private userService: UserService
  ) {}

  async signup(dto: AuthCreateDto) {
    try {
      // generate the password hash
      const hash = await argon.hash(dto.password);

      const user = await this.prisma.appUser.create({
        data: {
          email: dto.email,
          hash: hash,
          fullName: dto.fullname,
          userType: (dto.usertype? 'teacher' : 'user' ) ,
          isActive: false
        },
        select: {
          userId: true,
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
  async signin(dto: AuthDto): Promise<{user: any, access_token: string }> {
    try {
      const user = await this.userService.getUserByEmail(dto.email);
      if (!user) throw new ForbiddenException('Credentials Incorrect!');

      // compare password
      const pwMatches = await argon.verify(user.hash, dto.password);

      if (!pwMatches) throw new UnauthorizedException('Credentials Incorrect!');

      const payload = { sub: user.id, usertype: user.userType, username: user.email };
      return {
        user: {
          email: user.email,
          name: user.fullName,
          usertype: user.userType
        },
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
