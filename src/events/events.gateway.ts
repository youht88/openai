import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server, Socket } from 'socket.io';
import { OpenaiService } from 'src/openai/openai/openai.service';
import axios from 'axios';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  constructor(private readonly openaiService: OpenaiService) {}
  //private abortController = new AbortController();
  private socketIds = {};
  @WebSocketServer()
  server: Server;

  handleConnection(socket: Socket) {
    const cancelTokenSource = axios.CancelToken.source();
    this.socketIds[socket.id] = { cancelTokenSource };
    console.log(`Client connected: ${socket.id}`);
  }

  handleDisconnect(socket: Socket) {
    delete this.socketIds[socket.id];
    console.log(`Client disconnected: ${socket.id}`);
  }

  @SubscribeMessage('events')
  findAll(@MessageBody() data: any, @ConnectedSocket() socket: Socket) {
    return from([1, 2, 3]).pipe(
      map((item) => ({ event: 'events', data: item })),
    );
  }
  @SubscribeMessage('test')
  async test(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ): Promise<string> {
    console.log(`test ${client.id} start`);
    await this.openaiService.test(null, client);
    return 'ok';
  }
  @SubscribeMessage('cancel')
  async cancel(@MessageBody() data: any, @ConnectedSocket() socket: Socket) {
    //this.abortController.abort();
    this.socketIds[socket.id].cancelTokenSource?.cancel();
  }
  @SubscribeMessage('chat')
  async chat(
    @MessageBody() data: any,
    @ConnectedSocket() socket: Socket,
  ): Promise<string> {
    let others = {
      response: null,
      socket: socket,
      isStream: true,
      //abortController: this.abortController,
      cancelTokenSource: this.socketIds[socket.id].cancelTokenSource,
    };
    await this.openaiService.chatMessage(data, others);
    return 'ok';
  }
  @SubscribeMessage('identity')
  async identity(@MessageBody() data: number): Promise<number> {
    return data;
  }
}
