import { ForbiddenException, Injectable, NotAcceptableException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto, VerifyDto } from "./dto";
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from '@nestjs/config';
import { UserService } from "src/user/user.service";
import { AuthCreateDto } from "./dto/authCreate.dto";
import { MailerService } from "@nestjs-modules/mailer";
import { differenceInMinutes, format } from 'date-fns';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private userService: UserService,
    private mailerService: MailerService,
  ) {}

  async signup(dto: AuthCreateDto) {
    try {
      // generate the password hash
      const hash = await argon.hash(dto.password);
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const codeExpired = new Date(Date.now() + 60 * 1000);  // 1 minutes

      const user = await this.prisma.appUser.create({
        data: {
          email: dto.email,
          hash: hash,
          fullName: dto.fullname,
          userType: (dto.usertype? 'teacher' : 'user' ) ,
          isActive: false,
          code: code,
          codeExpired: codeExpired,
        
        },
        select: {
          userId: true,
          email: true,
          createdAt: true,
        },
      });
      
      // Send email here
      await this.mailerService
      .sendMail({
        to: user.email, 
        subject: 'Please confirm account ✔',
        text: 'welcome',
        template: './register',
        context: {
          name: dto.fullname,
          code: code
        }
      })
      .then(() => {})
      .catch(() => {});

      return { message: 'Signup successful. Verification code sent to email.' };
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

      if(!user.isActive) throw new NotAcceptableException('Inactive Account');

      const payload = { sub: user.id, usertype: user.userType, username: user.email };
      return {
        user: {
          _id: user.userId,
          email: user.email,
          name: user.fullName,
          usertype: user.userType,
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

  async verifyEmail(dto: VerifyDto) {
    const record = await this.prisma.appUser.findFirst({
      where: {
        userId: dto.userId,
        code: dto.code
      },
    });
    if (!record) throw new ForbiddenException('Invalid code');
    if(record.codeExpired < new Date()) throw new ForbiddenException('Code expired');

    // Update isActive field
    await this.prisma.appUser.update({
      where: { userId: dto.userId },
      data: { isActive: true },
    });
    return { message: 'Email verified successfully.' };
  }

  async getUserIdByEmail(email : string){
    return await this.userService.getUserIdByEmail(email);
  }
  async resendMail(userId: string) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeExpired = new Date(Date.now() + 60 * 1000); // 1 minutes

    // Update isActive field
    const user = await this.prisma.appUser.update({
      where: { userId: userId },
      data: {
        code: code,
        codeExpired: codeExpired,
        updatedAt: new Date(Date.now()),
      },
      select: {
        fullName: true,
        email: true,
      },
    });
    await this.mailerService
      .sendMail({
        to: user.email,
        subject: 'Please confirm account ✔',
        text: 'welcome',
        template: './register',
        context: {
          name: user.fullName,
          code: code,
        },
      })
      .then(() => {})
      .catch(() => {});
    return { message: 'Successful!' };

  }
  async getExpiredTime(userId: string) {
    const userInfo = await this.userService.getUserById(userId);
    if (!userInfo) {
      throw new NotFoundException('User not found');
    }

    const expiredTime = userInfo.codeExpired;
    const now = new Date();
    
    const formattedTime = format(expiredTime, "yyyy-MM-dd HH:mm:ss");
    const minutesLeft = Math.max(0, differenceInMinutes(expiredTime, now));

    return {
      expiredAt: formattedTime,
      minutesRemaining: minutesLeft,
      isExpired: expiredTime < now,
    };
  }
}
