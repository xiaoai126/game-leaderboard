// src/rank/rank.gateway.ts
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { RankService } from './rank.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RankGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly rankService: RankService) {
    this.rankService.setIo(this.server);
  }
}
