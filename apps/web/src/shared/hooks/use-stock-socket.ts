'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function useStockSocket() {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(`${SOCKET_URL}/stock`, {
      transports: ['websocket'],
      autoConnect: true,
    });

    socketRef.current = socket;

    socket.on('stock:updated', () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-movements'] });
      queryClient.invalidateQueries({ queryKey: ['stock'] });
      queryClient.invalidateQueries({ queryKey: ['today-stats'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    });

    socket.on('stock:low-alert', (data: { productName: string; stock: number; threshold: number }) => {
      toast.warning(`Stock bajo: ${data.productName} (${data.stock}/${data.threshold})`);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [queryClient]);
}
