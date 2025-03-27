import { Body, Controller, Get, Post, Request, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto";
import { JwtAuthGuard } from "./jwt-auth.guard";


@Controller('auth')
export class AuthController {
    constructor(private authService : AuthService) {}
    
    @Post('signup')
    signup(@Body() dto : AuthDto) {
        return this.authService.signup(dto);
    }
    @Post('signin')
    signin(@Body() dto : AuthDto) {
        return this.authService.signin(dto);           
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
      return req.user;
    }
}