import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = (): Socket => {
    if(!socket){
        const token = localStorage.getItem("token");
        socket = io(import.meta.env.VITE_SERVER_URL || "http://localhost:3001", {
            auth: {token},
            transports: ["websocket"],
        });
    }
    return socket;
};

export const disconnectSocket = () => {
    socket?.disconnect();
    socket = null;
};
