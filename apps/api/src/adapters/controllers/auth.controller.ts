import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/public.decorator';
import { LoginUseCase } from '@/use-cases/auth/login.use-case';
import { RefreshTokenUseCase } from '@/use-cases/auth/refresh-token.use-case';
import { InitialSetupUseCase } from '@/use-cases/auth/initial-setup.use-case';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly initialSetupUseCase: InitialSetupUseCase,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.refreshTokenUseCase.execute(dto.refreshToken);
  }

  @Public()
  @Post('initial-setup')
  @HttpCode(HttpStatus.CREATED)
  async initialSetup() {
    return this.initialSetupUseCase.execute();
  }
}

