import { Controller, Get, Param, Query, Res, Req } from "@nestjs/common";
import { ChatgptService } from "./chatgpt.service";

@Controller("chatgpt")
export class ChatgptController {
  constructor(private readonly chatgptService: ChatgptService) {}
  @Get("init")
  // sample1: localhost:8080/chatgpt/init?email=abc@123.com&password=abcd123
  // sample2: localhost:8080/chatgpt/init 用chatgpt.users中的user/password随机实例化一个chatgptApi
  async init(@Query() user) {
    return this.chatgptService.init(user);
  }
  @Get("send/:message")
  async sendMessage(
    @Res() response,
    @Req() request,
    @Param("message") message: string,
    @Query("accountEmail") accountEmail: string,
    @Query("conversationId") conversationId: string,
    @Query("stream") stream: string
  ) {
    const isStream = stream == undefined ? false : true;
    if (isStream) {
      response.header("Content-Type", "text/event-stream");
    }
    const res = await this.chatgptService.sendMessage(
      response,
      message,
      accountEmail,
      conversationId,
      isStream
    );
    if (isStream) {
      response.end();
    } else {
      response.end(res);
    }
  }
}
