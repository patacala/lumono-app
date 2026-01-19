import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { AuthServiceImpl } from './auth.service.impl';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PermissionsGuard } from './permissions.guard';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.register({}),
  ],
  providers: [
    {
      provide: 'IAuthService',
      useClass: AuthServiceImpl,
    },
    AuthServiceImpl,
    JwtStrategy,
    JwtAuthGuard,
    PermissionsGuard,
  ],
  exports: [
    'IAuthService',
    AuthServiceImpl,
    JwtAuthGuard,
    PermissionsGuard,
  ],
})
export class AuthModule {}

