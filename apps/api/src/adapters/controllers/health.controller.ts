import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../auth/public.decorator';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Check API health status' })
  async check() {
    const checks: Record<string, { status: string; message?: string }> = {};

    // Database check
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = { status: 'up' };
    } catch (error: any) {
      checks.database = { status: 'down', message: error?.message };
    }

    const allUp = Object.values(checks).every((c) => c.status === 'up');

    return {
      status: allUp ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      checks,
    };
  }
}
