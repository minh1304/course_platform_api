import { Body, Controller, Get, Post, Request, UseGuards, UseInterceptors } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDto, AuthCreateDto, VerifyDto } from "./dto";
import { MailerService } from '@nestjs-modules/mailer';
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly mailerService: MailerService,
  ) {}

  @Post('signup')
  signup(@Body() dto: AuthCreateDto) {
    return this.authService.signup(dto);
  }
  @Post('signin')
  signin(@Body() dto: AuthDto) {
    return this.authService.signin(dto);
  }

  @Post('verify-email')
  verifyEmail(@Body() dto: VerifyDto) {
    return this.authService.verifyEmail(dto);
  }

  @Post('get-user-id')
  async getUserIdByEmail(@Body('email') email: string) {
    return this.authService.getUserIdByEmail(email);
  }

  @Post('resend-mail')
  async resendMail(@Body('userid') userId: string) {
    return this.authService.resendMail(userId);
  }

  @Post('get-expired-time')
  async getExpiredTime(@Body('userid') userId: string) {
    return this.authService.getExpiredTime(userId);
  }


  @Get('mail')
  testMail() {
    this.mailerService
      .sendMail({
        to: "vtm1304@gmail.com",
        subject: 'Your account has been created',
        template: './register',
        context: {
          name: "Minh Vo",
          code: "12312321",
        },
      })
      .then(() => {})
      .catch(() => {});
  }
}