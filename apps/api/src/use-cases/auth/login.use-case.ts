import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from '@/domain/ports/repositories/user.repository';
import { IAuthService, TokenPair } from '@/domain/ports/auth/auth.service.interface';
import { UnauthorizedError } from '@/domain/errors/domain.error';

export interface LoginDto {
  email: string;
  password: string;
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IAuthService')
    private readonly authService: IAuthService,
  ) {}

  async execute(dto: LoginDto): Promise<TokenPair> {
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (!user.active) {
      throw new UnauthorizedError('User account is inactive');
    }

    const isPasswordValid = await this.authService.comparePassword(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const permissions = await this.userRepository.getUserPermissions(user.id);

    return this.authService.generateTokens(user.id, user.email, permissions);
  }
}

