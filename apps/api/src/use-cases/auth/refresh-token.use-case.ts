import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from '@/domain/ports/repositories/user.repository';
import { IAuthService, TokenPair } from '@/domain/ports/auth/auth.service.interface';
import { UnauthorizedError } from '@/domain/errors/domain.error';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IAuthService')
    private readonly authService: IAuthService,
  ) {}

  async execute(refreshToken: string): Promise<TokenPair> {
    try {
      const payload = await this.authService.validateRefreshToken(refreshToken);

      const user = await this.userRepository.findById(payload.sub);

      if (!user || !user.active) {
        throw new UnauthorizedError('User not found or inactive');
      }

      const permissions = await this.userRepository.getUserPermissions(user.id);

      // Revoke old refresh token and generate new pair (rotation)
      await this.authService.revokeRefreshToken(refreshToken);

      return this.authService.generateTokens(user.id, user.email, permissions);
    } catch (error) {
      throw new UnauthorizedError('Invalid refresh token');
    }
  }
}

