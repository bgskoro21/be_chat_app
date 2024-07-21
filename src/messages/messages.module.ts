import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [CommonModule],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
