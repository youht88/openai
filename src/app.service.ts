import { Injectable } from '@nestjs/common';
import { ChatgptService } from './openai/chatgpt/chatgpt.service';

@Injectable()
export class AppService {
  constructor(private readonly chatgptService: ChatgptService) {}
  getHello(): string {
    return 'Hello Open AI!';
  }
  async start() {
    this.chatgptService.init();
  }
}
