import { Controller, Get, Param, Post, Query, Req, Res } from "@nestjs/common";
import { Readable } from "stream";
import { OpenaiService } from "./openai.service";

@Controller("openai")
export class OpenaiController {
  lastContext = "";
  constructor(private readonly openaiService: OpenaiService) {}
  @Get("completions/:prompt")
  async completionsMessage(
    @Param("prompt") prompt: string,
    @Query() args,
    @Query("stream") stream: string,
    @Res() response
  ) {
    const isStream = stream == undefined ? false : true;
    if (isStream) {
      response.header("Content-Type", "text/event-stream;charset=utf-8");
    } else {
      response.header("Content-Type", "text/json;charset=utf-8");
    }
    const res = await this.openaiService.completionsMessage(
      prompt,
      response,
      isStream,
      args
    );
    if (!isStream) {
      response.end(res);
    }
  }
  @Get("chat/:prompt")
  async chatMessage(
    @Param("prompt") prompt: string,
    @Query() args,
    @Query("stream") stream: string,
    @Res() response
  ) {
    const isStream = stream == undefined ? false : true;
    if (isStream) {
      response.header("Content-Type", "text/event-stream;charset=utf-8");
    } else {
      response.header("Content-Type", "text/json;charset=utf-8");
    }
    const res = await this.openaiService.chatMessage(
      prompt,
      response,
      isStream,
      args
    );
    if (!isStream) {
      response.end(res);
    }
  }
  @Get("edit/:message")
  async editMessage(@Param("message") message: string, @Query() args) {
    return this.openaiService.editMessage(message, args);
  }
  @Get("image/:prompt")
  async getImage(@Param("prompt") prompt: string, @Query() args) {
    return this.openaiService.getImage(prompt, args);
  }
  @Get("delFile/:file")
  async delFile(@Param("file") file: string, @Query() args) {
    return this.openaiService.delFile(file, args);
  }
  @Post("create/file")
  async createFile(@Query() args) {
    return this.openaiService.createFile(args);
  }
  @Get("files")
  async listFiles(@Query() args) {
    return this.openaiService.listFiles(args);
  }
  @Get("delModel/:model")
  async delModel(@Param("model") model: string, @Query() args) {
    return this.openaiService.delModel(model, args);
  }
  @Get("models")
  async listModels(@Query() args) {
    return this.openaiService.listModels(args);
  }
  @Get("create/finetuns")
  async createFineTunes(@Query() args) {
    return this.openaiService.createFineTunes(args);
  }
  @Get("finetunes")
  async listFineTunes(@Query() args) {
    return this.openaiService.listFineTunes(args);
  }
}
