import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { IsString, IsNotEmpty, IsEmail } from 'class-validator';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RequirePermissions } from '../auth/permissions.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import { IUserRepository } from '@/domain/ports/repositories/user.repository';
import { IPermissionRepository } from '@/domain/ports/repositories/permission.repository';
import { IAuthService } from '@/domain/ports/auth/auth.service.interface';

class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;
}

class AssignPermissionDto {
  @IsString()
  @IsNotEmpty()
  permissionId: string;
}

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IPermissionRepository')
    private readonly permissionRepository: IPermissionRepository,
    @Inject('IAuthService')
    private readonly authService: IAuthService,
  ) {}

  @Get()
  @RequirePermissions('user.manage')
  async findAll() {
    return this.userRepository.findAll();
  }

  @Get('permissions')
  @RequirePermissions('user.manage')
  async getAllPermissions() {
    return this.permissionRepository.findAll();
  }

  @Get(':id')
  @RequirePermissions('user.manage')
  async findOne(@Param('id') id: string) {
    return this.userRepository.findByIdWithPermissions(id);
  }

  @Post()
  @RequirePermissions('user.manage')
  async create(@Body() dto: CreateUserDto, @CurrentUser('sub') adminId: string) {
    const hashedPassword = await this.authService.hashPassword(dto.password);
    return this.userRepository.create({
      ...dto,
      password: hashedPassword,
      createdBy: adminId,
    });
  }

  @Post(':userId/permissions')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('user.manage')
  async assignPermission(
    @Param('userId') userId: string,
    @Body() dto: AssignPermissionDto,
    @CurrentUser('sub') adminId: string,
  ) {
    await this.userRepository.assignPermission(userId, dto.permissionId, adminId);
    return { message: 'Permission assigned successfully' };
  }

  @Post(':userId/permissions/:permissionId/revoke')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('user.manage')
  async revokePermission(@Param('userId') userId: string, @Param('permissionId') permissionId: string) {
    await this.userRepository.revokePermission(userId, permissionId);
    return { message: 'Permission revoked successfully' };
  }
}

