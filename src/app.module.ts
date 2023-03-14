import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatgptModule } from './openai/chatgpt/chatgpt.module';
import { OpenaiModule } from './openai/openai/openai.module';
import { EventsModule } from './events/events.module';
import * as yaml from 'yaml';
import * as fs from 'fs';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => yaml.parse(fs.readFileSync('env/.dev.yaml', 'utf-8'))],
    }),
    // ConfigModule.forRoot({
    //   envFilePath: ['./env/dev.env'],
    // }),
    OpenaiModule,
    ChatgptModule,
    EventsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
