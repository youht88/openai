import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { OpenaiService } from './openai.service';

export function Page(path: string, view?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    Get(path)(target, propertyKey, descriptor);
    Post(path)(target, propertyKey, descriptor);
  };
}

@Controller('openai')
export class OpenaiController {
  lastContext = '';
  constructor(private readonly openaiService: OpenaiService) {}
  @Get('completions')
  async completionsMessage(@Query() query, @Body() body, @Res() response) {
    const isStream = JSON.parse(
      query.stream == undefined || query.stream == 'false' ? 'false' : 'true',
    );
    if (isStream) {
      response.header('Content-Type', 'text/event-stream;charset=utf-8');
    } else {
      response.header('Content-Type', 'text/json;charset=utf-8');
    }
    const res = await this.openaiService.completionsMessage(
      query,
      response,
      isStream,
    );
    if (!isStream) {
      response.end(res);
    }
  }
  @Post('completions')
  async completionsPostMessage(@Body() body, @Res() response) {
    const isStream = JSON.parse(
      body.stream == undefined || body.stream == 'false' ? 'false' : 'true',
    );
    if (isStream) {
      response.header('Content-Type', 'text/event-stream;charset=utf-8');
    } else {
      response.header('Content-Type', 'text/json;charset=utf-8');
    }
    const res = await this.openaiService.completionsMessage(
      body,
      response,
      isStream,
    );
    if (!isStream) {
      response.end(res);
    }
  }
  @Get('chat')
  async chatGetMessage(@Query() query, @Res() response) {
    const isStream = JSON.parse(
      query.stream == undefined || query.stream == 'false' ? 'false' : 'true',
    );
    if (isStream) {
      response.header('Content-Type', 'text/event-stream;charset=utf-8');
    } else {
      response.header('Content-Type', 'text/json;charset=utf-8');
    }
    const res = await this.openaiService.chatMessage(query, response, isStream);
    if (!isStream) {
      response.end(res);
    }
  }
  @Post('chat')
  async chatPostMessage(@Body() body, @Res() response) {
    const isStream = JSON.parse(
      body.stream == undefined || body.stream == 'false' ? 'false' : 'true',
    );
    if (isStream) {
      response.header('Content-Type', 'text/event-stream;charset=utf-8');
    } else {
      response.header('Content-Type', 'text/json;charset=utf-8');
    }
    const res = await this.openaiService.chatMessage(body, response, isStream);
    if (!isStream) {
      response.end(res);
    }
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
function RenderReact(view: string) {
  throw new Error('Function not implemented.');
}
