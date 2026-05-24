import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  AuthTokensDto,
  CreateUserDto,
  LoginDto,
  RefreshTokenDto,
} from 'src/dto';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { Anonymous } from 'src/decorators';
import { Throttle } from '@nestjs/throttler';

const ONE_MINUTE_MS = 60_000;

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Anonymous()
  @Throttle({ default: { limit: 5, ttl: ONE_MINUTE_MS } })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AuthTokensDto })
  @Post('login')
  login(@Body() signInDto: LoginDto, @Ip() ip: string) {
    return this.authService.signIn(signInDto.IDNumber, signInDto.password, ip);  // pass the IDNumber and password to the service for authentication
  }

  @Anonymous()
  @Throttle({ default: { limit: 3, ttl: ONE_MINUTE_MS } })
  @ApiOkResponse({ type: AuthTokensDto })
  @Post('register')
  register(@Body() createDto: CreateUserDto, @Ip() ip: string) {
    return this.authService.register(createDto, ip);
  }
  @Anonymous()
  @Throttle({ default: { limit: 5, ttl: ONE_MINUTE_MS } })
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: AuthTokensDto })
  @Post('refresh')
  refresh(@Body() refreshDto: RefreshTokenDto, @Ip() ip: string) {
    return this.authService.refresh(refreshDto.refreshToken, ip);
  }
  @ApiBearerAuth()
  @Post('logout')
  logout(@Request() req, @Ip() ip: string) {
    return this.authService.logout(req.user?.sub, ip);
  }
  @ApiBearerAuth()
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
