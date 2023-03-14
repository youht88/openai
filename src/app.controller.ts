import { Controller, Get, Render, Res } from '@nestjs/common';
import * as path from 'path';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/hello')
  getHello(): string {
    return this.appService.getHello();
  }
  @Get('/socket')
  //@Render('index.html')
  socket(@Res() res) {
    return res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
}
