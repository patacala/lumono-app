import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

export interface StockUpdateEvent {
  productId: string;
  locationId?: string;
  type: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUSTMENT';
  quantity: number;
  timestamp: string;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  },
  namespace: '/stock',
})
export class StockGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(StockGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  emitStockUpdate(event: StockUpdateEvent) {
    this.server.emit('stock:updated', event);
  }

  emitLowStockAlert(productId: string, currentStock: number, threshold: number) {
    this.server.emit('stock:low-alert', {
      productId,
      currentStock,
      threshold,
      timestamp: new Date().toISOString(),
    });
  }
}
