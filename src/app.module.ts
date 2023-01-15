import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatgptModule } from './openai/chatgpt/chatgpt.module';
import { OpenaiModule } from './openai/openai/openai.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['./env/dev.env'],
    }),
    OpenaiModule,
    ChatgptModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}