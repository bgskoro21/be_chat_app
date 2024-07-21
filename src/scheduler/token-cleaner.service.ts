import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PrismaService } from 'src/common/prisma.service';
import { Logger } from 'winston';

@Injectable()
export class TokenCleanerService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.info(`Token cleanner is running!`);
    await this.prismaService.personalAccessToken.deleteMany({
      where: {
        OR: [{ status: 'Invalid' }, { status: 'Expired' }],
      },
    });
    this.logger.info(`Token cleanner deleted token!`);
  }
}
