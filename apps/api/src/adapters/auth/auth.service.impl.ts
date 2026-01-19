import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import {
  IAuthService,
  TokenPair,
  JwtPayload,
} from '@/domain/ports/auth/auth.service.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthServiceImpl implements IAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async generateTokens(userId: string, email: string, permissions: string[]): Promise<TokenPair> {
    const payload: JwtPayload = {
      sub: userId,
      email,
      permissions,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get('JWT_ACCESS_EXPIRATION', '15m'),
    });

    const refreshToken = this.jwtService.sign(
      { sub: userId },
      {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRATION', '7d'),
      }
    );

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async validateAccessToken(token: string): Promise<JwtPayload> {
    const payload = this.jwtService.verify<JwtPayload>(token, {
      secret: this.config.get('JWT_ACCESS_SECRET'),
    });
    return payload;
  }

  async validateRefreshToken(token: string): Promise<JwtPayload> {
    const payload = this.jwtService.verify<JwtPayload>(token, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
    });

    // Check if token exists and is not revoked
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
      throw new Error('Invalid or expired refresh token');
    }

    return payload;
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { token },
      data: { revoked: true },
    });
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}

