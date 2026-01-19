import { LoginUseCase } from './login.use-case';
import { IUserRepository } from '@/domain/ports/repositories/user.repository';
import { IAuthService } from '@/domain/ports/auth/auth.service.interface';
import { UnauthorizedError } from '@/domain/errors/domain.error';

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let authService: jest.Mocked<IAuthService>;

  beforeEach(() => {
    userRepository = {
      findByEmail: jest.fn(),
      getUserPermissions: jest.fn(),
    } as any;

    authService = {
      comparePassword: jest.fn(),
      generateTokens: jest.fn(),
    } as any;

    loginUseCase = new LoginUseCase(userRepository, authService);
  });

  it('should successfully login with valid credentials', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      password: 'hashedPassword',
      active: true,
      name: 'Test User',
    };

    userRepository.findByEmail.mockResolvedValue(mockUser as any);
    authService.comparePassword.mockResolvedValue(true);
    userRepository.getUserPermissions.mockResolvedValue(['product.read']);
    authService.generateTokens.mockResolvedValue({
      accessToken: 'access',
      refreshToken: 'refresh',
    });

    const result = await loginUseCase.execute({
      email: 'test@example.com',
      password: 'password',
    });

    expect(result).toEqual({
      accessToken: 'access',
      refreshToken: 'refresh',
    });
    expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(authService.comparePassword).toHaveBeenCalledWith('password', 'hashedPassword');
  });

  it('should throw UnauthorizedError when user not found', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      loginUseCase.execute({
        email: 'test@example.com',
        password: 'password',
      })
    ).rejects.toThrow(UnauthorizedError);
  });

  it('should throw UnauthorizedError when password is invalid', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      password: 'hashedPassword',
      active: true,
      name: 'Test User',
    };

    userRepository.findByEmail.mockResolvedValue(mockUser as any);
    authService.comparePassword.mockResolvedValue(false);

    await expect(
      loginUseCase.execute({
        email: 'test@example.com',
        password: 'wrongPassword',
      })
    ).rejects.toThrow(UnauthorizedError);
  });

  it('should throw UnauthorizedError when user is inactive', async () => {
    const mockUser = {
      id: '1',
      email: 'test@example.com',
      password: 'hashedPassword',
      active: false,
      name: 'Test User',
    };

    userRepository.findByEmail.mockResolvedValue(mockUser as any);

    await expect(
      loginUseCase.execute({
        email: 'test@example.com',
        password: 'password',
      })
    ).rejects.toThrow(UnauthorizedError);
  });
});

