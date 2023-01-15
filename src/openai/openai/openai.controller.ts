import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { OpenaiService } from './openai.service';

@Controller('openai')
export class OpenaiController {
  lastContext = '';
  constructor(private readonly openaiService: OpenaiService) {}
  @Get('send/:message')
  async sendMessage(@Param('message') message: string, @Query() args) {
    return this.openaiService.sendMessage(message, args);
  }
  @Get('edit/:message')
  async editMessage(@Param('message') message: string, @Query() args) {
    return this.openaiService.editMessage(message, args);
  }
  @Get('image/:prompt')
  async getImage(@Param('prompt') prompt: string, @Query() args) {
    return this.openaiService.getImage(prompt, args);
  }
  @Get('delFile/:file')
  async delFile(@Param('file') file: string, @Query() args) {
    return this.openaiService.delFile(file, args);
  }
  @Post('create/file')
  async createFile(@Query() args) {
    return this.openaiService.createFile(args);
  }
  @Get('files')
  async listFiles(@Query() args) {
    return this.openaiService.listFiles(args);
  }
  @Get('delModel/:model')
  async delModel(@Param('model') model: string, @Query() args) {
    return this.openaiService.delModel(model, args);
  }
  @Get('models')
  async listModels(@Query() args) {
    return this.openaiService.listModels(args);
  }
  @Get('create/finetuns')
  async createFineTunes(@Query() args) {
    return this.openaiService.createFineTunes(args);
  }
  @Get('finetunes')
  async listFineTunes(@Query() args) {
    return this.openaiService.listFineTunes(args);
  }
}
