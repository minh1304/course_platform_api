import { Controller, Get, Param, Req, Request, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('user')
export class UserController {
    constructor(private readonly userService : UserService){}

    @Get('getAllUsers')
    async findAll() {
        return await this.userService.getAllUsers();
    }

    @Get('getUser/:id')
    async getUserById(@Param('id') id: string) {
        return await this.userService.getUserById(id); 
    }

    
    @UseGuards(JwtAuthGuard)
    @Get('me')
    getProfile(@Request() req) {
      return req.user;
    }
}
