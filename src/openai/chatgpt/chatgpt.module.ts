import { Module } from '@nestjs/common';
import { ChatgptService } from './chatgpt.service';
import { ChatgptController } from './chatgpt.controller';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [ConfigModule],
  providers: [ChatgptService],
  controllers: [ChatgptController],
  exports: [ChatgptService],
})
export class ChatgptModule {}
