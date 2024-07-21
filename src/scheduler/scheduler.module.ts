import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TokenCleanerService } from './token-cleaner.service';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [ScheduleModule.forRoot(), CommonModule],
  providers: [TokenCleanerService],
})
export class SchedulerModule {}
