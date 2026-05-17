import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginDto, RefreshTokenDto } from 'src/dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Anonymous } from 'src/decorators';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Anonymous()
    @Throttle({ default: { limit: 5, ttl: 60 } })
    @HttpCode(HttpStatus.OK)
    @Post('login')
    login(@Body() signInDto: LoginDto) {
        return this.authService.signIn(signInDto.username, signInDto.password);
    }
    @Anonymous()
    @Throttle({ default: { limit: 3, ttl: 60 } })
    @Post('register')
    register(@Body() createDto: CreateUserDto) {
        return this.authService.register(createDto);
    }
    @Anonymous()
    @Throttle({ default: { limit: 5, ttl: 60 } })
    @HttpCode(HttpStatus.OK)
    @Post('refresh')
    refresh(@Body() refreshDto: RefreshTokenDto) {
        return this.authService.refresh(refreshDto.refreshToken);
    }
    @ApiBearerAuth()
    @Post('logout')
    logout(@Request() req) {
        return this.authService.logout(req.user?.sub, req.user?.jti);
    }
    @ApiBearerAuth()
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }
}
