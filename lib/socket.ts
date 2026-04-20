"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NEXT_PUBLIC_API_URL;

    if (!socketUrl) {
      throw new Error(
        "Socket URL is missing. Set NEXT_PUBLIC_SOCKET_URL or NEXT_PUBLIC_API_URL.",
      );
    }

    socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
    });
  }

  return socket;
};
