import { Module } from '@nestjs/common';
import { OpenaiModule } from '../openai/openai/openai.module';
import { EventsGateway } from './events.gateway';
@Module({
  imports: [OpenaiModule],
  providers: [EventsGateway],
})
export class EventsModule {}
