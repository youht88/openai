import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server } from 'socket.io';
import { OpenaiService } from 'src/openai/openai/openai.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  constructor(private readonly openaiService: OpenaiService) {}
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('events')
  findAll(@MessageBody() data: any): Observable<WsResponse<number>> {
    return from([1, 2, 3]).pipe(
      map((item) => ({ event: 'events', data: item })),
    );
  }
  @SubscribeMessage('test')
  async test(@MessageBody() data: any): Promise<string> {
    console.log('test start');
    await this.openaiService.test(null, this.server);
    return 'ok';
  }
  @SubscribeMessage('chat')
  async chat(@MessageBody() data: any): Promise<string> {
    let others = {
      response: null,
      socket: this.server,
      isStream: true,
    };
    await this.openaiService.chatMessage(data, others);
    return 'ok';
  }
  @SubscribeMessage('identity')
  async identity(@MessageBody() data: number): Promise<number> {
    return data;
  }
}
