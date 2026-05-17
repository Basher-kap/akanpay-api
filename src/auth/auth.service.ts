import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcryptjs';
import type { StringValue } from 'ms';

import { v4 as uuidv4 } from 'uuid' //for creation of blocklist 

@Injectable()
export class AuthService {
    private blocklist = new Set<string>(); //


    constructor(
        private readonly userService: UserService,
        private jwtService: JwtService,
        private config: ConfigService
    ) { }

    async signIn(username: string, pass: string): Promise<any> {
        const user = await this.userService.findOne(username);
        if (!user) {
            throw new UnauthorizedException();
        }
        const passwordMatches = await bcrypt.compare(pass, user.password);
        if (!passwordMatches) {
            throw new UnauthorizedException();
        }
        return this.issueTokens(user.id, user.username, user.roles || []);
    }

    async register(createDto: CreateUserDto) {
        const user = await this.userService.create(createDto);
        return this.issueTokens(user.id, user.username, user.roles || []);
    }

    async refresh(refreshToken: string) {
        const refreshSecret = this.config.getOrThrow<string>('JWT_REFRESH_SECRET');
        let payload: { sub: number; username: string; roles: string[] };
        try {
            payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: refreshSecret
            });
        } catch {
            throw new UnauthorizedException();
        }

        const user = await this.userService.findById(payload.sub);
        if (!user || !user.refreshTokenHash) {
            throw new UnauthorizedException();
        }

        const tokenMatches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
        if (!tokenMatches) {
            throw new UnauthorizedException();
        }

        return this.issueTokens(user.id, user.username, user.roles || []);
    }

    async logout(userId?: number, jti?: string) {
        if (!userId) {
            throw new UnauthorizedException();
        }
        if (jti) this.blocklist.add(jti); //marks this uuid generated token as blocked
        await this.userService.clearRefreshToken(userId);
        return { success: true };
    }

    isBlocklisted(jti: string): boolean {
        return this.blocklist.has(jti);
    }

    private async issueTokens(userId: number, username: string, roles: string[]) {
        const accessPayload = { sub: userId, username, roles, jti: uuidv4() }; //added as well in payload
        const access_token = await this.jwtService.signAsync(accessPayload);

        const refreshSecret = this.config.getOrThrow<string>('JWT_REFRESH_SECRET');
        const refreshExpiresIn = this.config.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN') as StringValue;
        const refresh_token = await this.jwtService.signAsync(accessPayload, {
            secret: refreshSecret,
            expiresIn: refreshExpiresIn
        });

        await this.userService.setRefreshToken(userId, refresh_token);

        return {
            access_token,
            refresh_token
        };
    }
}
