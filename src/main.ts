import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cors from 'cors';
import express from 'express';
import path from 'path';
import { AppModule } from './app.module';
import { AppService } from './app.service';
import * as copyfiles from 'copyfiles';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Uncomment these lines to use the Redis adapter:
  // const redisIoAdapter = new RedisIoAdapter(app);
  // await redisIoAdapter.connectToRedis();
  // app.useWebSocketAdapter(redisIoAdapter);
  app.use(cors());
  // 设置静态文件目录
  app.useStaticAssets('public');
  // 将 public 目录下的所有文件复制到 dist 目录下
  copyfiles(['public/**/*', 'dist'], { up: 0 }, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log('静态文件复制成功！');
    }
  });
  await app.listen(3000);
  const appService = app.get<AppService>(AppService);
  appService.start();
}
bootstrap();
